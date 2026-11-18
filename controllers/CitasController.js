
const CitasModel = require("../models/CitasModel");
const { enviarConfirmacion } = require("../services/correoService");
const { validationResult } = require("express-validator");

// ============================================
// FECHA ACTUAL DE MÉXICO
// ============================================

function obtenerFechaHoy() {
    const partes = new Intl.DateTimeFormat("en-CA", {
        timeZone: "America/Mexico_City",
        year: "numeric",
        month: "2-digit",
        day: "2-digit"
    }).formatToParts(new Date());

    const valores = {};

    partes.forEach(parte => {
        valores[parte.type] = parte.value;
    });

    return `${valores.year}-${valores.month}-${valores.day}`;
}

// ============================================
// VALIDAR FECHA Y HORA
// ============================================

function validarFechaHora(fecha, hora) {
    const hoy = obtenerFechaHoy();

    if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
        return "Selecciona una fecha válida.";
    }

    const [anio, mes, dia] = fecha.split("-").map(Number);

    const comprobacion = new Date(
        Date.UTC(anio, mes - 1, dia)
    );

    if (
        comprobacion.getUTCFullYear() !== anio ||
        comprobacion.getUTCMonth() !== mes - 1 ||
        comprobacion.getUTCDate() !== dia
    ) {
        return "La fecha seleccionada no es válida.";
    }

    if (fecha < hoy) {
        return "No puedes agendar citas en días anteriores a hoy.";
    }

    if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(hora)) {
        return "Selecciona una hora válida.";
    }

    if (hora < "07:00" || hora > "20:00") {
        return "El horario permitido es de 7:00 a. m. a 8:00 p. m.";
    }

    return null;
}

// ============================================
// GENERAR FOLIO
// ============================================

async function generarFolio(modelo) {
    const fechaActual = obtenerFechaHoy().replace(/-/g, "");
    const prefijo = `CT${fechaActual}`;

    const numeroMayor = await modelo.obtenerUltimoNumeroFolio(prefijo);

    return `${prefijo}-${String(numeroMayor + 1).padStart(3, "0")}`;
}

// ============================================
// ENVIAR CORREO EN SEGUNDO PLANO
// ============================================

function enviarCorreoEnSegundoPlano(cita) {
    setImmediate(async () => {
        try {
            console.log(
                `INICIANDO ENVIO DE CORREO A: ${cita.correo}`
            );

            const resultado = await enviarConfirmacion(cita);

            console.log(
                `CORREO ENVIADO CORRECTAMENTE A: ${cita.correo}`,
                resultado.messageId || ""
            );

        } catch (errorCorreo) {
            console.error(
                `ERROR AL ENVIAR CORREO A ${cita.correo}:`,
                errorCorreo.message || errorCorreo
            );
        }
    });
}

// ============================================
// MOSTRAR VISTA CON ERROR
// ============================================

async function mostrarError(
    res,
    modelo,
    mensaje,
    status = 400,
    editar = null,
    busqueda = ""
) {
    const datos = await modelo.obtener();

    return res.status(status).render("citas/citas", {
        datos,
        editar,
        error: mensaje,
        exito: "",
        busqueda
    });
}

// ============================================
// CONTROLADOR
// ============================================

class CitasController {

    // ========================================
    // MOSTRAR, GUARDAR Y ACTUALIZAR
    // ========================================

    async index(req, res) {
        const modelo = new CitasModel();

        try {

            // ====================================
            // GUARDAR O ACTUALIZAR
            // ====================================

            if (req.method === "POST") {

                const resultadoValidacion = validationResult(req);

                if (!resultadoValidacion.isEmpty()) {
                    const mensaje = resultadoValidacion
                        .array()
                        .map(error => error.msg)
                        .join(". ");

                    return await mostrarError(
                        res,
                        modelo,
                        mensaje,
                        400,
                        req.body
                    );
                }

                // LIMPIAR DATOS

                const folioActual = String(req.body.folio || "").trim();
                const nombre = String(req.body.nombre || "").trim();
                const apellido = String(req.body.apellido || "").trim();
                const correo = String(req.body.correo || "").trim().toLowerCase();
                const area = String(req.body.area || "").trim();
                const fecha = String(req.body.fecha || "").trim();
                const hora = String(req.body.hora || "").trim();

                // ====================================
                // VALIDAR CAMPOS OBLIGATORIOS
                // ====================================

                if (
                    !nombre ||
                    !apellido ||
                    !correo ||
                    !area ||
                    !fecha ||
                    !hora
                ) {
                    return await mostrarError(
                        res,
                        modelo,
                        "Completa todos los campos para registrar la cita.",
                        400,
                        req.body
                    );
                }

                // ====================================
                // VALIDAR FECHA Y HORA
                // ====================================

                const errorFechaHora = validarFechaHora(fecha, hora);

                if (errorFechaHora) {
                    return await mostrarError(
                        res,
                        modelo,
                        errorFechaHora,
                        400,
                        req.body
                    );
                }

                // ====================================
                // VALIDAR CORREO
                // ====================================

                const formatoCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

                if (!formatoCorreo.test(correo)) {
                    return await mostrarError(
                        res,
                        modelo,
                        "Ingresa un correo electrónico válido.",
                        400,
                        req.body
                    );
                }

                // ====================================
                // COMPROBAR HORARIO OCUPADO
                // ====================================

                const citaExistente = await modelo.buscarPorFechaHora(
                    fecha,
                    hora,
                    folioActual || null
                );

                if (citaExistente) {
                    return await mostrarError(
                        res,
                        modelo,
                        "Ya existe una cita registrada en esa fecha y hora. Selecciona otro horario.",
                        409,
                        req.body
                    );
                }

                // ====================================
                // GENERAR FOLIO
                // ====================================

                let folio = folioActual;

                if (!folioActual) {
                    folio = await generarFolio(modelo);
                }

                // ====================================
                // CONSTRUIR CITA
                // ====================================

                const cita = {
                    folio,
                    nombre,
                    apellido,
                    correo,
                    area,
                    fecha,
                    hora
                };

                // ====================================
                // ACTUALIZAR CITA
                // ====================================

                if (folioActual) {
                    const actualizada = await modelo.actualizar(
                        folioActual,
                        cita
                    );

                    if (!actualizada) {
                        return await mostrarError(
                            res,
                            modelo,
                            "No se encontró la cita que intentas actualizar.",
                            404,
                            req.body
                        );
                    }

                    console.log(
                        "CITA ACTUALIZADA CORRECTAMENTE:",
                        folio
                    );

                    return res.redirect("/citas?exito=actualizada");
                }

                // ====================================
                // GUARDAR CITA NUEVA EN MONGODB
                // ====================================

                await modelo.guardar(cita);

                console.log(
                    "CITA GUARDADA CORRECTAMENTE EN MONGODB:",
                    folio
                );

                // ====================================
                // PROGRAMAR CORREO DESPUÉS DE RESPONDER
                // ====================================

                try {
    console.log("ENVIANDO CORREO:", cita.correo);

    const resultado = await enviarConfirmacion(cita);

    console.log("CORREO ENVIADO:", resultado.messageId);

    return res.redirect("/citas?exito=registrada");

} catch (errorCorreo) {
    console.error("ERROR REAL DE CORREO:", errorCorreo);

    return res.redirect("/citas?exito=registrada&correo=error");
}

                // ====================================
                // RESPONDER INMEDIATAMENTE AL NAVEGADOR
                // ====================================

                return res.redirect("/citas?exito=registrada");
            }

            // ====================================
            // NO PERMITIR ELIMINAR CON GET
            // ====================================

            if (req.query.eliminar) {
                return res.status(405).send(
                    "Método no permitido. Utiliza el formulario de eliminación."
                );
            }

            // ====================================
            // CARGAR CITA PARA EDITAR
            // ====================================

            let editar = null;

            if (req.query.editar) {
                editar = await modelo.buscarPorFolio(
                    String(req.query.editar)
                );

                if (!editar) {
                    return await mostrarError(
                        res,
                        modelo,
                        "No se encontró la cita solicitada.",
                        404
                    );
                }
            }

            // ====================================
            // MOSTRAR CITAS
            // ====================================

            const datos = await modelo.obtener();

            console.log(
                "CITAS CONSULTADAS CORRECTAMENTE:",
                datos.length
            );

            const mensajesExito = {
                registrada: "La cita fue registrada correctamente.",
                actualizada: "La cita fue actualizada correctamente.",
                eliminada: "La cita fue eliminada correctamente."
            };

            const exito = mensajesExito[req.query.exito] || "";

            return res.render("citas/citas", {
                datos,
                editar,
                error: null,
                exito,
                busqueda: ""
            });

        } catch (error) {

            console.error(
                "ERROR EN CitasController.index:",
                error
            );

            // ERROR DE DUPLICIDAD

            if (error.code === 11000) {
                try {
                    return await mostrarError(
                        res,
                        modelo,
                        "El folio o el horario ya está registrado. Verifica los datos e intenta nuevamente.",
                        409,
                        req.body || null
                    );

                } catch (errorLectura) {
                    console.error(
                        "ERROR AL RECUPERAR LAS CITAS:",
                        errorLectura.message
                    );
                }
            }

            // ERROR GENERAL

            try {
                return await mostrarError(
                    res,
                    modelo,
                    "Ocurrió un error al procesar la cita. Intenta nuevamente.",
                    500,
                    req.body || null
                );

            } catch (errorVista) {
                console.error(
                    "NO SE PUDO CARGAR LA VISTA DE CITAS:",
                    errorVista.message
                );

                if (res.headersSent) {
                    return;
                }

                return res.status(500).send(
                    "Ocurrió un error al procesar las citas. Revisa los Logs de Node."
                );
            }
        }
    }

    // ========================================
    // ELIMINAR CITA
    // ========================================

    async eliminar(req, res) {
        const modelo = new CitasModel();

        try {
            const folio = String(req.body.folio || "").trim();

            if (!folio) {
                return await mostrarError(
                    res,
                    modelo,
                    "Debes indicar el folio de la cita.",
                    400
                );
            }

            const eliminada = await modelo.eliminar(folio);

            if (!eliminada || eliminada.deletedCount === 0) {
                return await mostrarError(
                    res,
                    modelo,
                    "No se encontró la cita que intentas eliminar.",
                    404
                );
            }

            console.log("CITA ELIMINADA:", folio);

            return res.redirect("/citas?exito=eliminada");

        } catch (error) {
            console.error(
                "ERROR AL ELIMINAR LA CITA:",
                error
            );

            try {
                return await mostrarError(
                    res,
                    modelo,
                    "No fue posible eliminar la cita. Intenta nuevamente.",
                    500
                );

            } catch (errorVista) {
                console.error(errorVista);

                if (res.headersSent) {
                    return;
                }

                return res.status(500).send(
                    "No fue posible eliminar la cita."
                );
            }
        }
    }

    // ========================================
    // BUSCAR CITAS
    // ========================================

    async buscar(req, res) {
        const modelo = new CitasModel();

        try {
            const resultadoValidacion = validationResult(req);

            if (!resultadoValidacion.isEmpty()) {
                const mensaje = resultadoValidacion
                    .array()
                    .map(error => error.msg)
                    .join(". ");

                return await mostrarError(
                    res,
                    modelo,
                    mensaje,
                    400,
                    null,
                    req.body.buscar || ""
                );
            }

            const valor = String(req.body.buscar || "").trim();

            const datos = await modelo.buscar(valor);

            return res.render("citas/citas", {
                datos,
                editar: null,
                error: null,
                exito: "",
                busqueda: valor
            });

        } catch (error) {
            console.error(
                "ERROR AL BUSCAR CITAS:",
                error
            );

            try {
                return await mostrarError(
                    res,
                    modelo,
                    "Ocurrió un error al buscar las citas.",
                    500,
                    null,
                    req.body.buscar || ""
                );

            } catch (errorVista) {
                console.error(errorVista);

                if (res.headersSent) {
                    return;
                }

                return res.status(500).send(
                    "Ocurrió un error al buscar las citas."
                );
            }
        }
    }

    // ========================================
    // GENERAR PDF
    // ========================================

    async pdf(req, res) {
        const modelo = new CitasModel();

        try {
            const datos = await modelo.obtener();

            const fecha = new Date().toLocaleDateString(
                "es-MX",
                {
                    timeZone: "America/Mexico_City",
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric"
                }
            );

            return res.render("citas/pdf", {
                datos,
                fecha
            });

        } catch (error) {
            console.error(
                "ERROR AL GENERAR EL PDF:",
                error
            );

            if (res.headersSent) {
                return;
            }

            return res.status(500).send(
                "No fue posible generar el reporte de citas."
            );
        }
    }
}

module.exports = CitasController;

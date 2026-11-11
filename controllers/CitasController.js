
const CitasModel = require("../models/CitasModel");
const { enviarConfirmacion } = require("../services/correoService");
const { validationResult } = require("express-validator");

class CitasController {

    // Mostrar citas, registrar una cita o editarla.
    async index(req, res) {
        const modelo = new CitasModel();

        console.log("Entró a CitasController.index:", req.method);

        try {
            // REGISTRAR O ACTUALIZAR
            if (req.method === "POST") {
                // Revisar los errores de express-validator,
                // si las rutas tienen validaciones configuradas.
                const resultadoValidacion = validationResult(req);

                if (!resultadoValidacion.isEmpty()) {
                    const datos = await modelo.obtener();

                    return res.status(400).render("citas/citas", {
                        datos,
                        editar: req.body,
                        error: resultadoValidacion
                            .array()
                            .map(e => e.msg)
                            .join(". ")
                    });
                }

                const fecha = String(req.body.fecha || "").trim();
                const hora = String(req.body.hora || "").trim();
                const folioActual = String(req.body.folio || "").trim();

                // Comprobar que el horario no esté ocupado.
                const citaExistente = await modelo.buscarPorFechaHora(
                    fecha,
                    hora,
                    folioActual || null
                );

                if (citaExistente) {
                    const datos = await modelo.obtener();

                    return res.status(409).render("citas/citas", {
                        datos,
                        editar: req.body,
                        error: "Ya existe una cita en esa fecha y hora."
                    });
                }

                // Generar folio para una cita nueva.
                let folio = folioActual;

                if (!folioActual) {
                    const ahora = new Date();

                    const fechaActual =
                        `${ahora.getFullYear()}${String(
                            ahora.getMonth() + 1
                        ).padStart(2, "0")}${String(
                            ahora.getDate()
                        ).padStart(2, "0")}`;

                    const prefijo = `CT${fechaActual}`;
                    const citas = await modelo.obtener();

                    let contador = 1;

                    for (const existente of citas) {
                        if (
                            existente.folio &&
                            existente.folio.startsWith(prefijo)
                        ) {
                            contador++;
                        }
                    }

                    folio = `${prefijo}-${String(contador).padStart(3, "0")}`;
                }

                // Construir únicamente los campos permitidos.
                const cita = {
                    folio,
                    nombre: String(req.body.nombre || "").trim(),
                    apellido: String(req.body.apellido || "").trim(),
                    correo: String(req.body.correo || "")
                        .trim()
                        .toLowerCase(),
                    area: String(req.body.area || "").trim(),
                    fecha,
                    hora
                };

                // ACTUALIZAR UNA CITA EXISTENTE
                if (folioActual) {
                    const actualizada = await modelo.actualizar(
                        folioActual,
                        cita
                    );

                    if (!actualizada) {
                        const datos = await modelo.obtener();

                        return res.status(404).render("citas/citas", {
                            datos,
                            editar: req.body,
                            error: "No se encontró la cita que intentas actualizar."
                        });
                    }
                } else {
                    // GUARDAR UNA CITA NUEVA
                    try {
                        await modelo.guardar(cita);
                    } catch (error) {
                        // Duplicidad de folio u otro índice único.
                        if (error.code === 11000) {
                            const datos = await modelo.obtener();

                            return res.status(409).render("citas/citas", {
                                datos,
                                editar: req.body,
                                error: "El folio o el horario ya está registrado."
                            });
                        }

                        throw error;
                    }

                    // El correo no debe impedir conservar una cita guardada.
                    try {
                        await enviarConfirmacion(cita);

                        console.log(
                            `Confirmación enviada a ${cita.correo}`
                        );
                    } catch (error) {
                        console.error(
                            "La cita se guardó, pero falló el correo:",
                            error.message
                        );
                    }
                }

                return res.redirect("/citas");
            }

            // No permitir eliminar citas mediante GET.
            // La eliminación se realiza en el método eliminar().
            if (req.query.eliminar) {
                return res.status(405).send(
                    "Método no permitido. Utiliza el formulario de eliminación."
                );
            }

            // CARGAR CITA PARA EDITAR
            let editar = null;

            if (req.query.editar) {
                const citas = await modelo.obtener();

                editar =
                    citas.find(
                        cita => cita.folio === String(req.query.editar)
                    ) || null;

                if (!editar) {
                    return res.status(404).send(
                        "No se encontró la cita solicitada."
                    );
                }
            }

            // MOSTRAR TODAS LAS CITAS
            console.log("Consultando citas en MongoDB...");

            const datos = await modelo.obtener();

            console.log("MongoDB respondió. Citas:", datos.length);
            console.log("Intentando mostrar la vista EJS");

            return res.render("citas/citas", {
                datos,
                editar,
                error: null
            });

        } catch (error) {
            console.error("Error en CitasController.index:", error);

            // Conflicto detectado por un índice único de MongoDB.
            if (error.code === 11000) {
                try {
                    const datos = await modelo.obtener();

                    return res.status(409).render("citas/citas", {
                        datos,
                        editar: req.body || null,
                        error: "El folio o el horario ya está registrado."
                    });
                } catch (errorLectura) {
                    console.error(
                        "Error al recuperar las citas:",
                        errorLectura.message
                    );
                }
            }

            return res.status(500).send(
                "Ocurrió un error al procesar las citas. Revisa la terminal de Node."
            );
        }
    }

    // ELIMINAR UNA CITA MEDIANTE POST.
    async eliminar(req, res) {
        const modelo = new CitasModel();

        try {
            const folio = String(req.body.folio || "").trim();

            if (!folio) {
                return res.status(400).send(
                    "Debes indicar el folio de la cita."
                );
            }

            const eliminada = await modelo.eliminar(folio);

            if (
                eliminada === false ||
                (eliminada && eliminada.deletedCount === 0)
            ) {
                return res.status(404).send(
                    "No se encontró la cita que intentas eliminar."
                );
            }

            return res.redirect("/citas");

        } catch (error) {
            console.error("Error al eliminar la cita:", error);

            return res.status(500).send(
                "No fue posible eliminar la cita."
            );
        }
    }

    // BUSCAR CITAS.
    async buscar(req, res) {
        const modelo = new CitasModel();

        try {
            const resultadoValidacion = validationResult(req);

            if (!resultadoValidacion.isEmpty()) {
                const datos = await modelo.obtener();

                return res.status(400).render("citas/citas", {
                    datos,
                    editar: null,
                    error: resultadoValidacion
                        .array()
                        .map(e => e.msg)
                        .join(". "),
                    busqueda: req.body.buscar || ""
                });
            }

            const valor = String(req.body.buscar || "").trim();
            const datos = await modelo.buscar(valor);

            return res.render("citas/citas", {
                datos,
                editar: null,
                error: null,
                busqueda: valor
            });

        } catch (error) {
            console.error("Error al buscar citas:", error);

            return res.status(500).send(
                "Ocurrió un error al buscar las citas."
            );
        }
    }

    // GENERAR LA VISTA PARA EL PDF.
    async pdf(req, res) {
        const modelo = new CitasModel();

        try {
            const datos = await modelo.obtener();

            const fecha = new Date().toLocaleDateString("es-MX", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric"
            });

            return res.render("citas/pdf", {
                datos,
                fecha
            });

        } catch (error) {
            console.error("Error al generar el PDF:", error);

            return res.status(500).send(
                "No fue posible generar el reporte de citas."
            );
        }
    }
}

module.exports = CitasController;

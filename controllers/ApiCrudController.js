
const mongoose = require("mongoose");

// Campos que pueden almacenarse en los cuatro módulos.
const CAMPOS_PERMITIDOS = [
    "folio",
    "nombre",
    "apellido",
    "curp",
    "sexo",
    "fecha_nacimiento",
    "domicilio",
    "telefono",
    "servicio"
];

// Escapar caracteres especiales para realizar búsquedas seguras.
function escaparRegex(texto) {
    return texto.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Obtener únicamente los campos permitidos.
function obtenerDatosPermitidos(datos, incluirFolio = true) {
    const resultado = {};

    for (const campo of CAMPOS_PERMITIDOS) {

        if (!incluirFolio && campo === "folio") {
            continue;
        }

        if (Object.prototype.hasOwnProperty.call(datos, campo)) {
            resultado[campo] = datos[campo];
        }
    }

    return resultado;
}

// Crear un controlador reutilizable para cada colección.
function crearCrudController(Modelo, nombreModulo) {

    return {

        // ========================================
        // OBTENER TODOS LOS REGISTROS
        // ========================================
        async obtener(req, res) {
            try {

                const datos = await Modelo.find()
                    .sort({ folio: 1 })
                    .lean();

                return res.status(200).json({
                    ok: true,
                    total: datos.length,
                    datos
                });

            } catch (error) {

                console.error(
                    `Error al consultar ${nombreModulo}:`,
                    error.message
                );

                return res.status(500).json({
                    ok: false,
                    mensaje: "No fue posible consultar los registros."
                });
            }
        },

        // ========================================
        // BUSCAR POR FOLIO O CURP
        // ========================================
        async buscar(req, res) {
            try {

                const valor = String(req.query.valor || "").trim();

                if (!valor) {
                    return res.status(400).json({
                        ok: false,
                        mensaje: "Debes proporcionar un valor de búsqueda."
                    });
                }

                const regex = new RegExp(
                    escaparRegex(valor),
                    "i"
                );

                const datos = await Modelo.find({
                    $or: [
                        { folio: regex },
                        { curp: regex }
                    ]
                })
                    .sort({ folio: 1 })
                    .lean();

                return res.status(200).json({
                    ok: true,
                    total: datos.length,
                    datos
                });

            } catch (error) {

                console.error(
                    `Error al buscar en ${nombreModulo}:`,
                    error.message
                );

                return res.status(500).json({
                    ok: false,
                    mensaje: "No fue posible realizar la búsqueda."
                });
            }
        },

        // ========================================
        // REGISTRAR UN NUEVO REGISTRO
        // ========================================
        async crear(req, res) {
            try {

                const datos = obtenerDatosPermitidos(
                    req.body || {}
                );

                if (
                    !datos.folio ||
                    typeof datos.folio !== "string" ||
                    !datos.folio.trim()
                ) {
                    return res.status(400).json({
                        ok: false,
                        mensaje: "El folio es obligatorio."
                    });
                }

                datos.folio = datos.folio.trim();

                const nuevoRegistro = new Modelo(datos);

                await nuevoRegistro.save();

                return res.status(201).json({
                    ok: true,
                    mensaje: "Registro creado correctamente.",
                    datos: nuevoRegistro
                });

            } catch (error) {

                if (error.code === 11000) {
                    return res.status(409).json({
                        ok: false,
                        mensaje: "El folio ya se encuentra registrado."
                    });
                }

                if (error.name === "ValidationError") {
                    return res.status(400).json({
                        ok: false,
                        mensaje: "Los datos proporcionados no son válidos."
                    });
                }

                console.error(
                    `Error al registrar en ${nombreModulo}:`,
                    error.message
                );

                return res.status(500).json({
                    ok: false,
                    mensaje: "No fue posible registrar la información."
                });
            }
        },

        // ========================================
        // ACTUALIZAR UN REGISTRO POR FOLIO
        // ========================================
        async actualizar(req, res) {
            try {

                const folio = String(req.params.folio || "").trim();

                if (!folio) {
                    return res.status(400).json({
                        ok: false,
                        mensaje: "Debes proporcionar el folio."
                    });
                }

                const datos = obtenerDatosPermitidos(
                    req.body || {},
                    false
                );

                if (Object.keys(datos).length === 0) {
                    return res.status(400).json({
                        ok: false,
                        mensaje: "No se proporcionaron datos para actualizar."
                    });
                }

                const actualizado = await Modelo.findOneAndUpdate(
                    { folio },
                    { $set: datos },
                    {
                        new: true,
                        runValidators: true
                    }
                );

                if (!actualizado) {
                    return res.status(404).json({
                        ok: false,
                        mensaje: "No se encontró el registro solicitado."
                    });
                }

                return res.status(200).json({
                    ok: true,
                    mensaje: "Registro actualizado correctamente.",
                    datos: actualizado
                });

            } catch (error) {

                if (error.code === 11000) {
                    return res.status(409).json({
                        ok: false,
                        mensaje: "Ya existe un registro con esos datos."
                    });
                }

                if (error.name === "ValidationError") {
                    return res.status(400).json({
                        ok: false,
                        mensaje: "Los datos proporcionados no son válidos."
                    });
                }

                console.error(
                    `Error al actualizar ${nombreModulo}:`,
                    error.message
                );

                return res.status(500).json({
                    ok: false,
                    mensaje: "No fue posible actualizar el registro."
                });
            }
        },

        // ========================================
        // ELIMINAR UN REGISTRO POR FOLIO
        // ========================================
        async eliminar(req, res) {
            try {

                const folio = String(req.params.folio || "").trim();

                if (!folio) {
                    return res.status(400).json({
                        ok: false,
                        mensaje: "Debes proporcionar el folio."
                    });
                }

                const resultado = await Modelo.deleteOne({
                    folio
                });

                if (resultado.deletedCount === 0) {
                    return res.status(404).json({
                        ok: false,
                        mensaje: "No se encontró el registro solicitado."
                    });
                }

                return res.status(200).json({
                    ok: true,
                    mensaje: "Registro eliminado correctamente."
                });

            } catch (error) {

                console.error(
                    `Error al eliminar de ${nombreModulo}:`,
                    error.message
                );

                return res.status(500).json({
                    ok: false,
                    mensaje: "No fue posible eliminar el registro."
                });
            }
        }
    };
}

module.exports = crearCrudController;

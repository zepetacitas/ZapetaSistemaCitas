
const mongoose = require("mongoose");

const PacienteSchema = new mongoose.Schema(
    {
        folio: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },
        nombre: {
            type: String,
            required: true,
            trim: true
        },
        apellido: {
            type: String,
            required: true,
            trim: true
        },
        curp: {
            type: String,
            required: true,
            trim: true,
            uppercase: true
        },
        sexo: {
            type: String,
            required: true,
            trim: true
        },
        fecha_nacimiento: {
            type: String,
            required: true,
            trim: true
        },
        domicilio: {
            type: String,
            required: true,
            trim: true
        },
        telefono: {
            type: String,
            required: true,
            trim: true
        },
        servicio: {
            type: String,
            required: true,
            trim: true
        }
    },
    {
        collection: "pacientes",
        versionKey: false
    }
);

module.exports = mongoose.model("Paciente", PacienteSchema);

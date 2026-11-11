
const mongoose = require("mongoose");

const CitaSchema = new mongoose.Schema(
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
        correo: {
            type: String,
            required: true,
            trim: true,
            lowercase: true
        },
        area: {
            type: String,
            required: true,
            trim: true
        },
        fecha: {
            type: String,
            required: true,
            trim: true
        },
        hora: {
            type: String,
            required: true,
            trim: true
        },
        recordatorioEnviado: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true,
        collection: "citas"
    }
);

// Evita que dos citas tengan la misma fecha y hora.
CitaSchema.index(
    { fecha: 1, hora: 1 },
    { unique: true }
);

const Cita = mongoose.model("Cita", CitaSchema);

// Escapa caracteres especiales para que la búsqueda no interprete
// el texto introducido por el usuario como una expresión regular.
function escaparRegex(texto) {
    return texto.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

class CitasModel {

    async obtener() {
        return await Cita.find()
            .sort({ fecha: 1, hora: 1 })
            .lean();
    }

    async guardar(nuevo) {
        const cita = new Cita(nuevo);
        return await cita.save();
    }

    async eliminar(folio) {
        return await Cita.deleteOne({ folio });
    }

    async actualizar(folio, nuevo) {
        return await Cita.findOneAndUpdate(
            { folio },
            {
                $set: {
                    nombre: nuevo.nombre,
                    apellido: nuevo.apellido,
                    correo: nuevo.correo,
                    area: nuevo.area,
                    fecha: nuevo.fecha,
                    hora: nuevo.hora
                }
            },
            {
                new: true,
                runValidators: true
            }
        );
    }

    async buscar(valor) {
        const texto = String(valor || "").trim();

        if (!texto) {
            return await this.obtener();
        }

        const regex = new RegExp(escaparRegex(texto), "i");

        return await Cita.find({
            $or: [
                { folio: regex },
                { nombre: regex },
                { apellido: regex },
                { area: regex }
            ]
        })
            .sort({ fecha: 1, hora: 1 })
            .lean();
    }

    async buscarPorFechaHora(fecha, hora, folioExcluir = null) {
        const filtro = { fecha, hora };

        if (folioExcluir) {
            filtro.folio = { $ne: folioExcluir };
        }

        return await Cita.findOne(filtro).lean();
    }

    async obtenerPendientesRecordatorio(fecha) {
        return await Cita.find({
            fecha,
            $or: [
                { recordatorioEnviado: false },
                { recordatorioEnviado: { $exists: false } }
            ]
        }).lean();
    }

    async marcarRecordatorioEnviado(folio) {
        return await Cita.updateOne(
            { folio },
            {
                $set: { recordatorioEnviado: true }
            }
        );
    }
}

module.exports = CitasModel;

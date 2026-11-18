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

// Impide registrar dos citas en la misma fecha y hora.
CitaSchema.index(
    { fecha: 1, hora: 1 },
    { unique: true, name: "indice_fecha_hora_unico" }
);

const Cita = mongoose.model("Cita", CitaSchema);

// Escapar caracteres especiales para búsquedas.
function escaparRegex(texto) {
    return texto.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

class CitasModel {

    // Obtener todas las citas ordenadas por fecha y hora.
    async obtener() {
        return Cita.find()
            .sort({ fecha: 1, hora: 1 })
            .lean();
    }

    // Buscar una cita directamente por folio.
    async buscarPorFolio(folio) {
        return Cita.findOne({ folio }).lean();
    }

    // Obtener el número de folio más alto de un día.
    // Evita descargar todas las citas de la colección.
    async obtenerUltimoNumeroFolio(prefijo) {

        const regex = new RegExp(
            "^" + escaparRegex(prefijo) + "-\\d+$"
        );

        const citas = await Cita.find({
            folio: regex
        })
            .select({ folio: 1, _id: 0 })
            .lean();

        let numeroMayor = 0;

        for (const cita of citas) {

            const coincidencia = cita.folio.match(/-(\d+)$/);

            if (!coincidencia) continue;

            const numero = Number(coincidencia[1]);

            if (
                Number.isInteger(numero) &&
                numero > numeroMayor
            ) {
                numeroMayor = numero;
            }
        }

        return numeroMayor;
    }

    // Guardar una cita nueva.
    async guardar(nuevo) {
        const cita = new Cita(nuevo);
        return cita.save();
    }

    // Eliminar por folio.
    async eliminar(folio) {
        return Cita.deleteOne({ folio });
    }

    // Actualizar una cita.
    async actualizar(folio, nuevo) {

        return Cita.findOneAndUpdate(
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

    // Buscar por folio, nombre, apellido o área.
    async buscar(valor) {

        const texto = String(valor || "").trim();

        if (!texto) {
            return this.obtener();
        }

        const regex = new RegExp(escaparRegex(texto), "i");

        return Cita.find({
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

    // Comprobar si una fecha y hora ya están ocupadas.
    async buscarPorFechaHora(fecha, hora, folioExcluir = null) {

        const filtro = { fecha, hora };

        if (folioExcluir) {
            filtro.folio = { $ne: folioExcluir };
        }

        return Cita.findOne(filtro).lean();
    }

    // Obtener citas pendientes de recordatorio.
    async obtenerPendientesRecordatorio(fecha) {

        return Cita.find({
            fecha,
            $or: [
                { recordatorioEnviado: false },
                { recordatorioEnviado: { $exists: false } }
            ]
        }).lean();
    }

    // Marcar recordatorio como enviado.
    async marcarRecordatorioEnviado(folio) {

        return Cita.updateOne(
            { folio },
            {
                $set: { recordatorioEnviado: true }
            }
        );
    }
}

module.exports = CitasModel;
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
        area: {
            type: String,
            required: true,
            trim: true
        },
        fecha: {
            type: String,
            required: true
        },
        hora: {
            type: String,
            required: true
        }
    },
    {
        timestamps: true,
        collection: "citas"
    }
);

CitaSchema.index(
    {
        fecha: 1,
        hora: 1
    },
    {
        unique: true
    }
);


const Cita = mongoose.model("Cita", CitaSchema);

class CitasModel {

    async obtener() {

        return await Cita
            .find()
            .sort({
                fecha: 1,
                hora: 1
            })
            .lean();
    }

    async guardar(nuevo) {

        const cita = new Cita(nuevo);

        return await cita.save();
    }

    async eliminar(folio) {

        return await Cita.deleteOne({
            folio: folio
        });
    }

    async actualizar(folio, nuevo) {

        return await Cita.findOneAndUpdate(
            {
                folio: folio
            },
            nuevo,
            {
                new: true,
                runValidators: true
            }
        );
    }

    async buscar(valor) {

        if (!valor || !valor.trim()) {

            return await this.obtener();
        }

        return await Cita
            .find({
                $or: [

                    {
                        folio: {
                            $regex: valor,
                            $options: "i"
                        }
                    },

                    {
                        nombre: {
                            $regex: valor,
                            $options: "i"
                        }
                    },

                    {
                        apellido: {
                            $regex: valor,
                            $options: "i"
                        }
                    },

                    {
                        area: {
                            $regex: valor,
                            $options: "i"
                        }
                    }

                ]
            })
            .sort({
                fecha: 1,
                hora: 1
            })
            .lean();
    }
    async buscarPorFechaHora(fecha, hora, folioExcluir = null) {

        const filtro = {
            fecha: fecha,
            hora: hora
        };

        if (folioExcluir) {

            filtro.folio = {
                $ne: folioExcluir
            };
        }

        return await Cita
            .findOne(filtro)
            .lean();
    }

}

module.exports = CitasModel;
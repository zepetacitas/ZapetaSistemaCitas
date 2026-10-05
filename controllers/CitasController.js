const CitasModel = require("../models/CitasModel");

class CitasController {

    async index(req, res) {

        const modelo = new CitasModel();

        if (req.method === "POST") {

            const fecha = req.body.fecha || "";
            const hora = req.body.hora || "";
            const folioActual = req.body.folio || "";

            const citaExistente =
                await modelo.buscarPorFechaHora(
                    fecha,
                    hora,
                    folioActual
                );

            if (citaExistente) {

                const datos = await modelo.obtener();

                return res.render(
                    "citas/citas",
                    {
                        datos,
                        editar: req.body,
                        error: "Ya existe una cita en esa fecha y hora"
                    }
                );
            }

            let folio;


            if (folioActual) {

                // Estamos editando
                folio = folioActual;

            } else {

                const ahora = new Date();

                const year =
                    ahora.getFullYear();

                const month =
                    String(
                        ahora.getMonth() + 1
                    ).padStart(2, "0");

                const day =
                    String(
                        ahora.getDate()
                    ).padStart(2, "0");


                const fechaActual =
                    `${year}${month}${day}`;


                const prefijo =
                    `CT${fechaActual}`;


                const citas =
                    await modelo.obtener();


                let contador = 1;


                for (const cita of citas) {

                    if (
                        cita.folio &&
                        cita.folio.startsWith(prefijo)
                    ) {

                        contador++;
                    }
                }


                folio =
                    `${prefijo}-${String(contador).padStart(3, "0")}`;
            }
            const cita = {

                folio,

                nombre:
                    req.body.nombre || "",

                apellido:
                    req.body.apellido || "",

                area:
                    req.body.area || "",

                fecha,

                hora
            };

            if (folioActual) {

                await modelo.actualizar(
                    folio,
                    cita
                );

            }

            else {

                try {

                    await modelo.guardar(cita);

                } catch (error) {

                    // MongoDB detectó un horario duplicado
                    if (error.code === 11000) {

                        const datos =
                            await modelo.obtener();

                        return res.render(
                            "citas/citas",
                            {
                                datos,
                                editar: req.body,
                                error: "Ya existe una cita en esa fecha y hora"
                            }
                        );
                    }

                    throw error;
                }
            }



            return res.redirect("/citas");
        }


        if (req.query.eliminar) {

            await modelo.eliminar(
                req.query.eliminar
            );

            return res.redirect("/citas");
        }

        let editar = null;


        if (req.query.editar) {

            const citas =
                await modelo.obtener();


            for (const cita of citas) {

                if (
                    cita.folio ===
                    req.query.editar
                ) {

                    editar = cita;

                    break;
                }
            }
        }

        const datos =
            await modelo.obtener();


        return res.render(
            "citas/citas",
            {
                datos,
                editar,
                error: null
            }
        );
    }

    async buscar(req, res) {

        const modelo =
            new CitasModel();


        const valor =
            req.body.buscar || "";


        const datos =
            await modelo.buscar(valor);


        return res.render(
            "citas/citas",
            {
                datos,
                editar: null,
                error: null,
                busqueda: valor
            }
        );
    }

    async pdf(req, res) {

        const modelo =
            new CitasModel();


        const datos =
            await modelo.obtener();


        const fecha =
            new Date().toLocaleDateString(
                "es-MX",
                {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric"
                }
            );


        return res.render(
            "citas/pdf",
            {
                datos,
                fecha
            }
        );
    }

}


module.exports = CitasController;
const CitasModel = require("../models/CitasModel");
const {
    enviarConfirmacion
} = require("../services/correoService");
class CitasController {

    async index(req, res) {
    const modelo = new CitasModel();
    console.log("Entró a CitasController.index:", req.method);

    try {
        if (req.method === "POST") {
            const fecha = req.body.fecha || "";
            const hora = req.body.hora || "";
            const folioActual = req.body.folio || "";

            const citaExistente = await modelo.buscarPorFechaHora(
                fecha,
                hora,
                folioActual
            );

            if (citaExistente) {
                const datos = await modelo.obtener();
                return res.render("citas/citas", {
                    datos,
                    editar: req.body,
                    error: "Ya existe una cita en esa fecha y hora"
                });
            }

            let folio = folioActual;

            if (!folioActual) {
                const ahora = new Date();
                const fechaActual =
                    `${ahora.getFullYear()}${String(ahora.getMonth() + 1).padStart(2, "0")}${String(ahora.getDate()).padStart(2, "0")}`;

                const prefijo = `CT${fechaActual}`;
                const citas = await modelo.obtener();

                let contador = 1;
                for (const existente of citas) {
                    if (existente.folio && existente.folio.startsWith(prefijo)) {
                        contador++;
                    }
                }

                folio = `${prefijo}-${String(contador).padStart(3, "0")}`;
            }

            const cita = {
                folio,
                nombre: (req.body.nombre || "").trim(),
                apellido: (req.body.apellido || "").trim(),
                correo: (req.body.correo || "").trim().toLowerCase(),
                area: (req.body.area || "").trim(),
                fecha,
                hora
            };

            if (folioActual) {
                await modelo.actualizar(folio, cita);
            } else {
                try {
                    await modelo.guardar(cita);
                } catch (error) {
                    if (error.code === 11000) {
                        const datos = await modelo.obtener();
                        return res.render("citas/citas", {
                            datos,
                            editar: req.body,
                            error: "Ya existe una cita en esa fecha y hora"
                        });
                    }
                    throw error;
                }

                try {
                    await enviarConfirmacion(cita);
                    console.log(`Confirmación enviada a ${cita.correo}`);
                } catch (error) {
                    console.error("La cita se guardó, pero falló el correo:", error.message);
                }
            }

            return res.redirect("/citas");
        }

        if (req.query.eliminar) {
            await modelo.eliminar(req.query.eliminar);
            return res.redirect("/citas");
        }

        let editar = null;

        if (req.query.editar) {
            const citas = await modelo.obtener();
            editar = citas.find(cita => cita.folio === req.query.editar) || null;
        }

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
        return res.status(500).send("Ocurrió un error al cargar el módulo de citas. Revisa la terminal de Node.");
    }
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

const cron = require("node-cron");
const { DateTime } = require("luxon");

const CitasModel = require("../models/CitasModel");
const {
    enviarRecordatorio
} = require("./correoService");

function iniciarRecordatorios() {
    cron.schedule(
        "0 9 * * *",
        async () => {
            console.log("Revisando citas para recordatorios...");

            try {
                const fechaManana = DateTime.now()
                    .setZone("America/Mexico_City")
                    .plus({ days: 1 })
                    .toISODate();

                const modelo = new CitasModel();

                const citas =
                    await modelo.obtenerPendientesRecordatorio(
                        fechaManana
                    );

                for (const cita of citas) {
                    try {
                        await enviarRecordatorio(cita);

                        await modelo.marcarRecordatorioEnviado(
                            cita.folio
                        );

                        console.log(
                            `Recordatorio enviado: ${cita.folio}`
                        );
                    } catch (error) {
                        console.error(
                            `Error en recordatorio ${cita.folio}:`,
                            error.message
                        );
                    }
                }
            } catch (error) {
                console.error(
                    "Error al revisar recordatorios:",
                    error.message
                );
            }
        },
        {
            timezone: "America/Mexico_City"
        }
    );

    console.log(
        "Recordatorios programados para las 09:00, hora de Ciudad de México"
    );
}

module.exports = { iniciarRecordatorios };

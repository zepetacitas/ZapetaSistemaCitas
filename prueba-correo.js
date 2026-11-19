require("dotenv").config();

const { enviarConfirmacion } = require("./services/correoService");

async function probarCorreo() {
    try {
        console.log("==============================");
        console.log(" PRUEBA GMAIL API - ZEPETA");
        console.log("==============================");

        const citaPrueba = {
            folio: "TEST-001",
            nombre: "Paciente de prueba",
            apellido: "Zepeta",
            area: "Prueba del sistema",
            fecha: "20/11/2026",
            hora: "10:00 AM",
            correo: process.env.GMAIL_EMAIL
        };

        console.log("Enviando correo de prueba...");

        const resultado = await enviarConfirmacion(citaPrueba);

        console.log("\nCORREO ENVIADO CORRECTAMENTE");
        console.log("ID:", resultado.id);
        console.log("Destinatario:", process.env.GMAIL_EMAIL);

    } catch (error) {
        console.error("\nERROR AL ENVIAR:");
        console.error(error.message);

        if (error.response?.data) {
            console.error(JSON.stringify(error.response.data, null, 2));
        }
    }
}

probarCorreo();
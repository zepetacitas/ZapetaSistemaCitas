const { BrevoClient } = require("@getbrevo/brevo");

console.log("========================================");
console.log("INICIANDO SERVICIO DE CORREO BREVO");
console.log("========================================");

console.log(
    "BREVO_API_KEY:",
    process.env.BREVO_API_KEY ? "CONFIGURADO" : "NO CONFIGURADO"
);

console.log(
    "BREVO_EMAIL:",
    process.env.BREVO_EMAIL || "NO CONFIGURADO"
);

const brevo = new BrevoClient({
    apiKey: process.env.BREVO_API_KEY
});


function escaparHTML(valor = "") {
    return String(valor).replace(/[&<>"']/g, caracter => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    }[caracter]));
}


async function enviarCorreo({
    destinatario,
    asunto,
    texto,
    html
}) {

    if (!process.env.BREVO_API_KEY) {
        throw new Error(
            "Falta configurar BREVO_API_KEY en las variables de entorno."
        );
    }

    if (!process.env.BREVO_EMAIL) {
        throw new Error(
            "Falta configurar BREVO_EMAIL en las variables de entorno."
        );
    }

    if (!destinatario) {
        throw new Error(
            "No se recibió un correo de destinatario."
        );
    }

    console.log("----------------------------------------");
    console.log("ENVIANDO CORREO MEDIANTE BREVO");
    console.log("REMITENTE:", process.env.BREVO_EMAIL);
    console.log("DESTINATARIO:", destinatario);
    console.log("ASUNTO:", asunto);

    try {

        const respuesta =
            await brevo.transactionalEmails.sendTransacEmail({

                sender: {
                    name: "Sistema Zepeta",
                    email: process.env.BREVO_EMAIL
                },

                to: [
                    {
                        email: destinatario
                    }
                ],

                subject: asunto,

                textContent: texto,

                htmlContent: html
            });


        console.log("CORREO ENVIADO CORRECTAMENTE POR BREVO");

        console.log(
            "MESSAGE ID:",
            respuesta.messageId
        );

        console.log("----------------------------------------");

        return respuesta;

    } catch (error) {

        console.error("----------------------------------------");
        console.error("ERROR AL ENVIAR CORREO CON BREVO");
        console.error("----------------------------------------");

        console.error(
            "MENSAJE:",
            error.message
        );

        if (error.statusCode) {
            console.error(
                "STATUS CODE:",
                error.statusCode
            );
        }

        if (error.rawResponse) {
            console.error(
                "RESPUESTA DE BREVO:",
                error.rawResponse
            );
        }

        console.error("----------------------------------------");

        throw error;
    }
}


/**
 * ENVÍO DE CONFIRMACIÓN DE CITA
 */
async function enviarConfirmacion(cita) {

    console.log("========================================");
    console.log("INICIANDO CONFIRMACIÓN DE CITA");
    console.log("FOLIO:", cita.folio);
    console.log("DESTINATARIO:", cita.correo);
    console.log("========================================");


    const nombreCompleto =
        `${cita.nombre || ""} ${cita.apellido || ""}`.trim();


    const html = `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">

    <title>Confirmación de cita</title>
</head>

<body style="
    margin:0;
    padding:0;
    background:#f4f4f4;
    font-family:Arial,Helvetica,sans-serif;
">

    <div style="
        max-width:600px;
        margin:30px auto;
        background:white;
        padding:30px;
        border-radius:10px;
    ">

        <h1 style="
            text-align:center;
            color:#333;
        ">
            Confirmación de cita
        </h1>


        <p>
            Hola <strong>${escaparHTML(nombreCompleto)}</strong>,
        </p>


        <p>
            Tu cita ha sido registrada correctamente.
        </p>


        <hr>


        <h3>Datos de la cita</h3>


        <p>
            <strong>Folio:</strong>
            ${escaparHTML(cita.folio)}
        </p>


        <p>
            <strong>Área:</strong>
            ${escaparHTML(cita.area)}
        </p>


        <p>
            <strong>Fecha:</strong>
            ${escaparHTML(cita.fecha)}
        </p>


        <p>
            <strong>Hora:</strong>
            ${escaparHTML(cita.hora)}
        </p>


        <hr>


        <p style="
            text-align:center;
            color:#666;
            font-size:13px;
        ">
            Sistema Zepeta
        </p>

    </div>

</body>
</html>
`;


    const texto = `
CONFIRMACIÓN DE CITA

Hola ${nombreCompleto}.

Tu cita ha sido registrada correctamente.

Folio: ${cita.folio}
Área: ${cita.area}
Fecha: ${cita.fecha}
Hora: ${cita.hora}

Sistema Zepeta
`;


    return enviarCorreo({

        destinatario: cita.correo,

        asunto:
            `Confirmación de cita ${cita.folio}`,

        texto,

        html

    });
}


/**
 * ENVÍO DE RECORDATORIO
 */
async function enviarRecordatorio(cita) {

    const nombreCompleto =
        `${cita.nombre || ""} ${cita.apellido || ""}`.trim();


    const html = `
<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
</head>

<body>

    <h2>Recordatorio de cita</h2>

    <p>
        Hola <strong>${escaparHTML(nombreCompleto)}</strong>.
    </p>

    <p>
        Te recordamos que tienes una cita programada.
    </p>

    <p>
        <strong>Folio:</strong>
        ${escaparHTML(cita.folio)}
    </p>

    <p>
        <strong>Área:</strong>
        ${escaparHTML(cita.area)}
    </p>

    <p>
        <strong>Fecha:</strong>
        ${escaparHTML(cita.fecha)}
    </p>

    <p>
        <strong>Hora:</strong>
        ${escaparHTML(cita.hora)}
    </p>

    <br>

    <p>
        Sistema Zepeta
    </p>

</body>

</html>
`;


    const texto = `
RECORDATORIO DE CITA

Hola ${nombreCompleto}.

Te recordamos que tienes una cita programada.

Folio: ${cita.folio}
Área: ${cita.area}
Fecha: ${cita.fecha}
Hora: ${cita.hora}

Sistema Zepeta
`;


    return enviarCorreo({

        destinatario: cita.correo,

        asunto:
            `Recordatorio de cita ${cita.folio}`,

        texto,

        html

    });
}


module.exports = {
    enviarConfirmacion,
    enviarRecordatorio
};
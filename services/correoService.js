
const { BrevoClient } = require("@getbrevo/brevo");

const URL_FONDO_CORREO =
    "https://zapetasistemacitas-1.onrender.com/img/fondo-correo-zepeta.png";

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
        throw new Error("Falta configurar BREVO_API_KEY.");
    }

    if (!process.env.BREVO_EMAIL) {
        throw new Error("Falta configurar BREVO_EMAIL.");
    }

    if (!destinatario) {
        throw new Error("No se recibió un correo de destinatario.");
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
                    name: "Consultorio de Servicios para la Mujer ZEPETA",
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
        console.log("MESSAGE ID:", respuesta.messageId);
        console.log("----------------------------------------");

        return respuesta;

    } catch (error) {
        console.error("----------------------------------------");
        console.error("ERROR AL ENVIAR CORREO CON BREVO");
        console.error("MENSAJE:", error.message);

        if (error.statusCode) {
            console.error("STATUS CODE:", error.statusCode);
        }

        if (error.rawResponse) {
            console.error("RESPUESTA DE BREVO:", error.rawResponse);
        }

        console.error("----------------------------------------");

        throw error;
    }
}

function crearPlantillaCorreo(cita, tipo) {

    const esRecordatorio = tipo === "recordatorio";

    const nombreCompleto =
        `${cita.nombre || ""} ${cita.apellido || ""}`.trim();

    const nombre = escaparHTML(nombreCompleto || "Usuario");
    const folio = escaparHTML(cita.folio || "");
    const area = escaparHTML(cita.area || "");
    const fecha = escaparHTML(cita.fecha || "");
    const hora = escaparHTML(cita.hora || "");

    const titulo = esRecordatorio
        ? "Recordatorio de cita"
        : "Confirmación de cita";

    const mensaje = esRecordatorio
        ? "Te recordamos que tienes una cita programada con nosotros. Te esperamos."
        : "Tu cita ha sido registrada correctamente. Nos alegra que hayas elegido nuestros servicios.";

    const html = `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${titulo}</title>
</head>

<body style="
    margin:0;
    padding:0;
    background-color:#f8f5f6;
    font-family:Arial,Helvetica,sans-serif;
">

    <table
        role="presentation"
        width="100%"
        cellpadding="0"
        cellspacing="0"
        border="0"
        style="background-color:#f8f5f6;padding:20px 8px;"
    >
        <tr>
            <td align="center">

                <table
                    role="presentation"
                    width="600"
                    cellpadding="0"
                    cellspacing="0"
                    border="0"
                    background="${URL_FONDO_CORREO}"
                    style="
                        width:100%;
                        max-width:600px;
                        background-color:#ffffff;
                        background-image:url('${URL_FONDO_CORREO}');
                        background-repeat:no-repeat;
                        background-position:center top;
                        background-size:100% 100%;
                        border-collapse:collapse;
                    "
                >

                    <tr>
                        <td style="
                            padding:230px 38px 55px;
                            color:#383038;
                            font-size:15px;
                            line-height:1.6;
                        ">

                            <h1 style="
                                color:#67194f;
                                text-align:center;
                                font-size:25px;
                                margin:0 0 25px;
                            ">
                                ${titulo}
                            </h1>

                            <p>
                                Hola <strong>${nombre}</strong>:
                            </p>

                            <p style="text-align:justify;">
                                ${mensaje}
                            </p>

                            <h2 style="
                                color:#80502b;
                                font-size:19px;
                                text-align:center;
                                margin-top:30px;
                                margin-bottom:18px;
                            ">
                                Datos de tu cita
                            </h2>

                            <table
                                role="presentation"
                                width="100%"
                                cellpadding="10"
                                cellspacing="0"
                                border="0"
                                style="
                                    background-color:#ffffff;
                                    border:1px solid #e8dce4;
                                    border-collapse:collapse;
                                    font-size:14px;
                                "
                            >
                                <tr>
                                    <td style="border-bottom:1px solid #eadfe5;">
                                        <strong style="color:#67194f;">Folio:</strong>
                                    </td>
                                    <td style="border-bottom:1px solid #eadfe5;">
                                        ${folio}
                                    </td>
                                </tr>

                                <tr>
                                    <td style="border-bottom:1px solid #eadfe5;">
                                        <strong style="color:#67194f;">Área:</strong>
                                    </td>
                                    <td style="border-bottom:1px solid #eadfe5;">
                                        ${area}
                                    </td>
                                </tr>

                                <tr>
                                    <td style="border-bottom:1px solid #eadfe5;">
                                        <strong style="color:#67194f;">Fecha:</strong>
                                    </td>
                                    <td style="border-bottom:1px solid #eadfe5;">
                                        ${fecha}
                                    </td>
                                </tr>

                                <tr>
                                    <td>
                                        <strong style="color:#67194f;">Hora:</strong>
                                    </td>
                                    <td>
                                        ${hora}
                                    </td>
                                </tr>
                            </table>

                            <p style="
                                text-align:center;
                                margin-top:30px;
                            ">
                                Gracias por confiar en nosotros.
                            </p>

                            <p style="
                                text-align:center;
                                color:#67194f;
                                font-size:17px;
                                font-weight:bold;
                                margin-bottom:5px;
                            ">
                                ZEPETA
                            </p>

                            <p style="
                                text-align:center;
                                color:#777777;
                                font-size:12px;
                                margin-top:0;
                            ">
                                Consultorio de Servicios para la Mujer
                            </p>

                        </td>
                    </tr>

                </table>

            </td>
        </tr>
    </table>

</body>
</html>
`;

    const texto = `
${titulo.toUpperCase()}

Hola ${nombreCompleto}.

${mensaje}

DATOS DE TU CITA

Folio: ${cita.folio || ""}
Área: ${cita.area || ""}
Fecha: ${cita.fecha || ""}
Hora: ${cita.hora || ""}

Consultorio de Servicios para la Mujer ZEPETA.
`;

    return {
        html,
        texto,
        nombreCompleto
    };
}

async function enviarConfirmacion(cita) {

    console.log("========================================");
    console.log("INICIANDO CONFIRMACIÓN DE CITA");
    console.log("FOLIO:", cita.folio);
    console.log("DESTINATARIO:", cita.correo);
    console.log("========================================");

    const { html, texto } =
        crearPlantillaCorreo(cita, "confirmacion");

    return enviarCorreo({
        destinatario: cita.correo,
        asunto: `Confirmación de cita ${cita.folio}`,
        texto,
        html
    });
}

async function enviarRecordatorio(cita) {

    console.log("========================================");
    console.log("INICIANDO RECORDATORIO DE CITA");
    console.log("FOLIO:", cita.folio);
    console.log("DESTINATARIO:", cita.correo);
    console.log("========================================");

    const { html, texto } =
        crearPlantillaCorreo(cita, "recordatorio");

    return enviarCorreo({
        destinatario: cita.correo,
        asunto: `Recordatorio de cita ${cita.folio}`,
        texto,
        html
    });
}

module.exports = {
    enviarConfirmacion,
    enviarRecordatorio
};

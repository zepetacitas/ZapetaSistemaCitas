
const { BrevoClient } = require("@getbrevo/brevo");

const URL_FONDO_CORREO =
    "https://zapetasistemacitas-1.onrender.com/img/fondo-correo-zepeta.png";

const brevo = new BrevoClient({
    apiKey: process.env.BREVO_API_KEY
});

console.log("========================================");
console.log("INICIANDO SERVICIO DE CORREO BREVO");
console.log("BREVO_API_KEY:", process.env.BREVO_API_KEY ? "CONFIGURADO" : "NO CONFIGURADO");
console.log("BREVO_EMAIL:", process.env.BREVO_EMAIL || "NO CONFIGURADO");
console.log("========================================");

function escaparHTML(valor = "") {
    return String(valor).replace(/[&<>"']/g, caracter => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    }[caracter]));
}

async function enviarCorreo({ destinatario, asunto, texto, html }) {

    if (!process.env.BREVO_API_KEY) {
        throw new Error("Falta configurar BREVO_API_KEY.");
    }

    if (!process.env.BREVO_EMAIL) {
        throw new Error("Falta configurar BREVO_EMAIL.");
    }

    if (!destinatario) {
        throw new Error("No se recibió un correo de destinatario.");
    }

    try {
        console.log("ENVIANDO CORREO MEDIANTE BREVO");
        console.log("DESTINATARIO:", destinatario);
        console.log("ASUNTO:", asunto);

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

        console.log("CORREO ENVIADO CORRECTAMENTE");
        console.log("MESSAGE ID:", respuesta.messageId);

        return respuesta;

    } catch (error) {
        console.error("ERROR AL ENVIAR CORREO:", error.message);

        if (error.statusCode) {
            console.error("STATUS CODE:", error.statusCode);
        }

        if (error.rawResponse) {
            console.error("RESPUESTA:", error.rawResponse);
        }

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
    <meta name="color-scheme" content="light">
    <meta name="supported-color-schemes" content="light">

    <title>${titulo}</title>

    <style>
        body {
            margin: 0;
            padding: 0;
            width: 100%;
            background-color: #f2f2f2;
            font-family: Arial, Helvetica, sans-serif;
            color: #000000;
        }

        table {
            border-collapse: collapse;
        }

        .contenedor {
            width: 100%;
            max-width: 600px;
            background-color: #ffffff;
        }

        .imagen-zepeta {
            display: block;
            width: 100%;
            max-width: 600px;
            height: auto;
            border: 0;
            outline: none;
        }

        .contenido {
            padding: 30px 38px;
            color: #000000;
            font-size: 15px;
            line-height: 1.7;
        }

        .titulo {
            color: #000000;
            font-size: 25px;
            text-align: center;
            margin: 0 0 25px;
            font-weight: bold;
        }

        .subtitulo {
            color: #000000;
            font-size: 19px;
            text-align: center;
            margin: 28px 0 18px;
        }

        .tabla-datos {
            width: 100%;
            background-color: #ffffff;
            border: 1px solid #cccccc;
            color: #000000;
            font-size: 14px;
        }

        .tabla-datos td {
            padding: 12px 10px;
            border-bottom: 1px solid #dddddd;
            color: #000000;
            text-align: left;
            overflow-wrap: anywhere;
        }

        .etiqueta {
            font-weight: bold;
            color: #000000;
            width: 35%;
        }

        .despedida {
            text-align: center;
            color: #000000;
            margin-top: 28px;
        }

        .marca {
            text-align: center;
            color: #000000;
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 5px;
        }

        .pie {
            text-align: center;
            color: #000000;
            font-size: 12px;
            margin-top: 0;
        }

        @media only screen and (max-width: 600px) {

            .contenedor {
                width: 100% !important;
            }

            .imagen-zepeta {
                width: 100% !important;
                max-width: 100% !important;
                height: auto !important;
            }

            .contenido {
                padding: 23px 16px !important;
                font-size: 14px !important;
            }

            .titulo {
                font-size: 21px !important;
            }

            .subtitulo {
                font-size: 17px !important;
            }

            .tabla-datos {
                font-size: 13px !important;
            }

            .tabla-datos td {
                padding: 10px 7px !important;
            }
        }
    </style>
</head>

<body>

    <table
        role="presentation"
        width="100%"
        cellpadding="0"
        cellspacing="0"
        border="0"
        style="width:100%;background-color:#f2f2f2;"
    >
        <tr>
            <td align="center" style="padding:15px 5px;">

                <table
                    role="presentation"
                    class="contenedor"
                    width="600"
                    cellpadding="0"
                    cellspacing="0"
                    border="0"
                    style="
                        width:100%;
                        max-width:600px;
                        background-color:#ffffff;
                        border:1px solid #e0e0e0;
                    "
                >

                    <tr>
                        <td style="padding:0;margin:0;">
                            <img
                                src="${URL_FONDO_CORREO}"
                                alt="Consultorio de Servicios para la Mujer ZEPETA"
                                width="600"
                                class="imagen-zepeta"
                                style="
                                    display:block;
                                    width:100%;
                                    max-width:600px;
                                    height:auto;
                                    border:0;
                                "
                            >
                        </td>
                    </tr>

                    <tr>
                        <td class="contenido"
                            style="
                                padding:30px 38px;
                                color:#000000;
                                font-family:Arial,Helvetica,sans-serif;
                            "
                        >

                            <h1 class="titulo"
                                style="color:#000000;text-align:center;">
                                ${titulo}
                            </h1>

                            <p style="color:#000000;">
                                Hola <strong>${nombre}</strong>:
                            </p>

                            <p style="
                                color:#000000;
                                text-align:justify;
                            ">
                                ${mensaje}
                            </p>

                            <h2 class="subtitulo"
                                style="color:#000000;text-align:center;">
                                Datos de tu cita
                            </h2>

                            <table
                                role="presentation"
                                class="tabla-datos"
                                width="100%"
                                cellpadding="0"
                                cellspacing="0"
                                border="0"
                                style="
                                    width:100%;
                                    background-color:#ffffff;
                                    border:1px solid #cccccc;
                                    color:#000000;
                                "
                            >

                                <tr>
                                    <td class="etiqueta"
                                        style="color:#000000;font-weight:bold;">
                                        Folio:
                                    </td>
                                    <td style="color:#000000;">
                                        ${folio}
                                    </td>
                                </tr>

                                <tr>
                                    <td class="etiqueta"
                                        style="color:#000000;font-weight:bold;">
                                        Área:
                                    </td>
                                    <td style="color:#000000;">
                                        ${area}
                                    </td>
                                </tr>

                                <tr>
                                    <td class="etiqueta"
                                        style="color:#000000;font-weight:bold;">
                                        Fecha:
                                    </td>
                                    <td style="color:#000000;">
                                        ${fecha}
                                    </td>
                                </tr>

                                <tr>
                                    <td class="etiqueta"
                                        style="color:#000000;font-weight:bold;border-bottom:0;">
                                        Hora:
                                    </td>
                                    <td style="color:#000000;border-bottom:0;">
                                        ${hora}
                                    </td>
                                </tr>

                            </table>

                            <p class="despedida"
                               style="color:#000000;text-align:center;">
                                Gracias por confiar en nosotros.
                            </p>

                            <p class="marca"
                               style="color:#000000;text-align:center;">
                                ZEPETA
                            </p>

                            <p class="pie"
                               style="color:#000000;text-align:center;">
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

    return { html, texto };
}

async function enviarConfirmacion(cita) {

    console.log("INICIANDO CONFIRMACIÓN DE CITA");
    console.log("FOLIO:", cita.folio);
    console.log("DESTINATARIO:", cita.correo);

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

    console.log("INICIANDO RECORDATORIO DE CITA");
    console.log("FOLIO:", cita.folio);
    console.log("DESTINATARIO:", cita.correo);

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

const { google } = require("googleapis");

console.log("========================================");
console.log("INICIANDO SERVICIO DE CORREO GMAIL");
console.log("========================================");

// =====================================================
// VARIABLES DE ENTORNO
// =====================================================

const CLIENT_ID = process.env.GMAIL_CLIENT_ID;
const CLIENT_SECRET = process.env.GMAIL_CLIENT_SECRET;
const REFRESH_TOKEN = process.env.GMAIL_REFRESH_TOKEN;
const GMAIL_EMAIL = process.env.GMAIL_EMAIL;

console.log("GMAIL_CLIENT_ID:", CLIENT_ID ? "CONFIGURADO" : "FALTANTE");
console.log(
    "GMAIL_CLIENT_SECRET:",
    CLIENT_SECRET ? "CONFIGURADO" : "FALTANTE"
);
console.log(
    "GMAIL_REFRESH_TOKEN:",
    REFRESH_TOKEN ? "CONFIGURADO" : "FALTANTE"
);
console.log(
    "GMAIL_EMAIL:",
    GMAIL_EMAIL ? GMAIL_EMAIL : "FALTANTE"
);

// =====================================================
// VALIDACIÓN DE VARIABLES
// =====================================================

if (!CLIENT_ID) {
    console.error("ERROR: Falta GMAIL_CLIENT_ID");
}

if (!CLIENT_SECRET) {
    console.error("ERROR: Falta GMAIL_CLIENT_SECRET");
}

if (!REFRESH_TOKEN) {
    console.error("ERROR: Falta GMAIL_REFRESH_TOKEN");
}

if (!GMAIL_EMAIL) {
    console.error("ERROR: Falta GMAIL_EMAIL");
}

// =====================================================
// OAUTH2
// =====================================================

const oauth2Client = new google.auth.OAuth2(
    CLIENT_ID,
    CLIENT_SECRET
);

oauth2Client.setCredentials({
    refresh_token: REFRESH_TOKEN
});

// =====================================================
// GMAIL API
// =====================================================

const gmail = google.gmail({
    version: "v1",
    auth: oauth2Client
});

// =====================================================
// ESCAPAR HTML
// =====================================================

function escaparHTML(valor = "") {
    return String(valor).replace(
        /[&<>"']/g,
        caracter => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        }[caracter])
    );
}

// =====================================================
// DATOS DE LA CITA
// =====================================================

function datosCita(cita) {
    return `
        <p><strong>Folio:</strong> ${escaparHTML(cita.folio)}</p>
        <p><strong>Paciente:</strong> ${escaparHTML(cita.nombre)} ${escaparHTML(cita.apellido)}</p>
        <p><strong>Área:</strong> ${escaparHTML(cita.area)}</p>
        <p><strong>Fecha:</strong> ${escaparHTML(cita.fecha)}</p>
        <p><strong>Hora:</strong> ${escaparHTML(cita.hora)}</p>
    `;
}

// =====================================================
// BASE64 URL SAFE
// =====================================================

function codificarBase64URL(texto) {
    return Buffer.from(texto, "utf8")
        .toString("base64")
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/g, "");
}

// =====================================================
// CONSTRUIR CORREO
// =====================================================

function construirCorreo({
    destinatario,
    asunto,
    texto,
    html
}) {

    if (!GMAIL_EMAIL) {
        throw new Error(
            "Falta configurar GMAIL_EMAIL en Render."
        );
    }

    if (!destinatario) {
        throw new Error(
            "La cita no tiene correo del destinatario."
        );
    }

    const asuntoCodificado =
        `=?UTF-8?B?${Buffer.from(
            asunto,
            "utf8"
        ).toString("base64")}?=`;

    const boundary =
        "SistemaZepeta_" + Date.now();

    const mensaje = [
        `From: Sistema Zepeta <${GMAIL_EMAIL}>`,
        `To: ${destinatario}`,
        `Subject: ${asuntoCodificado}`,
        "MIME-Version: 1.0",
        `Content-Type: multipart/alternative; boundary="${boundary}"`,
        "",
        `--${boundary}`,
        'Content-Type: text/plain; charset="UTF-8"',
        "Content-Transfer-Encoding: base64",
        "",
        Buffer.from(texto, "utf8").toString("base64"),
        "",
        `--${boundary}`,
        'Content-Type: text/html; charset="UTF-8"',
        "Content-Transfer-Encoding: base64",
        "",
        Buffer.from(html, "utf8").toString("base64"),
        "",
        `--${boundary}--`,
        ""
    ].join("\r\n");

    return codificarBase64URL(mensaje);
}

// =====================================================
// PRUEBA DE AUTENTICACIÓN
// =====================================================

async function comprobarGmail() {

    console.log("");
    console.log("========================================");
    console.log("PRUEBA DE AUTENTICACIÓN GMAIL");
    console.log("========================================");

    try {

        console.log("Solicitando token de acceso a Google...");

        const tokenResponse =
            await oauth2Client.getAccessToken();

        if (!tokenResponse || !tokenResponse.token) {

            throw new Error(
                "Google no devolvió un Access Token."
            );
        }

        console.log(
            "OAuth2 CORRECTO: Google entregó un Access Token."
        );

        console.log(
            "Comprobando acceso a la cuenta de Gmail..."
        );

        const perfil =
            await gmail.users.getProfile({
                userId: "me"
            });

        console.log(
            "ACCESO A GMAIL CORRECTO."
        );

        console.log(
            "Cuenta autenticada:",
            perfil.data.emailAddress
        );

        console.log("========================================");
        console.log("AUTENTICACIÓN GMAIL CORRECTA");
        console.log("========================================");

        return true;

    } catch (error) {

        console.error("");
        console.error("========================================");
        console.error("ERROR EN AUTENTICACIÓN GMAIL");
        console.error("========================================");

        console.error(
            "Mensaje:",
            error.message
        );

        console.error(
            "Código:",
            error.code || "SIN CÓDIGO"
        );

        if (error.response?.data) {

            console.error(
                "Respuesta de Google:"
            );

            console.error(
                JSON.stringify(
                    error.response.data,
                    null,
                    2
                )
            );
        }

        console.error("========================================");

        throw error;
    }
}

// =====================================================
// ENVIAR CORREO
// =====================================================

async function enviarCorreo({
    destinatario,
    asunto,
    texto,
    html
}) {

    console.log("");
    console.log("========================================");
    console.log("INICIANDO ENVÍO DE CORREO");
    console.log("========================================");

    console.log(
        "Remitente:",
        GMAIL_EMAIL
    );

    console.log(
        "Destinatario:",
        destinatario
    );

    console.log(
        "Asunto:",
        asunto
    );

    try {

        // -------------------------------------------------
        // 1. COMPROBAR AUTENTICACIÓN
        // -------------------------------------------------

        await comprobarGmail();

        // -------------------------------------------------
        // 2. CONSTRUIR MENSAJE
        // -------------------------------------------------

        console.log(
            "Construyendo mensaje MIME..."
        );

        const raw = construirCorreo({
            destinatario,
            asunto,
            texto,
            html
        });

        console.log(
            "Mensaje MIME construido correctamente."
        );

        console.log(
            "Tamaño del mensaje:",
            raw.length,
            "caracteres"
        );

        // -------------------------------------------------
        // 3. ENVIAR A GMAIL
        // -------------------------------------------------

        console.log(
            "Enviando mensaje mediante Gmail API..."
        );

        const respuesta =
            await gmail.users.messages.send({
                userId: "me",
                requestBody: {
                    raw
                }
            });

        // -------------------------------------------------
        // 4. ÉXITO
        // -------------------------------------------------

        console.log("");
        console.log("========================================");
        console.log("CORREO ENVIADO CORRECTAMENTE");
        console.log("========================================");

        console.log(
            "ID DE GMAIL:",
            respuesta.data.id
        );

        console.log(
            "THREAD ID:",
            respuesta.data.threadId
        );

        console.log("========================================");

        return respuesta.data;

    } catch (error) {

        console.error("");
        console.error("========================================");
        console.error("ERROR REAL AL ENVIAR CORREO");
        console.error("========================================");

        console.error(
            "Mensaje:",
            error.message
        );

        console.error(
            "Código:",
            error.code || "SIN CÓDIGO"
        );

        console.error(
            "Estado HTTP:",
            error.response?.status || "SIN ESTADO"
        );

        if (error.response?.data) {

            console.error("");
            console.error(
                "RESPUESTA COMPLETA DE GOOGLE:"
            );

            console.error(
                JSON.stringify(
                    error.response.data,
                    null,
                    2
                )
            );
        }

        if (error.errors) {

            console.error("");
            console.error(
                "ERRORES ADICIONALES:"
            );

            console.error(
                JSON.stringify(
                    error.errors,
                    null,
                    2
                )
            );
        }

        console.error("========================================");

        throw error;
    }
}

// =====================================================
// CONFIRMACIÓN DE CITA
// =====================================================

async function enviarConfirmacion(cita) {

    console.log("");
    console.log("########################################");
    console.log("CONFIRMACIÓN DE CITA");
    console.log("########################################");

    console.log(
        "Folio:",
        cita.folio
    );

    console.log(
        "Paciente:",
        cita.nombre,
        cita.apellido
    );

    console.log(
        "Correo:",
        cita.correo
    );

    const html = `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:20px;color:#333">

            <h2 style="color:#198754">
                ¡Tu cita se registró correctamente!
            </h2>

            <p>
                Hola ${escaparHTML(cita.nombre)},
                hemos registrado tu cita en Sistema Zepeta.
            </p>

            ${datosCita(cita)}

            <p>
                Conserva tu folio para futuras consultas.
            </p>

        </div>
    `;

    const texto =
        `Hola ${cita.nombre}, tu cita se registró correctamente.\n\n` +
        `Folio: ${cita.folio}\n` +
        `Área: ${cita.area}\n` +
        `Fecha: ${cita.fecha}\n` +
        `Hora: ${cita.hora}\n\n` +
        `Conserva tu folio para futuras consultas.`;

    return enviarCorreo({
        destinatario: cita.correo,
        asunto: `Confirmación de cita ${cita.folio}`,
        texto,
        html
    });
}

// =====================================================
// RECORDATORIO
// =====================================================

async function enviarRecordatorio(cita) {

    const html = `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:20px;color:#333">

            <h2 style="color:#0d6efd">
                Recordatorio de cita
            </h2>

            <p>
                Hola ${escaparHTML(cita.nombre)},
                te recordamos que tienes una cita programada próximamente.
            </p>

            ${datosCita(cita)}

            <p>
                ¡Te esperamos!
            </p>

        </div>
    `;

    const texto =
        `Hola ${cita.nombre}, te recordamos que tienes una cita programada próximamente.\n\n` +
        `Folio: ${cita.folio}\n` +
        `Área: ${cita.area}\n` +
        `Fecha: ${cita.fecha}\n` +
        `Hora: ${cita.hora}\n\n` +
        `¡Te esperamos!`;

    return enviarCorreo({
        destinatario: cita.correo,
        asunto: `Recordatorio de tu cita ${cita.folio}`,
        texto,
        html
    });
}

// =====================================================
// EXPORTACIONES
// =====================================================

module.exports = {
    enviarConfirmacion,
    enviarRecordatorio,
    comprobarGmail
};
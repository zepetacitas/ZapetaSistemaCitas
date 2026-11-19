const { google } = require("googleapis");

// ============================================
// AUTENTICACIÓN GMAIL API
// ============================================

const oauth2Client = new google.auth.OAuth2(
    process.env.GMAIL_CLIENT_ID,
    process.env.GMAIL_CLIENT_SECRET
);

oauth2Client.setCredentials({
    refresh_token: process.env.GMAIL_REFRESH_TOKEN
});

const gmail = google.gmail({
    version: "v1",
    auth: oauth2Client
});

// ============================================
// UTILIDADES
// ============================================

function escaparHTML(valor = "") {
    return String(valor).replace(/[&<>"']/g, caracter => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    }[caracter]));
}

function datosCita(cita) {
    return `
        <p><strong>Folio:</strong> ${escaparHTML(cita.folio)}</p>
        <p><strong>Paciente:</strong> ${escaparHTML(cita.nombre)} ${escaparHTML(cita.apellido)}</p>
        <p><strong>Área:</strong> ${escaparHTML(cita.area)}</p>
        <p><strong>Fecha:</strong> ${escaparHTML(cita.fecha)}</p>
        <p><strong>Hora:</strong> ${escaparHTML(cita.hora)}</p>
    `;
}

// ============================================
// CONSTRUIR MENSAJE MIME
// ============================================

function codificarBase64URL(texto) {
    return Buffer.from(texto, "utf8")
        .toString("base64")
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/g, "");
}

function construirCorreo({ destinatario, asunto, texto, html }) {
    const remitente = process.env.GMAIL_EMAIL;

    if (!remitente) {
        throw new Error("Falta configurar GMAIL_EMAIL en las variables de entorno.");
    }

    if (!destinatario) {
        throw new Error("La cita no tiene correo del destinatario.");
    }

    const asuntoCodificado = `=?UTF-8?B?${Buffer.from(asunto, "utf8").toString("base64")}?=`;

    const boundary = "SistemaZepeta_" + Date.now();

    const mensaje = [
        `From: Sistema Zepeta <${remitente}>`,
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

// ============================================
// ENVIAR CORREO POR GMAIL API
// ============================================

async function enviarCorreo({ destinatario, asunto, texto, html }) {
    const raw = construirCorreo({
        destinatario,
        asunto,
        texto,
        html
    });

    const respuesta = await gmail.users.messages.send({
        userId: "me",
        requestBody: { raw }
    });

    console.log("Correo enviado por Gmail API:", respuesta.data.id);

    return respuesta.data;
}

// ============================================
// CONFIRMACIÓN DE CITA
// ============================================

async function enviarConfirmacion(cita) {
    const html = `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:20px;color:#333">
            <h2 style="color:#198754">¡Tu cita se registró correctamente!</h2>
            <p>Hola ${escaparHTML(cita.nombre)}, hemos registrado tu cita en Sistema Zepeta.</p>
            ${datosCita(cita)}
            <p>Conserva tu folio para futuras consultas.</p>
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

// ============================================
// RECORDATORIO DE CITA
// ============================================

async function enviarRecordatorio(cita) {
    const html = `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:20px;color:#333">
            <h2 style="color:#0d6efd">Recordatorio de cita</h2>
            <p>Hola ${escaparHTML(cita.nombre)}, te recordamos que tienes una cita programada próximamente.</p>
            ${datosCita(cita)}
            <p>¡Te esperamos!</p>
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

// ============================================
// EXPORTAR
// ============================================

module.exports = {
    enviarConfirmacion,
    enviarRecordatorio
};
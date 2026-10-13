const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Verificar conexión con Gmail
async function verificarCorreo() {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        throw new Error("Faltan EMAIL_USER o EMAIL_PASS en el archivo .env");
    }

    await transporter.verify();
    console.log("Servicio de correo Gmail listo");
}

// Enviar confirmación de cita
async function enviarConfirmacion(cita) {
    return transporter.sendMail({
        from: `"Sistema Zepeta" <${process.env.EMAIL_USER}>`,
        to: cita.correo,
        subject: "Confirmación de cita - Sistema Zepeta",
        text: `Hola ${cita.nombre}. Tu cita está confirmada para el ${cita.fecha} a las ${cita.hora}. Folio: ${cita.folio}.`,
        html: `
            <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:25px;border:1px solid #ddd;border-radius:12px;">
                <h2 style="color:#2563eb;">Sistema Zepeta</h2>
                <h3>¡Tu cita ha sido registrada!</h3>
                <p>Hola <strong>${cita.nombre} ${cita.apellido}</strong>,</p>
                <p>Tu cita se registró correctamente.</p>
                <hr>
                <p><strong>Folio:</strong> ${cita.folio}</p>
                <p><strong>Área:</strong> ${cita.area}</p>
                <p><strong>Fecha:</strong> ${cita.fecha}</p>
                <p><strong>Hora:</strong> ${cita.hora}</p>
                <hr>
                <p>Gracias por utilizar el Sistema Zepeta.</p>
            </div>
        `
    });
}

// Enviar recordatorio de cita
async function enviarRecordatorio(cita) {
    return transporter.sendMail({
        from: `"Sistema Zepeta" <${process.env.EMAIL_USER}>`,
        to: cita.correo,
        subject: "Recordatorio de cita - Sistema Zepeta",
        text: `Hola ${cita.nombre}. Te recordamos tu cita para mañana, ${cita.fecha}, a las ${cita.hora}. Folio: ${cita.folio}.`,
        html: `
            <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:25px;border:1px solid #ddd;border-radius:12px;">
                <h2 style="color:#2563eb;">Sistema Zepeta</h2>
                <h3>Recordatorio de tu cita</h3>
                <p>Hola <strong>${cita.nombre} ${cita.apellido}</strong>,</p>
                <p>Te recordamos que tienes una cita programada para mañana.</p>
                <hr>
                <p><strong>Folio:</strong> ${cita.folio}</p>
                <p><strong>Área:</strong> ${cita.area}</p>
                <p><strong>Fecha:</strong> ${cita.fecha}</p>
                <p><strong>Hora:</strong> ${cita.hora}</p>
                <hr>
                <p>Gracias por utilizar el Sistema Zepeta.</p>
            </div>
        `
    });
}

module.exports = {
    transporter,
    verificarCorreo,
    enviarConfirmacion,
    enviarRecordatorio
};


const { transporter } = require("../config/correo");

function datosCita(cita) {
    return `
        <p><strong>Folio:</strong> ${cita.folio}</p>
        <p><strong>Paciente:</strong> ${cita.nombre} ${cita.apellido}</p>
        <p><strong>Área:</strong> ${cita.area}</p>
        <p><strong>Fecha:</strong> ${cita.fecha}</p>
        <p><strong>Hora:</strong> ${cita.hora}</p>
    `;
}

async function enviarConfirmacion(cita) {
    return transporter.sendMail({
        from: {
            name: "Sistema Zepeta",
            address: process.env.EMAIL_USER
        },
        to: cita.correo,
        subject: `Confirmación de cita ${cita.folio}`,
        text:
            `Hola ${cita.nombre}, tu cita se registró correctamente.\n` +
            `Folio: ${cita.folio}\n` +
            `Área: ${cita.area}\n` +
            `Fecha: ${cita.fecha}\n` +
            `Hora: ${cita.hora}`,
        html: `
            <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto">
                <h2>¡Tu cita se registró correctamente!</h2>
                <p>Hola ${cita.nombre}, hemos registrado tu cita en Sistema Zepeta.</p>
                ${datosCita(cita)}
                <p>Conserva tu folio para futuras consultas.</p>
            </div>
        `
    });
}

async function enviarRecordatorio(cita) {
    return transporter.sendMail({
        from: {
            name: "Sistema Zepeta",
            address: process.env.EMAIL_USER
        },
        to: cita.correo,
        subject: `Recordatorio de tu cita ${cita.folio}`,
        text:
            `Hola ${cita.nombre}, te recordamos tu próxima cita.\n` +
            `Folio: ${cita.folio}\n` +
            `Área: ${cita.area}\n` +
            `Fecha: ${cita.fecha}\n` +
            `Hora: ${cita.hora}`,
        html: `
            <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto">
                <h2>Recordatorio de cita</h2>
                <p>Hola ${cita.nombre}, te recordamos que tienes una cita programada para mañana.</p>
                ${datosCita(cita)}
                <p>¡Te esperamos!</p>
            </div>
        `
    });
}

module.exports = {
    enviarConfirmacion,
    enviarRecordatorio
};

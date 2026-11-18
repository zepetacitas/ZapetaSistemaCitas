
const crypto = require("crypto");

function verificarApiKey(req, res, next) {

    const claveConfigurada = process.env.API_SHARED_KEY;
    const claveRecibida = req.get("x-api-key");

    // Verificar que exista la clave del servidor
    if (!claveConfigurada) {
        console.error("API_SHARED_KEY no está configurada.");

        return res.status(500).json({
            ok: false,
            mensaje: "Error de configuración del servidor."
        });
    }

    // Verificar que PHP haya enviado una clave
    if (!claveRecibida) {
        return res.status(401).json({
            ok: false,
            mensaje: "Acceso no autorizado."
        });
    }

    const claveServidor = Buffer.from(
        claveConfigurada,
        "utf8"
    );

    const claveCliente = Buffer.from(
        claveRecibida,
        "utf8"
    );

    // Comparar las claves de forma segura
    if (
        claveServidor.length !== claveCliente.length ||
        !crypto.timingSafeEqual(
            claveServidor,
            claveCliente
        )
    ) {
        return res.status(401).json({
            ok: false,
            mensaje: "Acceso no autorizado."
        });
    }

    // La clave es válida: continuar
    next();
}

module.exports = verificarApiKey;


const express = require("express");
const { rateLimit } = require("express-rate-limit");
const CitasController = require("../controllers/CitasController");

const router = express.Router();
const controller = new CitasController();

// Limita las operaciones de escritura para reducir solicitudes abusivas.
const limiteEscritura = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        error: "Demasiadas solicitudes. Intenta nuevamente en 15 minutos."
    }
});

// Mostrar y consultar las citas.
router.get(
    "/",
    controller.index.bind(controller)
);

// Registrar o actualizar una cita.
router.post(
    "/",
    limiteEscritura,
    controller.index.bind(controller)
);

// Buscar citas por folio o nombre.
router.post(
    "/buscar",
    limiteEscritura,
    controller.buscar.bind(controller)
);

// Generar el reporte de citas.
router.get(
    "/pdf",
    controller.pdf.bind(controller)
);

// Eliminar una cita mediante POST.
router.post(
    "/eliminar",
    limiteEscritura,
    controller.eliminar.bind(controller)
);

module.exports = router;

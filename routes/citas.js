const express = require("express");

const router = express.Router();

const CitasController =
    require("../controllers/CitasController");

const controller =
    new CitasController();


router.get(
    "/",
    controller.index.bind(controller)
);


router.post(
    "/",
    controller.index.bind(controller)
);

router.post(
    "/buscar",
    controller.buscar.bind(controller)
);


router.get(
    "/pdf",
    controller.pdf.bind(controller)
);


module.exports = router;
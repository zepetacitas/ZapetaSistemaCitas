
const express = require("express");
const router = express.Router();

const Socio = require("../models/Socio");
const crearCrudController = require("../controllers/ApiCrudController");
const verificarApiKey = require("../middleware/verificarApiKey");

const controlador = crearCrudController(Socio, "Socios");

router.use(verificarApiKey);

router.get("/", controlador.obtener);
router.get("/buscar", controlador.buscar);
router.post("/", controlador.crear);
router.put("/:folio", controlador.actualizar);
router.delete("/:folio", controlador.eliminar);

module.exports = router;


const express = require("express");
const router = express.Router();

const Paciente = require("../models/Paciente");
const crearCrudController = require("../controllers/ApiCrudController");
const verificarApiKey = require("../middleware/verificarApiKey");

const controlador = crearCrudController(Paciente, "Pacientes");

router.use(verificarApiKey);

router.get("/", controlador.obtener);
router.get("/buscar", controlador.buscar);
router.post("/", controlador.crear);
router.put("/:folio", controlador.actualizar);
router.delete("/:folio", controlador.eliminar);

module.exports = router;

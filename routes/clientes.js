
const express = require("express");
const router = express.Router();

const Cliente = require("../models/Cliente");
const crearCrudController = require("../controllers/ApiCrudController");
const verificarApiKey = require("../middleware/verificarApiKey");

const controlador = crearCrudController(Cliente, "Clientes");

// Proteger todas las operaciones de esta ruta.
router.use(verificarApiKey);

router.get("/", controlador.obtener);
router.get("/buscar", controlador.buscar);
router.post("/", controlador.crear);
router.put("/:folio", controlador.actualizar);
router.delete("/:folio", controlador.eliminar);

module.exports = router;

const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../middleware/authMiddleware");
const boletasController = require("../controllers/boletasController");

/**
 * @swagger
 * /api/boletas/{alumno_id}/descargar-pdf:
 *   get:
 *     summary: Generar y descargar la boleta en formato PDF
 *     tags: [Boletas]
 *     security:
 *       - bearerAuth: []
 */
router.get("/:alumno_id/descargar-pdf", authMiddleware, boletasController.generarBoletaIndividual);

/**
 * @swagger
 * /api/boletas/masivas:
 *   get:
 *     summary: Generar y descargar todas las boletas en un solo PDF (Admin)
 *     tags: [Boletas]
 *     security:
 *       - bearerAuth: []
 */
router.get("/masivas", authMiddleware, boletasController.generarBoletasMasivas);

module.exports = router;

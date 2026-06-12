const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../middleware/authMiddleware");
const { requireRole } = require("../middleware/roleMiddleware");
const ROLES = require("../constants/roles");
const padreController = require("../controllers/padreController");

/**
 * @swagger
 * /api/padre/mis-hijos:
 *   get:
 *     summary: Obtener los alumnos vinculados al padre
 *     tags: [Padres]
 *     security:
 *       - bearerAuth: []
 */
router.get("/mis-hijos", authMiddleware, requireRole([ROLES.PADRE]), padreController.getMisHijos);

/**
 * @swagger
 * /api/padre/hijo/{alumno_id}/calificaciones:
 *   get:
 *     summary: Obtener todas las calificaciones de un hijo
 *     tags: [Padres]
 *     security:
 *       - bearerAuth: []
 */
router.get("/hijo/:alumno_id/calificaciones", authMiddleware, requireRole([ROLES.PADRE]), padreController.getCalificacionesHijo);

/**
 * @swagger
 * /api/padre/hijo/{alumno_id}/firmar-acuse:
 *   post:
 *     summary: Firmar digitalmente el acuse de la boleta
 *     tags: [Padres]
 *     security:
 *       - bearerAuth: []
 */
router.post("/hijo/:alumno_id/firmar-acuse", authMiddleware, requireRole([ROLES.PADRE]), padreController.firmarAcuse);

router.post("/periodos/:periodoId/publicar", authMiddleware, requireRole([ROLES.ADMIN, ROLES.DOCENTE]), padreController.publicarPeriodo);

router.post("/admin/periods/:periodId/release", authMiddleware, requireRole([ROLES.ADMIN]), padreController.releasePeriod);

router.get("/:alumnoId/boleta/:periodoId", authMiddleware, requireRole([ROLES.PADRE]), padreController.getBoletaData);

router.get("/periodos", authMiddleware, requireRole([ROLES.PADRE]), padreController.getPeriodos);

router.get("/:alumnoId/pdf/:periodoId", authMiddleware, requireRole([ROLES.PADRE]), padreController.generarPDF);

module.exports = router;

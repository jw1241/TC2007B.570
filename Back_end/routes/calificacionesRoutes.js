const express = require("express");
const router = express.Router();

const { authMiddleware } = require("../middleware/authMiddleware");
const { requireRole } = require("../middleware/roleMiddleware");
const ROLES = require("../constants/roles");

const calificacionesController = require("../controllers/calificacionesController");

router.get(
  "/:alumnoId/summary",
  authMiddleware,
  requireRole([ROLES.ADMIN, ROLES.DOCENTE, ROLES.PADRE]),
  calificacionesController.getSummary
);

module.exports = router;
const express = require("express");
const router = express.Router();
const multer = require("multer");
const { authMiddleware } = require("../middleware/authMiddleware");
const { requireRole } = require("../middleware/roleMiddleware");
const ROLES = require("../constants/roles");
const adminUsuarioController = require("../controllers/adminUsuarioController");

const upload = multer({ storage: multer.memoryStorage() });

// ── CSV Import ────────────────────────────────────────────────────────────────
router.post("/import/grupos",     authMiddleware, requireRole([ROLES.ADMIN]), upload.single("file"), adminUsuarioController.importGrupos);
router.post("/import/materias",   authMiddleware, requireRole([ROLES.ADMIN]), upload.single("file"), adminUsuarioController.importMaterias);
router.post("/import/alumnos",    authMiddleware, requireRole([ROLES.ADMIN]), upload.single("file"), adminUsuarioController.importAlumnos);
router.post("/import/profesores", authMiddleware, requireRole([ROLES.ADMIN]), upload.single("file"), adminUsuarioController.importProfesores);

// ── Reads ─────────────────────────────────────────────────────────────────────
router.get("/grupos",     authMiddleware, requireRole([ROLES.ADMIN]), adminUsuarioController.getGrupos);
router.get("/alumnos",    authMiddleware, requireRole([ROLES.ADMIN]), adminUsuarioController.getAlumnos);
router.get("/materias",   authMiddleware, requireRole([ROLES.ADMIN]), adminUsuarioController.getMaterias);
router.get("/profesores", authMiddleware, requireRole([ROLES.ADMIN]), adminUsuarioController.getProfesores);

// ── Manual creation ───────────────────────────────────────────────────────────
router.post("/grupo",     authMiddleware, requireRole([ROLES.ADMIN]), adminUsuarioController.crearGrupo);
router.put("/grupos/:id", authMiddleware, requireRole([ROLES.ADMIN]), adminUsuarioController.updateGrupo);
router.delete("/grupos/:id", authMiddleware, requireRole([ROLES.ADMIN]), adminUsuarioController.deleteGrupo);

router.post("/materia",   authMiddleware, requireRole([ROLES.ADMIN]), adminUsuarioController.crearMateria);
router.put("/materias/:id", authMiddleware, requireRole([ROLES.ADMIN]), adminUsuarioController.updateMateria);
router.delete("/materias/:id", authMiddleware, requireRole([ROLES.ADMIN]), adminUsuarioController.deleteMateria);

router.post("/alumno",    authMiddleware, requireRole([ROLES.ADMIN]), adminUsuarioController.crearAlumno);
router.put("/alumnos/:id", authMiddleware, requireRole([ROLES.ADMIN]), adminUsuarioController.updateAlumno);
router.delete("/alumnos/:id", authMiddleware, requireRole([ROLES.ADMIN]), adminUsuarioController.deleteAlumno);

router.post("/profesor",  authMiddleware, requireRole([ROLES.ADMIN]), adminUsuarioController.crearProfesor);
router.post("/profesor/asignar", authMiddleware, requireRole([ROLES.ADMIN]), adminUsuarioController.asignarProfesor);
router.put("/profesores/:id", authMiddleware, requireRole([ROLES.ADMIN]), adminUsuarioController.updateProfesor);
router.delete("/profesores/:id", authMiddleware, requireRole([ROLES.ADMIN]), adminUsuarioController.deleteProfesor);

module.exports = router;

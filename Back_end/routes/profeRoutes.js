const express = require("express");
const router = express.Router();
const profeController = require("../controllers/profeController");

router.get("/:docenteId/resumen",                                                    profeController.getResumen);
router.get("/:docenteId/grupos",                                                     profeController.getGrupos);
router.get("/:docenteId/materias",                                                   profeController.getMaterias);
router.get("/:docenteId/calificaciones-recientes",                                   profeController.getCalificacionesRecientes);
router.get("/:docenteId/mensajes",                                                   profeController.getMensajesDocente);
router.get("/:docenteId/profile",                                                    profeController.getProfile);
router.get("/:docenteId/dashboard",                                                  profeController.getDashboard);
router.get("/:docenteId/clases",                                                     profeController.getClases);
router.get("/periodos",                                                               profeController.getPeriodos);
router.get("/grupo/:grupoId/materia/:materiaId/periodo/:periodoId/alumnos",          profeController.getAlumnosByGrupoMateriaPeriodo);
router.put("/calificaciones",                                                         profeController.upsertCalificacion);
router.get("/periodos/:periodoId/status",                                            profeController.getPeriodoStatus);
router.post("/periodos/:periodoId/publicar",                                         profeController.publicarBoleta);
router.get("/alumnos/:alumnoId/boleta/:periodoId",                                   profeController.getBoletaAlumno);
router.get("/materia/:materiaId/grupo/:grupoId/periodo/:periodoId",                  profeController.getAlumnosByMateria);
router.post("/calificaciones",                                                        profeController.createCalificacion);
router.put("/calificaciones/:id",                                                    profeController.updateCalificacion);
router.delete("/calificaciones/:id",                                                 profeController.deleteCalificacion);
router.get("/periodos/:periodoId/firmas",                                            profeController.getFirmasByPeriodo);

module.exports = router;

const express = require("express");
const router = express.Router();
const { supabaseAdmin } = require("../config/supabaseClient");
const { authMiddleware } = require("../middleware/authMiddleware");
const { requireRole } = require("../middleware/roleMiddleware");
const ROLES = require("../constants/roles");

const getInternalUserId = async (authUserId) => {
  const { data } = await supabaseAdmin.from("usuarios").select("id").eq("auth_user_id", authUserId).single();
  return data ? data.id : null;
};

/**
 * @swagger
 * /api/padre/mis-hijos:
 *   get:
 *     summary: Obtener los alumnos vinculados al padre
 *     tags: [Padres]
 *     security:
 *       - bearerAuth: []
 */
router.get("/mis-hijos", authMiddleware, requireRole([ROLES.PADRE]), async (req, res, next) => {
  try {
    const padreId = await getInternalUserId(req.user.id);
    if (!padreId) return res.status(404).json({ error: { message: "Perfil no encontrado" } });

    const { data, error } = await supabaseAdmin
      .from("parentescos")
      .select(`
        id,
        relacion,
        alumnos ( id, nombre, apellidos, matricula, fecha_nacimiento, grupos ( id, nombre, grado ) )
      `)
      .eq("padre_id", padreId);

    if (error) throw error;
    res.json({ message: "Hijos obtenidos exitosamente", data });
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /api/padre/hijo/{alumno_id}/calificaciones:
 *   get:
 *     summary: Obtener todas las calificaciones de un hijo
 *     tags: [Padres]
 *     security:
 *       - bearerAuth: []
 */
router.get("/hijo/:alumno_id/calificaciones", authMiddleware, requireRole([ROLES.PADRE]), async (req, res, next) => {
  try {
    const { alumno_id } = req.params;
    const padreId = await getInternalUserId(req.user.id);

    // Verificar parentesco
    const { data: parentesco, error: parError } = await supabaseAdmin
      .from("parentescos")
      .select("id")
      .eq("padre_id", padreId)
      .eq("alumno_id", alumno_id)
      .single();

    if (parError || !parentesco) {
      return res.status(403).json({ error: { message: "No tienes permiso para ver a este alumno." } });
    }

    // Obtener calificaciones y materias
    const { data: calificaciones, error: califError } = await supabaseAdmin
      .from("calificaciones")
      .select(`
        id,
        trimestre,
        calificacion,
        observaciones,
        materias ( id, nombre )
      `)
      .eq("alumno_id", alumno_id);

    if (califError) throw califError;

    // Agrupar por materia para la boleta
    const boleta = {};
    calificaciones.forEach(c => {
      const matId = c.materias.id;
      if (!boleta[matId]) {
        boleta[matId] = { materia: c.materias.nombre, trimestres: { 1: null, 2: null, 3: null } };
      }
      boleta[matId].trimestres[c.trimestre] = { calificacion: c.calificacion, observaciones: c.observaciones };
    });

    res.json({ message: "Calificaciones obtenidas", data: Object.values(boleta) });
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /api/padre/hijo/{alumno_id}/firmar-acuse:
 *   post:
 *     summary: Firmar digitalmente el acuse de la boleta
 *     tags: [Padres]
 *     security:
 *       - bearerAuth: []
 */
router.post("/hijo/:alumno_id/firmar-acuse", authMiddleware, requireRole([ROLES.PADRE]), async (req, res, next) => {
  try {
    const { alumno_id } = req.params;
    const padreId = await getInternalUserId(req.user.id);

    // Verificar parentesco
    const { data: parentesco, error: parError } = await supabaseAdmin
      .from("parentescos")
      .select("id")
      .eq("padre_id", padreId)
      .eq("alumno_id", alumno_id)
      .single();

    if (parError || !parentesco) {
      return res.status(403).json({ error: { message: "Acceso denegado." } });
    }

    // Insertar firma (Asumiendo que hay una tabla firmas_boletas)
    const { error: firmaError } = await supabaseAdmin
      .from("firmas_boletas")
      .insert([{
        padre_id: padreId,
        alumno_id: alumno_id,
        fecha_firma: new Date(),
        ciclo_escolar: "2025-2026" // Puede venir del body o ser dinámico
      }]);

    if (firmaError) throw firmaError;

    res.json({ message: "Boleta firmada de conformidad exitosamente." });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

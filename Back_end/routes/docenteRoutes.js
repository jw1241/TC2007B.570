const express = require("express");
const router = express.Router();
const Joi = require("joi");
const { supabaseAdmin } = require("../config/supabaseClient");
const { authMiddleware } = require("../middleware/authMiddleware");
const { requireRole } = require("../middleware/roleMiddleware");
const ROLES = require("../constants/roles");

// Helper para extraer ID interno de usuario
const getInternalUserId = async (authUserId) => {
  const { data } = await supabaseAdmin.from("usuarios").select("id").eq("auth_user_id", authUserId).single();
  return data ? data.id : null;
};

/**
 * @swagger
 * /api/docente/mis-clases:
 *   get:
 *     summary: Obtener los grupos y materias asignados al profesor
 *     tags: [Docentes]
 *     security:
 *       - bearerAuth: []
 */
router.get("/mis-clases", authMiddleware, requireRole([ROLES.DOCENTE]), async (req, res, next) => {
  try {
    const docenteId = await getInternalUserId(req.user.id);
    if (!docenteId) return res.status(404).json({ error: { message: "Perfil de docente no encontrado" } });

    const { data, error } = await supabaseAdmin
      .from("asignaciones_docentes")
      .select(`
        id,
        grupos ( id, nombre, grado ),
        materias ( id, nombre )
      `)
      .eq("docente_id", docenteId);

    if (error) throw error;
    res.json({ message: "Clases obtenidas", data });
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /api/docente/clase/{grupo_id}/materia/{materia_id}/alumnos:
 *   get:
 *     summary: Obtener alumnos y sus calificaciones para una clase específica
 *     tags: [Docentes]
 *     security:
 *       - bearerAuth: []
 */
router.get("/clase/:grupo_id/materia/:materia_id/alumnos", authMiddleware, requireRole([ROLES.DOCENTE]), async (req, res, next) => {
  try {
    const { grupo_id, materia_id } = req.params;
    const docenteId = await getInternalUserId(req.user.id);

    // Verificar asignación
    const { data: asignacion, error: asigError } = await supabaseAdmin
      .from("asignaciones_docentes")
      .select("id")
      .eq("docente_id", docenteId)
      .eq("grupo_id", grupo_id)
      .eq("materia_id", materia_id)
      .single();

    if (asigError || !asignacion) {
      return res.status(403).json({ error: { message: "No tienes permiso para ver esta clase." } });
    }

    // Obtener alumnos del grupo
    const { data: alumnos, error: alumError } = await supabaseAdmin
      .from("alumnos")
      .select("id, nombre, apellidos, matricula")
      .eq("grupo_id", grupo_id)
      .order("apellidos", { ascending: true });

    if (alumError) throw alumError;

    // Obtener calificaciones de estos alumnos en esta materia
    const alumnosIds = alumnos.map(a => a.id);
    const { data: calificaciones, error: califError } = await supabaseAdmin
      .from("calificaciones")
      .select("*")
      .in("alumno_id", alumnosIds)
      .eq("materia_id", materia_id);

    if (califError) throw califError;

    // Mapear calificaciones a los alumnos
    const alumnosConCalif = alumnos.map(alumno => {
      const califs = calificaciones.filter(c => c.alumno_id === alumno.id);
      return {
        ...alumno,
        calificaciones: {
          trimestre_1: califs.find(c => c.trimestre === 1) || null,
          trimestre_2: califs.find(c => c.trimestre === 2) || null,
          trimestre_3: califs.find(c => c.trimestre === 3) || null,
        }
      };
    });

    res.json({ message: "Alumnos obtenidos", data: alumnosConCalif });
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /api/docente/calificaciones:
 *   put:
 *     summary: Guardar o actualizar la calificación de un alumno
 *     tags: [Docentes]
 *     security:
 *       - bearerAuth: []
 */
router.put("/calificaciones", authMiddleware, requireRole([ROLES.DOCENTE]), async (req, res, next) => {
  try {
    const schema = Joi.object({
      alumno_id: Joi.number().required(), // Asumiendo que alumno_id es entero o uuid. Cambiar si es uuid.
      materia_id: Joi.string().uuid().required(),
      trimestre: Joi.number().valid(1, 2, 3).required(),
      calificacion: Joi.number().min(0).max(10).required(),
      observaciones: Joi.string().allow('', null).optional()
    });

    const { error, value } = schema.validate(req.body);
    if (error) return res.status(400).json({ error: { message: "Datos inválidos", details: error.details.map(d=>d.message) } });

    const { alumno_id, materia_id, trimestre, calificacion, observaciones } = value;
    const docenteId = await getInternalUserId(req.user.id);

    // Upsert (Insert o Update si existe)
    // Asumiendo que la tabla tiene una llave única (alumno_id, materia_id, trimestre)
    const { data, error: upsertError } = await supabaseAdmin
      .from("calificaciones")
      .upsert({
        alumno_id,
        materia_id,
        docente_id: docenteId,
        trimestre,
        calificacion,
        observaciones,
        fecha_captura: new Date()
      }, { onConflict: "alumno_id, materia_id, trimestre" });

    if (upsertError) throw upsertError;

    res.json({ message: "Calificación guardada exitosamente." });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

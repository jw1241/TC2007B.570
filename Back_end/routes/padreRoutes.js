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
        periodo_id,
        nota,
        comentario,
        tarea,
        materias ( id, nombre_materia )
      `)
      .eq("alumno_id", alumno_id);

    if (califError) throw califError;

    // Agrupar por materia para la boleta
    const boleta = {};
    calificaciones.forEach(c => {
      const matId = c.materias.id;
      if (!boleta[matId]) {
        boleta[matId] = { materia: c.materias.nombre_materia, trimestres: { 1: null, 2: null, 3: null } };
      }
      boleta[matId].trimestres[c.periodo_id] = { calificacion: c.nota, observaciones: c.comentario, tarea: c.tarea };
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
    const Joi = require("joi");
    const schema = Joi.object({
      alumno_id: Joi.string().required()
    });
    const { error: validationError } = schema.validate({ alumno_id });
    if (validationError) return res.status(400).json({ error: { message: validationError.details[0].message } });
    
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

router.post(
  "/periodos/:periodoId/publicar",
  authMiddleware,
  requireRole([ROLES.ADMIN, ROLES.DOCENTE]),
  async (req, res) => {

    const { periodoId } = req.params;

    const { error } =
      await supabaseAdmin
        .from("periodos_publicados")
        .insert({
          periodo_id: periodoId,
          publicado_por: req.user.id
        });

    if (error) {
      return res.status(400).json({
        error: error.message
      });
    }

    res.json({
      message: "Periodo publicado correctamente"
    });

  }
);

router.get(
  "/:alumnoId/boleta/:periodoId",
  authMiddleware,
  async (req, res) => {

    const { alumnoId, periodoId } =
      req.params;

    const { data: grades } =
      await supabaseAdmin
        .from("calificaciones")
        .select(`
          nota,
          comentario,
          materias(
            nombre_materia
          )
        `)
        .eq("alumno_id", alumnoId)
        .eq("periodo_id", periodoId);

    const { data: firma } =
      await supabaseAdmin
        .from("firmas_boletas")
        .select("id")
        .eq("alumno_id", alumnoId)
        .eq("periodo_id", periodoId)
        .maybeSingle();

    res.json({
      calificaciones: grades,
      firmado: !!firma
    });

  }
);

router.post(
  "/:alumnoId/firmar",
  authMiddleware,
  requireRole([ROLES.PADRE]),
  async (req, res) => {

    const { alumnoId } =
      req.params;

    const { periodo_id } =
      req.body;

    const { error } =
      await supabaseAdmin
        .from("firmas_boletas")
        .insert({

          alumno_id: alumnoId,

          padre_id:
            req.user.id,

          periodo_id

        });

    if (error) {
      return res.status(400).json(error);
    }

    res.json({
      message:
        "Boleta firmada correctamente"
    });

  }
);

router.post(
  '/admin/periods/:periodId/release',
  authMiddleware,
  requireRole([ROLES.ADMIN]),
  async (req, res) => {

    await db
      .from('boletas_publicadas')
      .upsert({
        periodo_id: req.params.periodId,
        publicada: true,
        publicada_por: req.user.id,
        publicada_en: new Date()
      });

    res.json({
      success: true
    });

  }
);

router.get(
  "/grades/:alumnoId/boleta",
  authMiddleware,
  async (req, res) => {

    const { alumnoId } = req.params;

    const { data: periodo } =
      await supabaseAdmin
        .from("periodos_evaluacion")
        .select("*")
        .order("mes_fin", { ascending: false })
        .limit(1)
        .single();

    const { data: grades } =
      await supabaseAdmin
        .from("calificaciones")
        .select(`
          nota,
          comentario,
          materias(
            id,
            nombre_materia
          )
        `)
        .eq("alumno_id", alumnoId)
        .eq("periodo_id", periodo.id);

    const materias = grades.map(g => ({
      nombre_materia:
        g.materias.nombre_materia,
      promedio:
        Number(g.nota)
    }));

    const promedio =
      materias.length
        ? materias.reduce(
            (sum, m) => sum + m.promedio,
            0
          ) / materias.length
        : 0;

    const { data: firma } =
      await supabaseAdmin
        .from("firmas_boletas")
        .select("*")
        .eq("alumno_id", alumnoId)
        .eq("periodo_id", periodo.id)
        .maybeSingle();

    res.json({
      periodo,
      materias,
      promedio,
      boletaDisponible: true,
      firmada: !!firma,
      fechaFirma:
        firma?.firmado_en || null
    });

  }
);

module.exports = router;

const express = require("express");
const router = express.Router();
const { supabaseAdmin } = require("../config/supabaseClient");
const { authMiddleware } = require("../middleware/authMiddleware");
const { requireRole } = require("../middleware/roleMiddleware");
const ROLES = require("../constants/roles");

const PDFDocument = require("pdfkit");

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


router.get(
  "/mis-hijos",
  authMiddleware,
  requireRole([ROLES.PADRE]),
  async (req, res, next) => {

    try {

      const padreId =
        req.user.id;

      if (!padreId) {
        return res.status(404).json({
          error: {
            message: "Perfil no encontrado"
          }
        });
      }

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
  } 
  
  catch (err) {
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

    const padreId = req.user.id;
    const { alumno_id } = req.params;

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
    const padreId = req.user.id;
    const { periodo_id } = req.body;
    const { alumno_id } = req.params;
    const Joi = require("joi");
    const schema = Joi.object({
      alumno_id: Joi.string().required()
    });
    const { error: validationError } = schema.validate({ alumno_id });
    if (validationError) return res.status(400).json({ error: { message: validationError.details[0].message } });
    

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

    const { data: existingSignature } =
  await supabaseAdmin
    .from("firmas_boletas")
    .select("id")
    .eq("alumno_id", alumno_id)
    .eq("padre_id", padreId)
    .eq("periodo_id", periodo_id)
    .maybeSingle();

if (existingSignature) {
  return res.status(400).json({
    error: {
      message: "La boleta ya fue firmada."
    }
  });
}

    // Insertar firma (Asumiendo que hay una tabla firmas_boletas)
    const { error: firmaError } = await supabaseAdmin
      .from("firmas_boletas")
      .insert([{
  padre_id: padreId,
  alumno_id: alumno_id,
  periodo_id,
  firmado_en: new Date()
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

router.post(
  "/:alumnoId/firmar",
  authMiddleware,
  requireRole([ROLES.PADRE]),
  async (req, res) => {

    const { alumnoId } = req.params;

const { periodo_id } = req.body;

const padreId = req.user.id;

const { data: existing } =
  await supabaseAdmin
    .from("firmas_boletas")
    .select("id")
    .eq("alumno_id", alumnoId)
    .eq("padre_id", padreId)
    .eq("periodo_id", periodo_id)
    .maybeSingle();

if (existing) {
  return res.status(400).json({
    error: {
      message: "La boleta ya fue firmada."
    }
  });
}

    const { error } =
      await supabaseAdmin
        .from("firmas_boletas")
        .insert({

          alumno_id: alumnoId,

          padre_id: padreId,

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

    const { error } =
  await supabaseAdmin
    .from("boletas_publicadas")
    .upsert({
      periodo_id: req.params.periodId,
      publicada: true,
      publicada_por: req.user.id,
      publicada_en: new Date()
    });

if (error) {
  return res.status(400).json({
    error: error.message
  });
}

    res.json({
      success: true
    });

  }
);

router.get(
  "/:alumnoId/boleta/:periodoId",
  authMiddleware,
  requireRole([ROLES.PADRE]),
  async (req, res) => {

    const { alumnoId, periodoId } =
      req.params;

    const padreId =
  req.user.id;

  console.log("AUTH USER:", req.user.id);
console.log("PADRE ID:", padreId);
console.log("ALUMNO ID:", alumnoId);

const {
  data: parentesco,
  error: parentescoError
} = await supabaseAdmin
  .from("parentescos")
  .select("*")
  .eq("padre_id", padreId)
  .eq("alumno_id", alumnoId);

console.log(
  "PARENTESCO DATA:",
  JSON.stringify(parentesco, null, 2)
);

console.log(
  "PARENTESCO ERROR:",
  JSON.stringify(parentescoError, null, 2)
);

if (parentescoError || !parentesco || parentesco.length === 0) {
  return res.status(403).json({
    error: {
      message: "Acceso denegado"
    }
  });
}

    

    const { data: periodo } =
  await supabaseAdmin
    .from("periodos_evaluacion")
    .select("*")
    .eq("id", periodoId)
    .single();

    const { data: publicada } =
  await supabaseAdmin
    .from("boletas_publicadas")
    .select("id")
    .eq("periodo_id", periodoId)
    .maybeSingle();

    const { data: grades, error: gradesError } =
  await supabaseAdmin
    .from("calificaciones")
    .select(`
      nota,
      comentario,
      tarea,
      materias(
        id,
        nombre_materia
      )
    `)
    .eq("alumno_id", alumnoId)
    .eq("periodo_id", periodoId);

    console.log(
  JSON.stringify(grades, null, 2)
);

if (gradesError) {
  return res.status(400).json(gradesError);
}

    const materiasMap = {};

(grades || []).forEach(g => {
  const materiaId = g.materias.id;

  if (!materiasMap[materiaId]) {
    materiasMap[materiaId] = {
      materia_id: materiaId,
      nombre_materia: g.materias.nombre_materia,
      tareas: []
    };
  }

  materiasMap[materiaId].tareas.push({
    nombre: g.tarea || "Actividad",
    calificacion: Number(g.nota),
    comentario: g.comentario
  });
});

const materias = Object.values(materiasMap);

materias.forEach(m => {
  const total = m.tareas.reduce(
    (sum, t) => sum + t.calificacion,
    0
  );

  m.promedio =
    m.tareas.length > 0
      ? Number((total / m.tareas.length).toFixed(2))
      : 0;
});

    const promedio =
  materias.length > 0
    ? Number(
        (
          materias.reduce(
            (sum, m) => sum + m.promedio,
            0
          ) / materias.length
        ).toFixed(2)
      )
    : 0;

    let firma = null;

if (publicada) {

  const { data } =
    await supabaseAdmin
      .from("firmas_boletas")
      .select("*")
      .eq("alumno_id", alumnoId)
      .eq("periodo_id", periodoId)
      .maybeSingle();

  firma = data;
}

    res.json({
  periodo,
  materias,
  promedio,

  boletaDisponible: !!publicada,

  firmada: !!firma,

  fechaFirma:
    firma?.firmado_en || null
});

});

router.get(
  "/periodos",
  authMiddleware,
  requireRole([ROLES.PADRE]),
  async (req, res) => {

    const { data, error } =
      await supabaseAdmin
        .from("periodos_evaluacion")
        .select("*")
        .order("mes_inicio");

    if (error) {
      return res.status(400).json(error);
    }

    res.json(data);
  }
);

router.get(
  "/:alumnoId/pdf/:periodoId",
  authMiddleware,
  requireRole([ROLES.PADRE]),
  async (req, res) => {

    try {

      const { alumnoId, periodoId } = req.params;

      console.log("ALUMNO ID PARAM", alumnoId);

      const padreId =
  req.user.id;

  console.log("REQ.USER", req.user);
console.log("PADRE ID", padreId);

      // Verify relationship
      const { data: parentesco, error } =
  await supabaseAdmin
    .from("parentescos")
    .select("*")
    .eq("padre_id", padreId)
    .eq("alumno_id", alumnoId);

console.log("PARENTESCO RESULT:", parentesco);

if (!parentesco || parentesco.length === 0) {
  return res.status(403).json({
    error: {
      message: "Acceso denegado"
    }
  });
}

      // Verify boleta released
      const { data: publicada } =
        await supabaseAdmin
          .from("boletas_publicadas")
          .select("id")
          .eq("periodo_id", periodoId)
          .maybeSingle();

      if (!publicada) {
        return res.status(403).json({
          error: {
            message: "La boleta aún no ha sido publicada"
          }
        });
      }

      const { data: alumno,
  error: alumnoError } =
        await supabaseAdmin
          .from("alumnos")
          .select(`
            nombre_completo,
            matricula
          `)
          .eq("id", alumnoId)
          .single();

          console.log("ALUMNO", alumno);
console.log("ALUMNO ERROR", alumnoError);

if (!alumno) {
  return res.status(404).json({
    error: {
      message: "Alumno no encontrado"
    }
  });
}

      const { data: periodo } =
        await supabaseAdmin
          .from("periodos_evaluacion")
          .select("*")
          .eq("id", periodoId)
          .single();

      const { data: grades } =
        await supabaseAdmin
          .from("calificaciones")
          .select(`
            nota,
            comentario,
            tarea,
            materias(
              nombre_materia
            )
          `)
          .eq("alumno_id", alumnoId)
          .eq("periodo_id", periodoId);

          console.log(
  JSON.stringify(grades, null, 2)
);

      const promedio =
        grades.length
          ? grades.reduce(
              (sum, g) => sum + Number(g.nota),
              0
            ) / grades.length
          : 0;

      const download =
        req.query.download === "1";

      const filename =
        `boleta_${alumno.matricula}_${periodo.nombre}.pdf`;

      if (download) {
        res.setHeader(
          "Content-Disposition",
          `attachment; filename="${filename}"`
        );
      } else {
        res.setHeader(
          "Content-Disposition",
          `inline; filename="${filename}"`
        );
      }

      res.setHeader(
        "Content-Type",
        "application/pdf"
      );

      const doc = new PDFDocument();

      doc.pipe(res);

      doc.fontSize(20);
      doc.text("Boleta de Calificaciones");

      doc.moveDown();

      doc.fontSize(12);
      doc.text(
        `Alumno: ${alumno.nombre_completo}`
      );

      doc.text(
        `Matrícula: ${alumno.matricula}`
      );

      doc.text(
        `Periodo: ${periodo.nombre}`
      );

      doc.moveDown();

      doc.fontSize(14);
      doc.text("Calificaciones");

      doc.moveDown();

      grades.forEach(g => {
  doc.text(
    `${g.materias.nombre_materia} - ${g.tarea}: ${g.nota}`
  );
  
});

console.log(
  JSON.stringify(grades, null, 2)
);

      doc.moveDown();

      doc.fontSize(16);
      doc.text(
        `Promedio General: ${promedio.toFixed(2)}`
      );

      doc.end();

    } catch (error) {

      console.error(error);

      res.status(500).json({
        error: {
          message:
            "Error generando PDF"
        }
      });

    }

  }
);

module.exports = router;

const { supabaseAdmin } = require("../config/supabaseClient");
const PDFDocument = require("pdfkit");

// ─── GET /mis-hijos ───────────────────────────────────────────────────────────
async function getMisHijos(req, res, next) {
  try {
    const padreId = req.user.id;

    if (!padreId) {
      return res.status(404).json({ error: { message: "Perfil no encontrado" } });
    }

    const { data, error } = await supabaseAdmin
      .from("parentescos")
      .select(`
        padre_id,
        alumnos ( id, nombre_completo, matricula, fecha_nacimiento, grupo_id, grupos ( id, grado, seccion ) )
      `)
      .eq("padre_id", padreId);

    if (error) throw error;
    res.json({ message: "Hijos obtenidos exitosamente", data });
  } catch (err) {
    next(err);
  }
}

// ─── GET /hijo/:alumno_id/calificaciones ──────────────────────────────────────
async function getCalificacionesHijo(req, res, next) {
  try {
    const padreId = req.user.id;
    const { alumno_id } = req.params;

    const { data: parentesco, error: parError } = await supabaseAdmin
      .from("parentescos")
      .select("padre_id")
      .eq("padre_id", padreId)
      .eq("alumno_id", alumno_id)
      .single();

    if (parError || !parentesco) {
      return res.status(403).json({ error: { message: "No tienes permiso para ver a este alumno." } });
    }

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

    const boleta = {};
    calificaciones.forEach(c => {
      const matId = c.materias.id;
      if (!boleta[matId]) {
        boleta[matId] = { materia: c.materias.nombre_materia, trimestres: { 1: null, 2: null, 3: null } };
      }
      boleta[matId].trimestres[c.periodo_id] = {
        calificacion: c.nota,
        observaciones: c.comentario,
        tarea: c.tarea
      };
    });

    res.json({ message: "Calificaciones obtenidas", data: Object.values(boleta) });
  } catch (err) {
    next(err);
  }
}

// ─── POST /hijo/:alumno_id/firmar-acuse ───────────────────────────────────────
async function firmarAcuse(req, res, next) {
  try {
    const Joi = require("joi");
    const padreId = req.user.id;
    const { periodo_id } = req.body;
    const { alumno_id } = req.params;

    const { error: validationError } = Joi.object({ alumno_id: Joi.string().required() })
      .validate({ alumno_id });
    if (validationError) {
      return res.status(400).json({ error: { message: validationError.details[0].message } });
    }

    const { data: parentesco, error: parError } = await supabaseAdmin
      .from("parentescos")
      .select("padre_id")
      .eq("padre_id", padreId)
      .eq("alumno_id", alumno_id)
      .single();

    if (parError || !parentesco) {
      return res.status(403).json({ error: { message: "Acceso denegado." } });
    }

    const { data: existingSignature } = await supabaseAdmin
      .from("firmas_boletas")
      .select("id")
      .eq("alumno_id", alumno_id)
      .eq("padre_id", padreId)
      .eq("periodo_id", periodo_id)
      .maybeSingle();

    if (existingSignature) {
      return res.status(400).json({ error: { message: "La boleta ya fue firmada." } });
    }

    const { error: firmaError } = await supabaseAdmin
      .from("firmas_boletas")
      .insert([{ padre_id: padreId, alumno_id, periodo_id, firmado_en: new Date() }]);

    if (firmaError) throw firmaError;

    res.json({ message: "Boleta firmada de conformidad exitosamente." });
  } catch (err) {
    next(err);
  }
}

// ─── POST /periodos/:periodoId/publicar ───────────────────────────────────────
async function publicarPeriodo(req, res, next) {
  try {
    const { periodoId } = req.params;

    const { error } = await supabaseAdmin
      .from("periodos_publicados")
      .insert({ periodo_id: periodoId, publicado_por: req.user.id });

    if (error) return res.status(400).json({ error: error.message });

    res.json({ message: "Periodo publicado correctamente" });
  } catch (err) {
    next(err);
  }
}

// ─── POST /admin/periods/:periodId/release ────────────────────────────────────
async function releasePeriod(req, res, next) {
  try {
    const { error } = await supabaseAdmin
      .from("boletas_publicadas")
      .upsert({
        periodo_id: req.params.periodId,
        publicada: true,
        publicada_por: req.user.id,
        publicada_en: new Date()
      });

    if (error) return res.status(400).json({ error: error.message });

    res.json({ success: true });
  } catch (err) {
    next(err);
  }
}

// ─── GET /:alumnoId/boleta/:periodoId ─────────────────────────────────────────
async function getBoletaData(req, res, next) {
  try {
    const { alumnoId, periodoId } = req.params;
    const padreId = req.user.id;

    const { data: parentesco, error: parentescoError } = await supabaseAdmin
      .from("parentescos")
      .select("*")
      .eq("padre_id", padreId)
      .eq("alumno_id", alumnoId);

    if (parentescoError || !parentesco || parentesco.length === 0) {
      return res.status(403).json({ error: { message: "Acceso denegado" } });
    }

    const { data: periodo } = await supabaseAdmin
      .from("periodos_evaluacion")
      .select("*")
      .eq("id", periodoId)
      .single();

    const { data: boletaRows } = await supabaseAdmin
      .from("boletas_publicadas")
      .select("id")
      .eq("periodo_id", periodoId)
      .limit(1);
    const publicada = boletaRows?.[0] || null;

    const { data: grades, error: gradesError } = await supabaseAdmin
      .from("calificaciones")
      .select(`nota, comentario, tarea, materias( id, nombre_materia )`)
      .eq("alumno_id", alumnoId)
      .eq("periodo_id", periodoId);

    if (gradesError) return res.status(400).json(gradesError);

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
      const total = m.tareas.reduce((sum, t) => sum + t.calificacion, 0);
      m.promedio = m.tareas.length > 0 ? Number((total / m.tareas.length).toFixed(2)) : 0;
    });

    const promedio = materias.length > 0
      ? Number((materias.reduce((sum, m) => sum + m.promedio, 0) / materias.length).toFixed(2))
      : 0;

    let firma = null;
    if (publicada) {
      const { data } = await supabaseAdmin
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
      fechaFirma: firma?.firmado_en || null
    });
  } catch (err) {
    next(err);
  }
}

// ─── GET /periodos ────────────────────────────────────────────────────────────
async function getPeriodos(req, res, next) {
  try {
    const { data, error } = await supabaseAdmin
      .from("periodos_evaluacion")
      .select("*")
      .order("mes_inicio");

    if (error) return res.status(400).json(error);

    res.json(data);
  } catch (err) {
    next(err);
  }
}

// ─── GET /:alumnoId/pdf/:periodoId ────────────────────────────────────────────
async function generarPDF(req, res, next) {
  try {
    const { alumnoId, periodoId } = req.params;
    const padreId = req.user.id;

    const { data: parentesco } = await supabaseAdmin
      .from("parentescos")
      .select("*")
      .eq("padre_id", padreId)
      .eq("alumno_id", alumnoId);

    if (!parentesco || parentesco.length === 0) {
      return res.status(403).json({ error: { message: "Acceso denegado" } });
    }

    const { data: boletaRows } = await supabaseAdmin
      .from("boletas_publicadas")
      .select("id")
      .eq("periodo_id", periodoId)
      .limit(1);
    const publicada = boletaRows?.[0] || null;

    if (!publicada) {
      return res.status(403).json({ error: { message: "La boleta aún no ha sido publicada" } });
    }

    const { data: alumno } = await supabaseAdmin
      .from("alumnos")
      .select("nombre_completo, matricula")
      .eq("id", alumnoId)
      .single();

    if (!alumno) {
      return res.status(404).json({ error: { message: "Alumno no encontrado" } });
    }

    const { data: periodo } = await supabaseAdmin
      .from("periodos_evaluacion")
      .select("*")
      .eq("id", periodoId)
      .single();

    const { data: grades } = await supabaseAdmin
      .from("calificaciones")
      .select(`nota, comentario, tarea, materias( nombre_materia )`)
      .eq("alumno_id", alumnoId)
      .eq("periodo_id", periodoId);

    const promedio = grades.length
      ? grades.reduce((sum, g) => sum + Number(g.nota), 0) / grades.length
      : 0;

    const download = req.query.download === "1";
    const filename = `boleta_${alumno.matricula}_${periodo.nombre}.pdf`;

    res.setHeader("Content-Disposition", `${download ? "attachment" : "inline"}; filename="${filename}"`);
    res.setHeader("Content-Type", "application/pdf");

    const doc = new PDFDocument();
    doc.pipe(res);

    doc.fontSize(20).text("Boleta de Calificaciones");
    doc.moveDown();
    doc.fontSize(12)
      .text(`Alumno: ${alumno.nombre_completo}`)
      .text(`Matrícula: ${alumno.matricula}`)
      .text(`Periodo: ${periodo.nombre}`);
    doc.moveDown();
    doc.fontSize(14).text("Calificaciones");
    doc.moveDown();

    grades.forEach(g => {
      doc.fontSize(12).text(`${g.materias.nombre_materia} - ${g.tarea}: ${g.nota}`);
    });

    doc.moveDown();
    doc.fontSize(16).text(`Promedio General: ${promedio.toFixed(2)}`);
    doc.end();
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getMisHijos,
  getCalificacionesHijo,
  firmarAcuse,
  publicarPeriodo,
  releasePeriod,
  getBoletaData,
  getPeriodos,
  generarPDF
};

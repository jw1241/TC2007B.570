const express = require('express');
const router = express.Router();
const { supabaseAdmin } = require('../config/supabaseClient');

/**
 * RESUMEN
 */
router.get('/:docenteId/resumen', async (req, res) => {
  const { docenteId } = req.params;

  const { data: asignaciones, error: asignError } = await supabaseAdmin
    .from('asignaciones_docentes')
    .select('grupo_id, materia_id')
    .eq('docente_id', docenteId);

  if (asignError) return res.status(500).json(asignError);

  const grupoIds = [...new Set(asignaciones?.map(a => a.grupo_id) || [])];
  const materiaIds = [...new Set(asignaciones?.map(a => a.materia_id) || [])];

  const { count: mensajes } = await supabaseAdmin
    .from('mensajes')
    .select('*', { count: 'exact', head: true })
    .neq('estado', 'leido');

  let calificacionesCount = 0;

  if (materiaIds.length > 0) {
    const { count } = await supabaseAdmin
      .from('calificaciones')
      .select('*', { count: 'exact', head: true })
      .in('materia_id', materiaIds);

    calificacionesCount = count || 0;
  }

  res.json({
    grupos: grupoIds.length,
    materias: materiaIds.length,
    mensajes: mensajes || 0,
    calificaciones: calificacionesCount
  });
});

/**
 * GRUPOS (DEDUPLICATED)
 */
router.get('/:docenteId/grupos', async (req, res) => {
  const { docenteId } = req.params;

  const { data, error } = await supabaseAdmin
    .from('asignaciones_docentes')
    .select(`
      grupos:grupo_id (
        id,
        grado,
        seccion
      )
    `)
    .eq('docente_id', docenteId);

  if (error) return res.status(500).json(error);

  const flat = (data || [])
  .map(d => d.grupos)
  .filter(Boolean);

res.json(flat); // ✅ array
});

/**
 * MATERIAS + GRUPO INFO (FIXED)
 */
router.get('/:docenteId/materias', async (req, res) => {
  const { docenteId } = req.params;

  const { data, error } = await supabaseAdmin
    .from('asignaciones_docentes')
    .select(`
      materias:materia_id (
        id,
        nombre_materia
      ),
      grupos:grupo_id (
        id,
        grado,
        seccion
      )
    `)
    .eq('docente_id', docenteId);

  if (error) return res.status(500).json(error);

  const flat = (data || [])
  .map(d => ({
    id: d.materias?.id,
    nombre_materia: d.materias?.nombre_materia,
    grado: d.grupos?.grado,
    seccion: d.grupos?.seccion
  }))
  .filter(m => m.id);

  res.json(flat);
});

/**
 * CALIFICACIONES (SAFE + FILTERED)
 */
router.get('/:docenteId/calificaciones-recientes', async (req, res) => {
  const { docenteId } = req.params;

  const { data: asignaciones, error: asignError } = await supabaseAdmin
    .from('asignaciones_docentes')
    .select('materia_id')
    .eq('docente_id', docenteId);

  if (asignError) return res.status(500).json(asignError);

  const materiaIds = asignaciones?.map(a => a.materia_id) || [];

  if (materiaIds.length === 0) {
    return res.json([]);
  }

  const { data, error } = await supabaseAdmin
    .from('calificaciones')
    .select(`
      id,
      nota,
      comentario,
      creado_en,
      alumnos(nombre_completo),
      materias(nombre_materia)
    `)
    .in('materia_id', materiaIds)
    .order('creado_en', { ascending: false })
    .limit(10);

  if (error) return res.status(500).json(error);

  res.json((data || []).map(c => ({
    id: c.id,
    nota: c.nota,
    comentario: c.comentario,
    alumno: c.alumnos?.nombre_completo,
    materia: c.materias?.nombre_materia,
    creado_en: c.creado_en
  })));
});

/**
 * MENSAJES
 */
router.get('/:docenteId/mensajes', async (req, res) => {
  const { docenteId } = req.params;

  const { data, error } = await supabaseAdmin
    .from('mensajes')
    .select(`
      id,
      contenido,
      estado,
      creado_en,
      usuarios(nombre_completo)
    `)
    .order('creado_en', { ascending: false })
    .limit(10);

  if (error) return res.status(500).json(error);

  res.json((data || []).map(m => ({
  id: m.id,
  contenido: m.contenido,
  estado: m.estado,
  remitente: m.usuarios?.nombre_completo,
  creado_en: m.creado_en
})));
});

/**
 * PROFILE
 */
router.get('/:docenteId/profile', async (req, res) => {
  const { docenteId } = req.params;

  const { data, error } = await supabaseAdmin
    .from('usuarios')
    .select('id, nombre_completo')
    .eq('id', docenteId)
    .single();

  if (error) return res.status(500).json(error);

  if (!data) {
    return res.status(404).json({ message: 'Docente no encontrado' });
  }

  res.json(data);
});

router.get('/:docenteId/dashboard', async (req, res) => {
  const { docenteId } = req.params;

  try {
    const { data: asignaciones, error: asignError } = await supabaseAdmin
      .from('asignaciones_docentes')
      .select(`
        materia_id,
        grupo_id,
        materias (id, nombre_materia),
        grupos (id, grado, seccion)
      `)
      .eq('docente_id', docenteId);

    if (asignError) return res.status(500).json(asignError);

    const asigns = asignaciones || [];

    const materiasMap = new Map();

    asigns.forEach(a => {
      const matId = a.materias?.id;
      if (!matId) return;

      if (!materiasMap.has(matId)) {
        materiasMap.set(matId, {
          id: matId,
          nombre_materia: a.materias.nombre_materia,
          grupos: []
        });
      }

      materiasMap.get(matId).grupos.push({
        grado: a.grupos?.grado,
        seccion: a.grupos?.seccion
      });
    });

    materias = Array.from(materiasMap.values()).map(m => {
  const firstGroup = m.grupos?.[0] || {};

  return {
    id: m.id,
    nombre_materia: m.nombre_materia,
    grado: firstGroup.grado,
    seccion: firstGroup.seccion
  };
});

    const uniqueGrupos = new Set(asigns.map(a => a.grupo_id));
    const uniqueMaterias = new Set(asigns.map(a => a.materia_id));

    const { data: profile } = await supabaseAdmin
      .from('usuarios')
      .select('id, nombre_completo')
      .eq('id', docenteId)
      .maybeSingle();

    res.json({
      docente: profile,
      resumen: {
        grupos: uniqueGrupos.size,
        materias: uniqueMaterias.size
      },
      materias
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Dashboard error' });
  }
});



module.exports = router;
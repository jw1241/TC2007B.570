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

router.get('/:docenteId/clases', async (req, res) => {
  const { docenteId } = req.params;

  const { data, error } = await supabaseAdmin
    .from('asignaciones_docentes')
    .select(`
      grupo_id,
      materia_id,
      grupos:grupo_id (
        id,
        grado,
        seccion
      ),
      materias:materia_id (
        id,
        nombre_materia
      )
    `)
    .eq('docente_id', docenteId);

  if (error) {
    return res.status(500).json(error);
  }

  const clases = (data || []).map(c => ({
    grupo_id: c.grupo_id,
    materia_id: c.materia_id,
    nombre_materia: c.materias?.nombre_materia,
    grado: c.grupos?.grado,
    seccion: c.grupos?.seccion
  }));

  res.json(clases);
});

router.get('/periodos', async (req, res) => {

  const { data, error } = await supabaseAdmin
    .from('periodos_evaluacion')
    .select('*')
    .order('mes_inicio');

  if (error) return res.status(500).json(error);

  res.json(data || []);
});

router.get(
  '/grupo/:grupoId/materia/:materiaId/periodo/:periodoId/alumnos',
  async (req, res) => {

    const {
      grupoId,
      materiaId,
      periodoId
    } = req.params;

    const { data: alumnos, error } = await supabaseAdmin
      .from('alumnos')
      .select(`
        id,
        matricula,
        nombre_completo
      `)
      .eq('grupo_id', grupoId)
      .order('nombre_completo');

    if (error) {
      return res.status(500).json(error);
    }

    const alumnoIds = alumnos.map(a => a.id);

    const { data: calificaciones } = await supabaseAdmin
      .from('calificaciones')
      .select('*')
      .eq('materia_id', materiaId)
      .eq('periodo_id', periodoId)
      .in('alumno_id', alumnoIds);

    const gradesMap = new Map();

    (calificaciones || []).forEach(c => {
      gradesMap.set(c.alumno_id, c);
    });

    const response = alumnos.map(a => ({
      id: a.id,
      matricula: a.matricula,
      nombre_completo: a.nombre_completo,
      nota: gradesMap.get(a.id)?.nota ?? null,
      comentario: gradesMap.get(a.id)?.comentario ?? ''
    }));

    res.json(response);
  }
);

router.put('/calificaciones', async (req, res) => {

  const {
    id,
    alumno_id,
    materia_id,
    periodo_id,
    tarea,
    nota,
    comentario
  } = req.body;

  if (id) {

    const { error } = await supabaseAdmin
      .from('calificaciones')
      .update({
        tarea,
        nota,
        comentario
      })
      .eq('id', id);

    if (error) return res.status(500).json(error);

  } else {

    const { error } = await supabaseAdmin
      .from('calificaciones')
      .insert({
        alumno_id,
        materia_id,
        periodo_id,
        tarea,
        nota,
        comentario
      });

    if (error) return res.status(500).json(error);
  }

  res.json({ success: true });
});

router.get('/periodos/:periodoId/status', async (req, res) => {

  const { periodoId } = req.params;

  const { data } = await supabaseAdmin
    .from('boletas_publicadas')
    .select('*')
    .eq('periodo_id', periodoId)
    .maybeSingle();

  res.json({
    publicada: data?.publicada || false
  });
});

router.post('/periodos/:periodoId/publicar', async (req, res) => {

  const { periodoId } = req.params;
  const { usuarioId } = req.body;

  console.log(usuarioId)

  const { error } = await supabaseAdmin
    .from('boletas_publicadas')
    .upsert({
      periodo_id: periodoId,
      publicada: true,
      publicada_por: usuarioId,
      publicada_en: new Date()
    });

  if (error) {
    return res.status(500).json(error);
  }

  res.json({
    success: true
  });
});

router.get(
  '/alumnos/:alumnoId/boleta/:periodoId',
  async (req, res) => {

    const { alumnoId, periodoId } = req.params;

    const { data, error } = await supabaseAdmin
      .from('calificaciones')
      .select(`
        nota,
        comentario,
        materias (
          nombre_materia
        )
      `)
      .eq('alumno_id', alumnoId)
      .eq('periodo_id', periodoId);

    if (error) {
      return res.status(500).json(error);
    }

    res.json(data || []);
  }
);

router.get(
  '/materia/:materiaId/grupo/:grupoId/periodo/:periodoId',
  async (req, res) => {

    const { materiaId, grupoId, periodoId } = req.params;

    try {

      const { data: alumnos, error } = await supabaseAdmin
        .from('alumnos')
        .select(`
          id,
          nombre_completo,
          matricula
        `)
        .eq('grupo_id', grupoId)
        .order('nombre_completo');

      if (error) {
        return res.status(500).json(error);
      }

      const alumnoIds = (alumnos || []).map(a => a.id);

      const { data: calificaciones, error: gradesError } =
        await supabaseAdmin
          .from('calificaciones')
          .select(`
            id,
            alumno_id,
            tarea,
            nota,
            comentario
          `)
          .eq('materia_id', materiaId)
          .eq('periodo_id', periodoId)
          .in('alumno_id', alumnoIds);

      if (gradesError) {
        return res.status(500).json(gradesError);
      }

      const resultado = (alumnos || []).map(alumno => ({

  id: alumno.id,

  nombre_completo: alumno.nombre_completo,

  matricula: alumno.matricula,

  tareas: (calificaciones || [])
    .filter(c => c.alumno_id === alumno.id)
    .map(c => ({
      id: c.id,
      tarea: c.tarea,
      nota: c.nota,
      comentario: c.comentario
    }))
}));

res.json(resultado);

    } catch (err) {

      console.error(err);

      res.status(500).json({
        message: 'Error obteniendo alumnos'
      });
    }
  }
);

router.post('/calificaciones', async (req, res) => {

  const {
    alumno_id,
    materia_id,
    periodo_id,
    tarea,
    nota,
    comentario
  } = req.body;

  const { data, error } = await supabaseAdmin
    .from('calificaciones')
    .insert({
      alumno_id,
      materia_id,
      periodo_id,
      tarea,
      nota,
      comentario
    })
    .select()
    .single();

  if (error) {
    return res.status(500).json(error);
  }

  res.json(data);
});

router.put('/calificaciones/:id', async (req, res) => {

  const { id } = req.params;

  const {
    tarea,
    nota,
    comentario
  } = req.body;

  const { error } = await supabaseAdmin
    .from('calificaciones')
    .update({
      tarea,
      nota,
      comentario
    })
    .eq('id', id);

  if (error) {
    return res.status(500).json(error);
  }

  res.json({
    success: true
  });
});

router.delete('/calificaciones/:id', async (req, res) => {

  const { id } = req.params;

  const { error } = await supabaseAdmin
    .from('calificaciones')
    .delete()
    .eq('id', id);

  if (error) {
    return res.status(500).json(error);
  }

  res.json({
    success: true
  });
});

router.get(
  '/periodos/:periodoId/firmas',
  async (req, res) => {

    const { periodoId } = req.params;

    // all student-parent relationships
    const { data: parentescos, error } =
      await supabaseAdmin
        .from('parentescos')
        .select(`
          alumno_id,
          padre_id,
          alumnos (
            nombre_completo
          ),
          usuarios (
            nombre_completo
          )
        `);

    if (error) {
      return res.status(500).json(error);
    }

    const { data: firmas, error: firmasError } =
  await supabaseAdmin
    .from('firmas_boletas')
    .select('*')
    .eq('periodo_id', periodoId);

console.log('PERIODO ID', periodoId);
console.log('FIRMAS DATA', firmas);
console.log('FIRMAS ERROR', firmasError);

    const firmasMap =
  new Map(
    (firmas || []).map(f => [
      `${f.alumno_id}-${f.padre_id}`,
      f
    ])
  );

const resultado =
  parentescos.map(p => {

    const firma =
      firmasMap.get(
        `${p.alumno_id}-${p.padre_id}`
      );

    return {
      alumno: p.alumnos.nombre_completo,
      padre: p.usuarios.nombre_completo,
      firmada: !!firma,
      fechaFirma: firma?.firmado_en || null
    };
  });

    res.json(resultado);
  }
);

module.exports = router;
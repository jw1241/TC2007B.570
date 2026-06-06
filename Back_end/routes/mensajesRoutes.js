const express = require("express");
const router = express.Router();
const Joi = require("joi");
const { supabaseAdmin } = require("../config/supabaseClient");
const { authMiddleware } = require("../middleware/authMiddleware");
const { requireRole } = require("../middleware/roleMiddleware");
const ROLES = require("../constants/roles");

const getInternalUser = async (authUserId) => {
  const { data, error } = await supabaseAdmin
    .from("usuarios")
    .select("id, rol_id, nombre_completo, email")
    .eq("auth_user_id", authUserId)
    .maybeSingle();

  if (error) {
    console.error("Supabase error:", error);
    return null;
  }

  return data || null;
};


/**
 * @swagger
 * /api/mensajes/contactos:
 *   get:
 *     summary: Obtener la lista de contactos disponibles para chatear
 *     tags: [Mensajes]
 *     security:
 *       - bearerAuth: []
 */
router.get("/contactos", authMiddleware, async (req, res) => {
  const usuario = await getInternalUser(req.user.auth_user_id);
  console.log('usuario', usuario)

  if (!usuario) {
    return res.status(404).json({ error: "Perfil no encontrado" });
  }

  const usuarioId = usuario.id;
  const rol = usuario.rol_id;
  console.log('usuarioid',usuarioId)
  console.log("ROLE RAW:", rol);
console.log("ROLE DOCENTE CONST:", ROLES.DOCENTE);
console.log("ROLE PADRE CONST:", ROLES.PADRE);

  let contactos = [];
  

  if (rol === ROLES.DOCENTE) {

  const { data: asignaciones } = await supabaseAdmin
    .from("asignaciones_docentes")
    .select("grupo_id, materia_id")
    .eq("docente_id", usuarioId);

  const gruposIds = [...new Set((asignaciones || []).map(a => a.grupo_id))];

  if (gruposIds.length) {

    // 1. Get alumnos + grupo info
    const { data: alumnos } = await supabaseAdmin
      .from("alumnos")
      .select(`
        id,
        nombre_completo,
        grupo:grupos!alumnos_grupo_id_fkey (
          grado,
          seccion
        )
      `)
      .in("grupo_id", gruposIds);

    // 2. Get materias map (optional enrichment)
    const { data: materias } = await supabaseAdmin
      .from("asignaciones_docentes")
      .select("grupo_id, materia:materias(nombre_materia)")
      .eq("docente_id", usuarioId);

    contactos = (alumnos || []).map(a => ({
      id: a.id,
      tipo: "alumno",
      nombre_completo: a.nombre_completo,
      grado: a.grupo?.grado,
      seccion: a.grupo?.seccion,
      materias: materias
        ?.filter(m => m.grupo_id === a.grupo_id)
        ?.map(m => m.materia?.nombre_materia) || []
    }));
    
  }
}

  if (rol === ROLES.PADRE) {

  const { data: parentescos } = await supabaseAdmin
    .from("parentescos")
    .select(`
      alumno_id,
      alumnos (
        id,
        nombre_completo,
        grupo:grupos!alumnos_grupo_id_fkey (
          grado,
          seccion
        )
      )
    `)
    .eq("padre_id", usuarioId);

  contactos = (parentescos || []).map(p => ({
    id: p.alumnos.id,
    tipo: "alumno",
    nombre_completo: p.alumnos.nombre_completo,
    grado: p.alumnos.grupo?.grado,
    seccion: p.alumnos.grupo?.seccion
  }));
  console.log('contactos',contactos)
}

  return res.json({ data: contactos });
});

/**
 * @swagger
 * /api/mensajes/chat/{destinatario_id}:
 *   get:
 *     summary: Obtener historial de conversación con un usuario
 *     tags: [Mensajes]
 *     security:
 *       - bearerAuth: []
 */
router.get("/chat/:destinatario_id", authMiddleware, async (req, res, next) => {
  try {
    const usuario = await getInternalUser(req.user.auth_user_id);

    if (!usuario) {
      return res.status(404).json({ error: "Perfil no encontrado" });
    }

    const remitenteId = usuario.id;
    const rol = usuario.rol_id;

    const destinatarioId = req.params.destinatario_id;

    let padre_id, docente_id;

    if (rol === ROLES.PADRE) {
      padre_id = remitenteId;
      docente_id = destinatarioId;
    } else {
      padre_id = destinatarioId;
      docente_id = remitenteId;
    }

    const alumno_id = req.query.alumno_id || null;

    let query = supabaseAdmin
      .from("conversaciones")
      .select("id")
      .eq("padre_id", padre_id)
      .eq("docente_id", docente_id);
    
    if (alumno_id) {
        query = query.eq("alumno_id", alumno_id);
    } else {
        query = query.is("alumno_id", null);
    }
    
    let { data: conversacion } = await query.maybeSingle();

    if (!conversacion) {
      const { data: nueva, error } = await supabaseAdmin
        .from("conversaciones")
        .insert({ padre_id, docente_id, alumno_id: null })
        .select("id")
        .single();

      if (error) throw error;
      conversacion = nueva;
    }

    const { data: mensajes, error: msgErr } = await supabaseAdmin
      .from("mensajes")
      .select("*")
      .eq("conversacion_id", conversacion.id)
      .order("creado_en", { ascending: true });

    if (msgErr) throw msgErr;

    res.json({ data: mensajes });

  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /api/mensajes/enviar:
 *   post:
 *     summary: Enviar un mensaje a un destinatario
 *     tags: [Mensajes]
 *     security:
 *       - bearerAuth: []
 */
router.post("/enviar", authMiddleware, async (req, res, next) => {
  try {
    const schema = Joi.object({
      alumno_id: Joi.any().required(),
      docente_id: Joi.any().optional(),
      contenido: Joi.string().min(1).max(1000).required()
    });

    const { error, value } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const usuario = await getInternalUser(req.user.auth_user_id);
    if (!usuario) {
      return res.status(404).json({ error: "Perfil no encontrado" });
    }

    const { alumno_id, docente_id, contenido } = value;
    const remitenteId = usuario.id;
    const resultados = [];

    if (usuario.rol_id === ROLES.DOCENTE) {
      // 1. GET ALL PARENTS
      const { data: parentescos } = await supabaseAdmin
        .from("parentescos")
        .select("padre_id")
        .eq("alumno_id", alumno_id);

      const padresIds = (parentescos || []).map(p => p.padre_id);

      if (!padresIds.length) {
        return res.status(400).json({ error: "El alumno no tiene padres" });
      }

      // 2. SEND TO EACH PARENT
      for (const padre_id of padresIds) {
        let { data: conversacion } = await supabaseAdmin
          .from("conversaciones")
          .select("id")
          .eq("padre_id", padre_id)
          .eq("docente_id", remitenteId)
          .eq("alumno_id", alumno_id)
          .maybeSingle();

        let conversacionId = conversacion?.id;

        if (!conversacionId) {
          const { data: nueva, error: convErr } = await supabaseAdmin
            .from("conversaciones")
            .insert({ padre_id, docente_id: remitenteId, alumno_id })
            .select("id")
            .single();

          if (convErr) throw convErr;
          conversacionId = nueva.id;
        }

        const { data: mensaje, error: msgErr } = await supabaseAdmin
          .from("mensajes")
          .insert({
            conversacion_id: conversacionId,
            remitente_id: remitenteId,
            contenido,
            estado: "enviado"
          })
          .select("*")
          .single();

        if (msgErr) throw msgErr;
        resultados.push(mensaje);
      }
    } else if (usuario.rol_id === ROLES.PADRE) {
      if (!docente_id) {
        return res.status(400).json({ error: "docente_id es requerido para padres" });
      }
      
      const padre_id = remitenteId;

      let { data: conversacion } = await supabaseAdmin
        .from("conversaciones")
        .select("id")
        .eq("padre_id", padre_id)
        .eq("docente_id", docente_id)
        .eq("alumno_id", alumno_id)
        .maybeSingle();

      let conversacionId = conversacion?.id;

      if (!conversacionId) {
        const { data: nueva, error: convErr } = await supabaseAdmin
          .from("conversaciones")
          .insert({ padre_id, docente_id, alumno_id })
          .select("id")
          .single();

        if (convErr) throw convErr;
        conversacionId = nueva.id;
      }

      const { data: mensaje, error: msgErr } = await supabaseAdmin
        .from("mensajes")
        .insert({
          conversacion_id: conversacionId,
          remitente_id: remitenteId,
          contenido,
          estado: "enviado"
        })
        .select("*")
        .single();

      if (msgErr) throw msgErr;
      resultados.push(mensaje);
    }

    return res.status(201).json({
      message: "Mensaje procesado correctamente",
      data: resultados
    });

  } catch (err) {
    next(err);
  }
});

router.get("/alumno/:alumno_id/parent", authMiddleware, async (req, res, next) => {
  try {
    const alumnoId = req.params.alumno_id;

    const usuario = await getInternalUser(req.user.auth_user_id);
    if (!usuario) {
      return res.status(404).json({ error: "Perfil no encontrado" });
    }

    // Get ALL parents (NOT just first one)
    const { data: parentescos } = await supabaseAdmin
      .from("parentescos")
      .select(`
        padre_id,
        usuarios:padre_id (
          id,
          nombre_completo,
          email
        )
      `)
      .eq("alumno_id", alumnoId);

    const parents = (parentescos || []).map(p => ({
      id: p.usuarios.id,
      nombre_completo: p.usuarios.nombre_completo,
      email: p.usuarios.email
    }));

    return res.json({ data: parents });

  } catch (err) {
    next(err);
  }
});

router.get("/chat/:parent_id", authMiddleware, async (req, res, next) => {
  try {
    const parentId = req.params.parent_id;

    const usuario = await getInternalUser(req.user.auth_user_id);
    if (!usuario) {
      return res.status(404).json({ error: "Perfil no encontrado" });
    }

    const docenteId = usuario.id;

    const padre_id = parentId;
    const docente_id = docenteId;

    // find or create conversation
    let { data: conversacion } = await supabaseAdmin
      .from("conversaciones")
      .select("id")
      .eq("padre_id", padre_id)
      .eq("docente_id", docente_id)
      .maybeSingle();

    if (!conversacion) {
      const { data: nueva } = await supabaseAdmin
        .from("conversaciones")
        .insert({
          padre_id,
          docente_id,
          alumno_id: null
        })
        .select("id")
        .single();

      conversacion = nueva;
    }

    const { data: mensajes } = await supabaseAdmin
      .from("mensajes")
      .select("*")
      .eq("conversacion_id", conversacion.id)
      .order("creado_en", { ascending: true });

    res.json({ data: { mensajes, conversacion_id: conversacion.id } });

  } catch (err) {
    next(err);
  }
});

router.get("/chat/alumno/:alumno_id", authMiddleware, async (req, res, next) => {
  try {
    const alumnoId = req.params.alumno_id;

    const usuario = await getInternalUser(req.user.auth_user_id);
    const docenteId = usuario.id;

    // get all parents
    const { data: parentescos } = await supabaseAdmin
      .from("parentescos")
      .select("padre_id")
      .eq("alumno_id", alumnoId);

    const padresIds = (parentescos || []).map(p => p.padre_id);

    const allMessages = [];

    for (const padre_id of padresIds) {

      const { data: conv } = await supabaseAdmin
        .from("conversaciones")
        .select("id")
        .eq("padre_id", padre_id)
        .eq("docente_id", docenteId)
        .eq("alumno_id", alumnoId)
        .maybeSingle();

      if (!conv) continue;

      const { data: msgs } = await supabaseAdmin
        .from("mensajes")
        .select("*")
        .eq("conversacion_id", conv.id);

      allMessages.push(...(msgs || []));
    }

    allMessages.sort((a, b) =>
      new Date(a.creado_en) - new Date(b.creado_en)
    );

    res.json({ data: allMessages });

  } catch (err) {
    next(err);
  }
});

router.get("/alumno/:alumno_id/teachers", authMiddleware, async (req, res, next) => {
  try {
    const alumnoId = req.params.alumno_id;

    const usuario = await getInternalUser(req.user.auth_user_id);
    if (!usuario) {
      return res.status(404).json({ error: "Perfil no encontrado" });
    }

    // 1. Get student's group
    const { data: alumno, error: alumnoErr } = await supabaseAdmin
      .from("alumnos")
      .select("grupo_id")
      .eq("id", alumnoId)
      .single();

    if (alumnoErr || !alumno) {
      return res.status(404).json({ error: "Alumno no encontrado" });
    }

    // 2. Get teacher assignments for that group
    const { data: asignaciones, error: asigErr } = await supabaseAdmin
      .from("asignaciones_docentes")
      .select(`
        docente_id,
        usuarios:docente_id (
          id,
          nombre_completo,
          email
        )
      `)
      .eq("grupo_id", alumno.grupo_id);

    if (asigErr) throw asigErr;

    // 3. Map + deduplicate teachers
    const teacherMap = new Map();

    (asignaciones || []).forEach(a => {
      if (a.usuarios) {
        teacherMap.set(a.usuarios.id, {
          id: a.usuarios.id,
          nombre_completo: a.usuarios.nombre_completo,
          email: a.usuarios.email
        });
      }
    });

    const teachers = Array.from(teacherMap.values());

    return res.json({ data: teachers });

  } catch (err) {
    next(err);
  }
});

router.get("/alumno/:alumno_id/chat", authMiddleware, async (req, res, next) => {
  try {
    const alumnoId = req.params.alumno_id;
    console.log('alumno', alumnoId)

    const usuario = await getInternalUser(req.user.auth_user_id);
    if (!usuario) {
      return res.status(404).json({ error: "Perfil no encontrado" });
    }

    const docenteId = usuario.id;
    console.log('docente', docenteId)

    // 1. get parents of student
    const { data: parentescos } = await supabaseAdmin
      .from("parentescos")
      .select("padre_id")
      .eq("alumno_id", alumnoId);

    const padresIds = (parentescos || []).map(p => p.padre_id);
    console.log('padre',padresIds)

    const allMessages = [];

    for (const padre_id of padresIds) {

      // 2. ensure conversation exists
      let { data: conv } = await supabaseAdmin
        .from("conversaciones")
        .select("id")
        .eq("padre_id", padre_id)
        .eq("docente_id", docenteId)
        .eq("alumno_id", alumnoId)
        .maybeSingle();

      if (!conv) {
        const { data: nueva } = await supabaseAdmin
          .from("conversaciones")
          .insert({
            padre_id,
            docente_id: docenteId,
            alumno_id: alumnoId
          })
          .select("id")
          .single();

        conv = nueva;
      }

      // 3. get messages
      const { data: msgs } = await supabaseAdmin
        .from("mensajes")
        .select("*")
        .eq("conversacion_id", conv.id)
        .order("creado_en", { ascending: true });

      allMessages.push(...(msgs || []));
    }

    // 4. sort globally
    allMessages.sort((a, b) =>
      new Date(a.creado_en) - new Date(b.creado_en)
    );

    return res.json({ data: allMessages });

  } catch (err) {
    next(err);
  }
});

router.get("/chat/:alumno_id/:teacher_id", authMiddleware, async (req, res, next) => {
  try {
    const { alumno_id, teacher_id } = req.params;

    const usuario = await getInternalUser(req.user.auth_user_id);
    if (!usuario) return res.status(404).json({ error: "Perfil no encontrado" });

    const docenteId = teacher_id;

    // 1. get parents (same as SEND)
    const { data: parentescos } = await supabaseAdmin
      .from("parentescos")
      .select("padre_id")
      .eq("alumno_id", alumno_id);

    const padresIds = (parentescos || []).map(p => p.padre_id);

    const allMessages = [];

    for (const padre_id of padresIds) {

      // 2. SAME EXACT CONVERSATION AS SEND
      const { data: conv } = await supabaseAdmin
        .from("conversaciones")
        .select("id")
        .eq("padre_id", padre_id)
        .eq("docente_id", docenteId)
        .eq("alumno_id", alumno_id)
        .maybeSingle();

      if (!conv) continue;

      const { data: msgs } = await supabaseAdmin
        .from("mensajes")
        .select("*")
        .eq("conversacion_id", conv.id)
        .order("creado_en", { ascending: true });

      allMessages.push(...(msgs || []));
    }

    return res.json({ data: allMessages });

  } catch (err) {
    next(err);
  }
});
module.exports = router;

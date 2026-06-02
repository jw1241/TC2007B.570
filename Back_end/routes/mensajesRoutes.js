const express = require("express");
const router = express.Router();
const Joi = require("joi");
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
 * /api/mensajes/contactos:
 *   get:
 *     summary: Obtener la lista de contactos disponibles para chatear
 *     tags: [Mensajes]
 *     security:
 *       - bearerAuth: []
 */
router.get("/contactos", authMiddleware, async (req, res, next) => {
  try {
    const usuarioId = await getInternalUserId(req.user.id);
    const rol = req.user.profile.rol_id;

    if (!usuarioId) return res.status(404).json({ error: { message: "Perfil no encontrado" } });

    let contactos = [];

    if (rol === ROLES.PADRE) {
      // El padre puede ver a los docentes de sus hijos
      // 1. Encontrar sus hijos
      const { data: parentescos } = await supabaseAdmin.from("parentescos").select("alumno_id").eq("padre_id", usuarioId);
      const alumnosIds = parentescos?.map(p => p.alumno_id) || [];

      if (alumnosIds.length > 0) {
        // 2. Encontrar grupos de sus hijos
        const { data: alumnos } = await supabaseAdmin.from("alumnos").select("grupo_id").in("id", alumnosIds);
        const gruposIds = alumnos?.map(a => a.grupo_id) || [];

        if (gruposIds.length > 0) {
          // 3. Encontrar docentes de esos grupos
          const { data: asignaciones } = await supabaseAdmin.from("asignaciones_docentes").select("docente_id, materias(nombre)").in("grupo_id", gruposIds);
          const docentesIds = [...new Set(asignaciones?.map(a => a.docente_id) || [])];

          // 4. Obtener perfiles de docentes
          if (docentesIds.length > 0) {
             const { data: perfiles } = await supabaseAdmin.from("usuarios").select("id, nombre_completo, email").in("id", docentesIds);
             contactos = perfiles || [];
          }
        }
      }

    } else if (rol === ROLES.DOCENTE) {
      // El docente puede ver a los padres de sus alumnos
      // 1. Encontrar sus grupos
      const { data: asignaciones } = await supabaseAdmin.from("asignaciones_docentes").select("grupo_id").eq("docente_id", usuarioId);
      const gruposIds = asignaciones?.map(a => a.grupo_id) || [];

      if (gruposIds.length > 0) {
        // 2. Encontrar alumnos
        const { data: alumnos } = await supabaseAdmin.from("alumnos").select("id").in("grupo_id", gruposIds);
        const alumnosIds = alumnos?.map(a => a.id) || [];

        if (alumnosIds.length > 0) {
          // 3. Encontrar padres
          const { data: parentescos } = await supabaseAdmin.from("parentescos").select("padre_id").in("alumno_id", alumnosIds);
          const padresIds = [...new Set(parentescos?.map(p => p.padre_id) || [])];

          // 4. Obtener perfiles
          if (padresIds.length > 0) {
            const { data: perfiles } = await supabaseAdmin.from("usuarios").select("id, nombre_completo, email").in("id", padresIds);
            contactos = perfiles || [];
          }
        }
      }
    } else if (rol === ROLES.ADMIN) {
        // El admin ve a todos
        const { data: perfiles } = await supabaseAdmin.from("usuarios").select("id, nombre_completo, email, rol_id");
        contactos = perfiles || [];
    }

    res.json({ data: contactos });
  } catch (err) {
    next(err);
  }
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
    const destinatarioId = req.params.destinatario_id;
    const remitenteId = await getInternalUserId(req.user.id);
    const rol = req.user.profile.rol_id;

    if (!remitenteId) return res.status(404).json({ error: { message: "Perfil no encontrado" } });

    // Determinar quién es Padre y quién Docente para buscar o crear la conversación
    let padre_id = null;
    let docente_id = null;

    if (rol === ROLES.PADRE) {
      padre_id = remitenteId;
      docente_id = destinatarioId;
    } else {
      padre_id = destinatarioId;
      docente_id = remitenteId;
    }

    // Buscar conversación existente
    let { data: conversacion } = await supabaseAdmin
      .from("conversaciones")
      .select("id")
      .eq("padre_id", padre_id)
      .eq("docente_id", docente_id)
      .single();

    // Si no existe, creamos una (se necesita un alumno_id, buscaremos el primero que tengan en común)
    if (!conversacion) {
       // Buscar parentesco de este padre
       const { data: parentescos } = await supabaseAdmin.from("parentescos").select("alumno_id").eq("padre_id", padre_id);
       const alumnosIds = parentescos?.map(p => p.alumno_id) || [];
       let alumnoEnComun = alumnosIds[0] || null; // Fallback al primero

       const { data: nuevaConv } = await supabaseAdmin
         .from("conversaciones")
         .insert([{ padre_id, docente_id, alumno_id: alumnoEnComun }])
         .select("id")
         .single();
         
       conversacion = nuevaConv;
    }

    // Buscar mensajes de esta conversacion
    if (!conversacion) return res.json({ data: [] });

    const { data: mensajes, error } = await supabaseAdmin
      .from("mensajes")
      .select("*")
      .eq("conversacion_id", conversacion.id)
      .order("creado_en", { ascending: true });

    if (error) throw error;

    // Marcar como leídos los que no son míos
    const mensajesAActualizar = mensajes.filter(m => m.remitente_id !== remitenteId && m.estado !== 'leido').map(m => m.id);
    if (mensajesAActualizar.length > 0) {
      await supabaseAdmin.from("mensajes").update({ estado: 'leido' }).in("id", mensajesAActualizar);
    }

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
      destinatario_id: Joi.string().uuid().required(),
      contenido: Joi.string().trim().min(1).max(1000).required()
    });

    const { error, value } = schema.validate(req.body);
    if (error) return res.status(400).json({ error: { message: "Datos inválidos", details: error.details.map(d=>d.message) } });

    const { destinatario_id, contenido } = value;
    const remitenteId = await getInternalUserId(req.user.id);
    const rol = req.user.profile.rol_id;

    let padre_id = null;
    let docente_id = null;

    if (rol === ROLES.PADRE) {
      padre_id = remitenteId;
      docente_id = destinatario_id;
    } else {
      padre_id = destinatario_id;
      docente_id = remitenteId;
    }

    // Buscar la conversación
    const { data: conversacion, error: convError } = await supabaseAdmin
      .from("conversaciones")
      .select("id")
      .eq("padre_id", padre_id)
      .eq("docente_id", docente_id)
      .single();

    if (convError || !conversacion) {
      return res.status(404).json({ error: { message: "Conversación no encontrada. Debe abrir el chat primero." } });
    }

    // Insertar el mensaje
    const { data: nuevoMensaje, error: msgError } = await supabaseAdmin
      .from("mensajes")
      .insert([{
        conversacion_id: conversacion.id,
        remitente_id: remitenteId,
        contenido: contenido,
        estado: 'enviado'
      }])
      .select("*")
      .single();

    if (msgError) throw msgError;

    res.status(201).json({ message: "Mensaje enviado", data: nuevoMensaje });

  } catch (err) {
    next(err);
  }
});

module.exports = router;

const express = require("express");
const router = express.Router();
const Joi = require("joi");
const { supabaseAdmin } = require("../config/supabaseClient");

const { authMiddleware } = require("../middleware/authMiddleware");
const { requireRole } = require("../middleware/roleMiddleware");
const ROLES = require("../constants/roles");

const crypto = require('crypto');

router.get(
  "/usuarios",
  authMiddleware,
  requireRole([ROLES.ADMIN]),
  async (req, res, next) => {
    try {
      const page = parseInt(req.query.page || "1");
      const limit = parseInt(req.query.limit || "20");

      const from = (page - 1) * limit;
      const to = from + limit - 1;

      const { data, error } = await supabaseAdmin
        .from("usuarios")
        .select("id, email, nombre_completo, rol_id, activo")
        .range(from, to);

      if (error) {
        return res.status(500).json({
          error: {
            message: "Error fetching users",
            details: error.message
          }
        });
      }

      res.json({
        message: "Usuarios obtenidos correctamente",
        data
      });

    } catch (err) {
      next(err);
    }
  }
);

router.post(
  "/usuarios",
  authMiddleware,
  requireRole([ROLES.ADMIN]),
  async (req, res, next) => {

    try {

      const schema = Joi.object({

        email:
          Joi.string()
            .email()
            .trim()
            .lowercase()
            .required(),

        rol_id:
          Joi.number()
            .integer()
            .positive()
            .required(),

        nombre_completo:
          Joi.string()
            .trim()
            .min(2)
            .max(100)
            .required(),

        grupo_id:
          Joi.string()
            .uuid()
            .optional(),

        matricula:
          Joi.string()
            .trim()
            .optional(),

        materia_id:
        Joi.string()
          .uuid()
          .optional()

      });

      const { error, value } =
        schema.validate(req.body);

      if (error) {

        return res.status(400).json({
          error: {
            message: "Datos inválidos"
          }
        });

      }

      const {
  email,
  rol_id,
  nombre_completo,
  grupo_id,
  matricula,
  materia_id
} = value;

      // =====================================
      // VALIDATIONS
      // =====================================

      if (
  rol_id === ROLES.DOCENTE &&
  (!grupo_id || !materia_id)
) {

        return res.status(400).json({
          error: {
            message:
              "grupo_id y materia_id son requeridos para docentes"
          }
        });

      }

      if (
        rol_id === ROLES.PADRE &&
        !matricula
      ) {

        return res.status(400).json({
          error: {
            message:
              "matricula es requerida para padres"
          }
        });

      }

      // =====================================
      // INVITE USER
      // =====================================

      const temporaryPassword =
  Math.random().toString(36).slice(-10) + "A1!";

const {
  data,
  error: createError
} =
  await supabaseAdmin.auth.admin.createUser({

    email,
    password: temporaryPassword,

    email_confirm: true,

    user_metadata: {

      rol_id,
      nombre_completo

    }

  });

      if (createError) {

        return res.status(400).json({

          Error: {

            message:
              "Error creando usarios",

            details:
              createError.message

          }

        });

      }

      const authUserId =
        data.user.id;


      await supabaseAdmin
  .from('usuarios')
  .update({

    password_temporal:
      temporaryPassword,

    requiere_cambio_password:
      true,

    activo:
      false

  })
  .eq('id', authUserId);

      const {
  data: usuario,
  error: usuarioFetchError
} =
  await supabaseAdmin
    .from('usuarios')
    .select('id')
    .eq('id', authUserId)
    .single();

if (usuarioFetchError || !usuario) {

  return res.status(400).json({

    error: {

      message:
        "Usuario no encontrado después de invitación",

      details:
        usuarioFetchError?.message

    }

  });

}

      // =====================================
// PROFESOR
// =====================================

if (rol_id === ROLES.DOCENTE) {

  // VERIFY GROUP EXISTS

  const {
    data: grupo,
    error: grupoError
  } =
    await supabaseAdmin
      .from('grupos')
      .select('id')
      .eq('id', grupo_id)
      .single();

  if (!grupo || grupoError) {

    return res.status(404).json({
      error: {
        message: "Grupo no encontrado"
      }
    });

  }

  const {
  data: materia,
  error: materiaError
} =
  await supabaseAdmin
    .from('materias')
    .select('id')
    .eq('id', materia_id)
    .single();

if (!materia || materiaError) {

  return res.status(404).json({
    error: {
      message: "Materia no encontrada"
    }
  });

}

  // CREATE ASSIGNMENT

  const {
    error: asignacionError
  } =
    await supabaseAdmin
      .from('asignaciones_docentes')
      .insert({

        docente_id:
          usuario.id,

        grupo_id,

        materia_id

      });

  if (asignacionError) {

    console.error(asignacionError);

    return res.status(400).json({

      error: {

        message:
          "Error asignando profesor",

        details:
          asignacionError.message

      }

    });

  }

}

      // =====================================
      // PADRE
      // =====================================

      if (rol_id === ROLES.PADRE) {

        const {
          data: alumno,
          error: alumnoError
        } =
          await supabaseAdmin
            .from('alumnos')
            .select('id')
            .eq('matricula', matricula)
            .single();

        if (
          alumnoError ||
          !alumno
        ) {

          return res.status(404).json({

            error: {
              message:
                "Alumno no encontrado"
            }

          });

        }

        const {
          error: parentescoError
        } =
          await supabaseAdmin
            .from('parentescos')
            .insert({

              padre_id:
                usuario.id,

              alumno_id:
                alumno.id

            });

        if (parentescoError) {

          return res.status(400).json({

            error: {

              message:
                "Error creando parentesco",

              details:
                parentescoError.message

            }

          });

        }

      }

      return res.status(201).json({

  message:
    "Usuario creado correctamente",

  credenciales: {

    email,

    password_temporal:
      temporaryPassword

  }

});
    } catch (err) {

      next(err);

    }

  }
);

router.get("/tickets/recent", authMiddleware, requireRole([ROLES.ADMIN]), async (req, res) => {
  const { data, error } = await supabaseAdmin
    .from("soporte_tickets")
    .select(`
      id,
      ticket_codigo,
      asunto,
      estado,
      creado_en,
      usuarios(nombre_completo),
      soporte_archivos(archivo_url)
    `)
    .order("creado_en", { ascending: false })
    .limit(20);

  if (error) return res.status(500).json(error);

  res.json(data);
});

/**
 * @swagger
 * /api/admin/alumnos:
 *   get:
 *     summary: Obtener la lista de alumnos
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de todos los alumnos
 */
router.get(
  "/alumnos",
  authMiddleware,
  requireRole([ROLES.ADMIN]),
  async (req, res, next) => {
    try {
      const { data, error } = await supabaseAdmin
        .from("alumnos")
        .select(`
          id,
          matricula,
          nombre,
          apellidos,
          fecha_nacimiento,
          codigo_registro,
          grupos ( id, nombre, grado, seccion )
        `)
        .order('apellidos', { ascending: true });

      if (error) {
        return res.status(500).json({ error: { message: "Error fetching alumnos", details: error.message }});
      }

      res.json({ data });
    } catch (err) {
      next(err);
    }
  }
);

router.get("/tickets/stats", authMiddleware, requireRole([ROLES.ADMIN]), async (req, res) => {

  const { count: newTickets } = await supabaseAdmin
    .from("soporte_tickets")
    .select("*", { count: "exact", head: true })
    .eq("estado", "Pendiente");

  res.json({
    newTickets: newTickets || 0
  });
});

router.get(
  "/tickets/recent-with-files",
  authMiddleware,
  requireRole([ROLES.ADMIN]),
  async (req, res) => {

    const { data: tickets, error } = await supabaseAdmin
      .from("soporte_tickets")
      .select(`
        *,
        soporte_archivos (
          id,
          archivo_url
        )
      `)
      .order("creado_en", { ascending: false })
      .limit(20);

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.json(tickets);
  }
);
module.exports = router;

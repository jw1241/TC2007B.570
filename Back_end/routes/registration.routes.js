const express = require("express");
const router = express.Router();
const Joi = require("joi");

const { supabaseAdmin } = require("../config/supabaseClient");

const validateStudentSchema = Joi.object({

  studentId: Joi.string()
    .trim()
    .pattern(/^ALU-\d{5}$/)
    .message("La matrícula debe tener el formato ALU-XXXXX")
    .required(),

  registrationCode: Joi.string()
    .trim()
    .uppercase()
    .pattern(/^[A-Z0-9-]+$/)
    .min(6)
    .max(20)
    .required()

});

const validateAdminSchema = Joi.object({

  adminId: Joi.string()
    .trim()
    .required(),

  registrationCode: Joi.string()
    .trim()
    .uppercase()
    .pattern(/^[A-Z0-9-]+$/)
    .min(6)
    .max(20)
    .required()

});

/**
 * VALIDATE STUDENT + PARENT ACCOUNT
 */
router.post(
  "/validate-student",
  async (req, res, next) => {

    try {

      const {
        error,
        value
      } = validateStudentSchema.validate(req.body);

      if (error) {

        console.error(
          "VALIDATION ERROR:",
          error
        );

        return res.status(400).json({
          error: {
            message: "Datos inválidos"
          }
        });

      }


      const {
        studentId,
        registrationCode
      } = value;

      console.log(
        "INPUT RECEIVED:",
        value
      );

      console.log("REGISTRATION CODE:", registrationCode);

      /**
       * FIND ALUMNO
       */
      const {
        data: alumno,
        error: alumnoError
      } = await supabaseAdmin
        .from("alumnos")
        .select(`
          id,
          matricula,
          nombre_completo,
          codigo_registro
        `)
        .eq("matricula", studentId)
        .eq("codigo_registro", registrationCode)
        .maybeSingle();

      console.log(
        "ALUMNO RESULT:",
        alumno
      );

      if (alumnoError || !alumno) {

        return res.status(404).json({
          error: {
            message:
              "Alumno no encontrado"
          }
        });

      }

      /**
       * FIND PARENT USER
       * REQUIREMENTS:
       * - rol_id = 1
       * - registration code matches
       * - activo = false
       */
      const {
        data: usuarioPadre,
        error: usuarioError
      } = await supabaseAdmin
        .from("usuarios")
        .select(`
          id,
          nombre_completo,
          email,
          rol_id,
          activo,
          codigo_registro
        `)
        .eq("codigo_registro", registrationCode)
        .eq("rol_id", 3)
        .or("activo.is.null,activo.eq.false")
        .maybeSingle();

      console.log(
        "PADRE RESULT:",
        usuarioPadre
      );

      if (usuarioError || !usuarioPadre) {

        return res.status(404).json({
          error: {
            message:
              "Padre no encontrado o cuenta ya activada"
          }
        });

      }

      /**
       * SUCCESS RESPONSE
       */
      return res.json({

        success: true,

        registrationCode,

        alumno: {

          matricula:
            alumno.matricula,

          nombre_completo:
            alumno.nombre_completo

        },

        padre: {

          usuario_id:
            usuarioPadre.id,

          nombre_completo:
            usuarioPadre.nombre_completo,

          email:
            usuarioPadre.email

        }

      });

    } catch (err) {

      console.error(
        "VALIDATE STUDENT ERROR:",
        err
      );

      next(err);

    }

  }
);


const validateDocenteSchema = Joi.object({

  docenteId: Joi.string()
    .trim()
    .pattern(/^DOC-\d{5}$/)
    .message("La identificación debe tener el formato DOC-XXXXX")
    .required(),

  registrationCode: Joi.string()
    .trim()
    .uppercase()
    .pattern(/^[A-Z0-9-]+$/)
    .min(6)
    .max(20)
    .required()

});

router.post(
  "/validate-docente",
  async (req, res, next) => {

    try {

      const {
        error,
        value
      } = validateDocenteSchema.validate(req.body);

      if (error) {

        return res.status(400).json({
          error: {
            message: "Datos inválidos",
            details: error.details.map(d => d.message)
          }
        });

      }

      const {
        docenteId,
        registrationCode
      } = value;

      console.log("DOCENTE INPUT:", {
        docenteId,
        registrationCode
      });

      /**
       * VALIDATE DOCENTE
       * REQUIREMENTS:
       * - rol_id = 2
       * - registration code matches
       * - activo = false
       */
      console.log("LOOKUP INPUT:", { docenteId, registrationCode });

      const {
        data: docente,
        error: docenteError
      } = await supabaseAdmin
        .from("usuarios")
        .select(`
          id,
          nombre_completo,
          email,
          rol_id,
          identificacion_docente,
          activo,
          codigo_registro
        `)
        .eq("rol_id", 2)
        .eq("identificacion_docente", docenteId)
        .or("activo.is.null,activo.eq.false")
        .eq("codigo_registro", registrationCode)
        .maybeSingle();

      console.log("DOCENTE RESULT:", docente);
      console.log("DOCENTE ERROR:", docenteError);

      if (docenteError || !docente) {

        return res.status(400).json({
          error: {
            message:
              "Información incorrecta o cuenta ya activada"
          }
        });

      }

      /**
       * SAFE RESPONSE
       */
      return res.json({

        success: true,

        docente: {

          usuario_id: docente.id,

          identificacion_docente: docente.identificacion_docente,

          nombre_completo:
            docente.nombre_completo,

          email:
            docente.email,

          identificacion_docente:
            docente.identificacion_docente

        }

      });

    } catch (err) {

      console.error(
        "VALIDATE DOCENTE ERROR:",
        err
      );

      next(err);

    }

  }
);

router.post("/activate-account", async (req, res, next) => {
  try {
    console.log("📥 REQUEST BODY:", req.body);

    const schema = Joi.object({
      usuarioId: Joi.string().uuid().required(),
      registrationCode: Joi.string().required(),
      role: Joi.string().valid("padre", "docente", "admin").required(),
      email: Joi.string().email().required(),
      password: Joi.string()
        .min(12)
        .max(32)
        .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/)
        .required()
    });

    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      console.error("❌ VALIDATION ERROR:", error.details);

      return res.status(400).json({
        error: {
          message: "Datos inválidos",
          details: error.details.map(d => d.message)
        }
      });
    }

    const {
      usuarioId,
      registrationCode,
      role,
      email,
      password
    } = value;

    /**
     * ROLE MAPPING
     */
    const roleMap = {
      admin: 1,
      docente: 2,
      padre: 3
    };

    const mappedRole = roleMap[role];

    console.log("🧠 ROLE MAPPING:", { role, mappedRole });

    if (!mappedRole) {
      return res.status(400).json({
        error: { message: "Rol inválido" }
      });
    }

    /**
     * VERIFY USER EXISTS
     */
    console.log("🔎 VERIFYING USER:", {
      usuarioId,
      mappedRole
    });

    console.log("USUARIO ID:", usuarioId);

    const { data: usuario, error: usuarioError } = await supabaseAdmin
      .from("usuarios")
      .select("*")
      .eq("id", usuarioId)
      .eq("rol_id", mappedRole)
      .or("activo.is.null,activo.eq.false")
      .maybeSingle();

    console.log("📦 USER FOUND:", usuario);
    console.log("⚠️ USER ERROR:", usuarioError);

    if (usuarioError || !usuario) {
      return res.status(400).json({
        error: {
          message: "Usuario inválido o ya activado"
        }
      });
    }

    /**
     * CREATE AUTH USER
     */
    const { data: authData, error: authError } =
      await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true
      });

    if (authError) {
      console.error("❌ SUPABASE CREATE USER ERROR:", authError);

      return res.status(400).json({
        error: {
          message: authError.message
        }
      });
    }

    /**
     * UPDATE USERS TABLE
     */
    const { error: updateError } = await supabaseAdmin
      .from("usuarios")
      .update({
        email,
        auth_user_id: authData.user.id,
        activo: true,
        activado_en: new Date().toISOString()
      })
      .eq("id", usuarioId);

    if (updateError) {
      console.error("❌ UPDATE ERROR:", updateError);

      return res.status(400).json({
        error: {
          message: updateError.message
        }
      });
    }

    /**
     * CREATE PARENTESCO (ONLY FOR PADRE)
     */
    if (role === "padre") {
      console.log(" CREATING PARENTESCO...");

      const { data: alumnos, error: alumnosError } =
        await supabaseAdmin
          .from("alumnos")
          .select("id")
          .eq("codigo_registro", registrationCode);

      console.log("📚 ALUMNOS FOUND:", alumnos);

      if (alumnosError) {
        return res.status(400).json({
          error: { message: alumnosError.message }
        });
      }

      if (!alumnos || alumnos.length === 0) {
        console.log("⚠️ No alumnos found for registration code");
      } else {
        const parentescos = alumnos.map((a) => ({
          padre_id: usuarioId,
          alumno_id: a.id
        }));

        const { error: parentescoError } =
          await supabaseAdmin
            .from("parentescos")
            .upsert(parentescos);

        if (parentescoError && parentescoError.code !== '23505') {
          console.error("❌ PARENTESCO ERROR:", parentescoError);

          return res.status(400).json({
            error: {
              message: parentescoError.message
            }
          });
        }
      }
    }

    /**
* INVALIDATE REGISTRATION CODE
*/
    const { error: clearCodeError } =
      await supabaseAdmin
        .from("alumnos")
        .update({
          codigo_registro: null
        })
        .eq(
          "codigo_registro",
          registrationCode
        );

    console.log("ALUMNO UPDATE ERROR:", clearCodeError);

    await supabaseAdmin
      .from("usuarios")
      .update({
        codigo_registro: null
      })
      .eq(
        "codigo_registro",
        registrationCode
      );



    if (clearCodeError) {
      console.error(
        "❌ CLEAR CODE ERROR:",
        clearCodeError
      );

      return res.status(400).json({
        error: {
          message: clearCodeError.message
        }
      });
    }

    /**
     * SUCCESS RESPONSE
     */
    return res.json({
      success: true,
      role,
      mappedRole,
      usuarioId
    });

  } catch (err) {
    console.error("💥 ACTIVATION ERROR:", err);
    next(err);
  }
});

router.post(
  "/validate-admin",
  async (req, res, next) => {

    try {

      const {
        error,
        value
      } = validateAdminSchema.validate(req.body);

      if (error) {

        return res.status(400).json({
          error: {
            message: "Datos inválidos"
          }
        });

      }

      const {
        adminId,
        registrationCode
      } = value;

      const {
        data: admin,
        error: adminError
      } = await supabaseAdmin
        .from("usuarios")
        .select(`
          id,
          nombre_completo,
          email,
          rol_id,
          activo
        `)
        .eq("rol_id", 1)
        .eq("identificacion_admin", adminId)
        .eq("codigo_registro", registrationCode)
        .or("activo.is.null,activo.eq.false")
        .maybeSingle();

      if (adminError || !admin) {

        return res.status(400).json({
          error: {
            message:
              "Información incorrecta o cuenta ya activada"
          }
        });

      }

      return res.json({

        success: true,

        admin: {

          usuario_id: admin.id,

          nombre_completo:
            admin.nombre_completo,

          email:
            admin.email

        }

      });

    } catch (err) {

      console.error(
        "VALIDATE ADMIN ERROR:",
        err
      );

      next(err);

    }

  }
);
module.exports = router;
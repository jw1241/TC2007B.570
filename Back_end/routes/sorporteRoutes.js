const express = require("express");
const router = express.Router();
const Joi = require("joi");

const { supabaseAdmin } = require("../config/supabaseClient");

const validateStudentSchema = Joi.object({

  studentId: Joi.string()
    .trim()
    .max(30)
    .required(),

});

router.post(
  "/sorporte-alumno",
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
        studentId
      } = value;

      console.log(
        "INPUT RECEIVED:",
        value
      );

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
          nombre_completo
        `)
        .eq("matricula", studentId)
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


      return res.json({

        success: true,

        alumno: {

  matricula:
    alumno.matricula,

  nombre_completo:
    alumno.nombre_completo

},

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
    .required(),
});

router.post(
  "/sorporte-docente",
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
      });

      /**
       * VALIDATE DOCENTE
       * REQUIREMENTS:
       * - rol_id = 2
       * - registration code matches
       * - activo = false
       */
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
          activo
        `)
        .eq("rol_id", 2)
        .eq("identificacion_docente", docenteId)
        .eq("activo", false)
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
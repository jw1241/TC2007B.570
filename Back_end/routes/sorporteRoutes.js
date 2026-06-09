const express = require("express");
const router = express.Router();

<<<<<<< HEAD
const multer = require("multer");

const upload = multer({
  storage: multer.memoryStorage()
=======
const { supabaseAdmin } = require("../config/supabaseClient");

const validateStudentSchema = Joi.object({
  studentId: Joi.string().required(),
  birthDate: Joi.string().required()
>>>>>>> 5387514 (Update)
});

const { supabaseAdmin } =
  require("../config/supabaseClient");

router.post(
<<<<<<< HEAD
  "/soporte-ticket",
  upload.array("files", 10),
  async (req, res) => {
=======
  "/soporte-alumno",
  async (req, res, next) => {
>>>>>>> 5387514 (Update)

    try {

      const {
        role,
        studentId,
        birthDate,
        subject,
        description
      } = req.body;

      const Joi = require("joi");
      
      const schema = Joi.object({
        role: Joi.string().valid("padre", "docente").required(),
        studentId: Joi.string().required(),
        birthDate: Joi.string().isoDate().when('role', {
          is: 'padre',
          then: Joi.required(),
          otherwise: Joi.optional().allow(null, "")
        }),
        subject: Joi.string().max(255).required(),
        description: Joi.string().max(1000).required()
      });

      const { error: validationError } = schema.validate(req.body);
      if (validationError) {
        return res.status(400).json({ error: { message: validationError.details[0].message } });
      }

<<<<<<< HEAD
      let validatedUser;
=======
      const {
  studentId,
  birthDate
} = value;
>>>>>>> 5387514 (Update)

      if (role === "padre") {

        const { data: alumno } =
          await supabaseAdmin
            .from("alumnos")
            .select("*")
            .eq("matricula", studentId)
            .eq("fecha_nacimiento", birthDate)
            .maybeSingle();

        if (!alumno) {
          return res.status(400).json({
            error: {
              message: "Alumno no encontrado"
            }
          });
        }

        validatedUser = alumno;
      }

      if (role === "docente") {

        const { data: docente } =
          await supabaseAdmin
            .from("usuarios")
            .select("*")
            .eq("rol_id", 2)
            .eq("identificacion_docente", studentId)
            .maybeSingle();

        if (!docente) {
          return res.status(400).json({
            error: {
              message: "Docente no encontrado"
            }
          });
        }

        validatedUser = docente;
      }

      const ticketCode =
        `TKT-${Date.now()}`;

      const {
<<<<<<< HEAD
        data: ticket,
        error: ticketError
      } = await supabaseAdmin
        .from("soporte_tickets")
        .insert({
          ticket_codigo: ticketCode,
          matricula: studentId,
          estudiante_nombre:
            validatedUser.nombre_completo,
          fecha_nacimiento: birthDate || null,
          asunto: subject,
          descripcion: description,
          estado: "Pendiente",
          role: role === "docente" ? 2 : 3
        })
        .select()
        .single();
=======
  data: alumno,
  error: alumnoError
} = await supabaseAdmin
  .from("alumnos")
  .select(`
    id,
    matricula,
    nombre_completo,
    fecha_nacimiento,
    codigo_registro
  `)
  .eq("matricula", studentId)
  .eq("fecha_nacimiento", birthDate)
  .maybeSingle();
>>>>>>> 5387514 (Update)

      if (ticketError) {
        console.error(ticketError);

        return res.status(500).json({
          error: {
            message: "Error creando ticket"
          }
        });
      }

      // Upload files
      const uploadedFiles = [];
      if (req.files?.length) {

        for (const file of req.files) {

          const safeName =
  file.originalname
    .replace(/[^a-zA-Z0-9._-]/g, "_");

const fileName =
  `${ticket.id}/${Date.now()}-${safeName}`;


          const {
            error: uploadError
          } = await supabaseAdmin
            .storage
            .from("soporte-archivos")
            .upload(
              fileName,
              file.buffer,
              {
                contentType: file.mimetype
              }
            );

          if (uploadError) {
            console.error(uploadError);
            continue;
          }

          const {
            data: publicUrlData
          } = supabaseAdmin
            .storage
            .from("soporte-archivos")
            .getPublicUrl(fileName);

          uploadedFiles.push({
            nombre: safeName,
            archivo_url: publicUrlData.publicUrl
          });

          await supabaseAdmin
            .from("soporte_archivos")
            .insert({
              ticket_id: ticket.id,
              archivo_url:
                publicUrlData.publicUrl
            });
        }
      }

      return res.json({
<<<<<<< HEAD
        success: true,
        ticketCode,
        uploadedFiles
      });
=======
  success: true,
  alumno: {
    id: alumno.id,
    matricula: alumno.matricula,
    nombre_completo: alumno.nombre_completo,
    fecha_nacimiento: alumno.fecha_nacimiento
  }
});
>>>>>>> 5387514 (Update)

    } catch (err) {

      console.error(err);

      return res.status(500).json({
        error: {
          message: "Error interno"
        }
      });
    }
  }
);

<<<<<<< HEAD
=======
const validateDocenteSchema = Joi.object({

  docenteId: Joi.string()
    .trim()
    .required(),
});

router.post(
  "/soporte-docente",
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

>>>>>>> 5387514 (Update)
module.exports = router;
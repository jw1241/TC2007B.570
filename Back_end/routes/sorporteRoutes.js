const express = require("express");
const router = express.Router();

const multer = require("multer");

const upload = multer({
  storage: multer.memoryStorage()
});

const { supabaseAdmin } =
  require("../config/supabaseClient");

router.post(
  "/soporte-ticket",
  upload.array("files", 10),
  async (req, res) => {

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
        birthDate: Joi.string().isoDate().required(),
        subject: Joi.string().max(255).required(),
        description: Joi.string().max(1000).required()
      });

      const { error: validationError } = schema.validate(req.body);
      if (validationError) {
        return res.status(400).json({ error: { message: validationError.details[0].message } });
      }

      let validatedUser;

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
        data: ticket,
        error: ticketError
      } = await supabaseAdmin
        .from("soporte_tickets")
        .insert({
          ticket_codigo: ticketCode,
          matricula: studentId,
          estudiante_nombre:
            validatedUser.nombre_completo,
          fecha_nacimiento: birthDate,
          asunto: subject,
          descripcion: description,
          estado: "Pendiente",
          role: role === "docente" ? 2 : 3
        })
        .select()
        .single();

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
        success: true,
        ticketCode,
        uploadedFiles
      });

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

module.exports = router;
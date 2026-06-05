const Joi = require("joi");

const alumnoPadreSchema = Joi.object({
  nombre_padre: Joi.string().min(3).required(),
  nombre_estudiante: Joi.string().min(3).required(),

  matricula: Joi.string()
    .alphanum()
    .min(3)
    .max(30)
    .required(),

  grado: Joi.number()
    .integer()
    .min(1)
    .max(6)
    .required(),

  seccion: Joi.string()
    .min(1)
    .max(2)
    .required()
});

const materiaSchema = Joi.object({
  nombre_materia: Joi.string().min(2).required(),

  es_general: Joi.alternatives()
    .try(
      Joi.boolean(),
      Joi.string().valid("true", "false", "0", "1")
    )
    .required()
});

const profesorSchema = Joi.object({
  nombre_completo: Joi.string().min(3).required(),

  docente_id: Joi.string().required(),

  nombre_materia: Joi.string().required(),

  grado: Joi.number().integer().min(1).max(6).required(),

  seccion: Joi.string().min(1).max(2).required()
});

const grupoSchema = Joi.object({
  grado: Joi.number().integer().min(1).max(6).required(),
  seccion: Joi.string().required()
});
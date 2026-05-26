const express = require("express");
const router = express.Router();
const Joi = require("joi");
const supabase = require("../config/supabaseClient"); // Usamos el cliente estándar

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Iniciar sesión con email y contraseña
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Inicio de sesión exitoso (Retorna Token)
 */
router.post("/login", async (req, res, next) => {
  try {
    const schema = Joi.object({
      email: Joi.string().email().required(),
      password: Joi.string().required()
    });

    const { error: validationError, value } = schema.validate(req.body);
    if (validationError) {
      return res.status(400).json({ 
        error: { message: "Datos inválidos", details: validationError.details.map(d => d.message) } 
      });
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: value.email,
      password: value.password
    });

    if (error) {
      return res.status(401).json({ error: { message: "Credenciales incorrectas o usuario no encontrado", details: error.message } });
    }

    // Retornamos el token y datos del usuario al frontend
    res.json({
      message: "Login exitoso",
      token: data.session.access_token, // El JWT que el Frontend usará
      user: {
        id: data.user.id,
        email: data.user.email,
        metadata: data.user.user_metadata
      }
    });

  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /api/auth/reset-password:
 *   post:
 *     summary: Enviar correo de recuperación de contraseña
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 */
router.post("/reset-password", async (req, res, next) => {
  try {
    const schema = Joi.object({
      email: Joi.string().email().required()
    });

    const { error: validationError, value } = schema.validate(req.body);
    if (validationError) {
      return res.status(400).json({ error: { message: "Email inválido" } });
    }

    // Esto instruye a Supabase a mandar un correo con un link hacia http://localhost:8100/reset-password
    const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:8100";
    
    const { error } = await supabase.auth.resetPasswordForEmail(value.email, {
      redirectTo: `${FRONTEND_URL}/reset-password`, 
    });

    if (error) {
      return res.status(400).json({ error: { message: "Error al enviar el correo", details: error.message } });
    }

    res.json({ message: "Si el correo está registrado, se han enviado las instrucciones de recuperación." });

  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /api/auth/update-password:
 *   post:
 *     summary: Actualizar contraseña usando el access_token del correo
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - newPassword
 *             properties:
 *               newPassword:
 *                 type: string
 */
router.post("/update-password", async (req, res, next) => {
  try {
    // El middleware authMiddleware debería ejecutarse antes si decidimos proteger esta ruta
    // Para simplificar, asumiremos que el frontend nos manda el JWT en la cabecera
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: { message: "No se proporcionó el token de recuperación." } });
    }

    const token = authHeader.split(" ")[1];

    const schema = Joi.object({
      newPassword: Joi.string().min(6).required()
    });

    const { error: validationError, value } = schema.validate(req.body);
    if (validationError) {
      return res.status(400).json({ error: { message: "La contraseña debe tener al menos 6 caracteres." } });
    }

    // Actualizamos el password del usuario ligado a este token
    const { data, error } = await supabase.auth.updateUser({
      password: value.newPassword
    });

    if (error) {
      return res.status(400).json({ error: { message: "No se pudo actualizar la contraseña. El enlace pudo haber expirado.", details: error.message } });
    }

    res.json({ message: "Contraseña actualizada exitosamente." });

  } catch (err) {
    next(err);
  }
});

module.exports = router;

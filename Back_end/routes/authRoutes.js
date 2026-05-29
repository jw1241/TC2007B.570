const express = require("express");
const router = express.Router();
const Joi = require("joi");
const createAuthClient = require("../config/supabaseClient");

const { supabase, supabaseAdmin } = require("../config/supabaseClient");
const { authMiddleware } = require("../middleware/authMiddleware");

const rateLimit = require("express-rate-limit");
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20
});

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
router.post("/login",authLimiter, async (req, res, next) => {
  try {

    const schema = Joi.object({
      email: Joi.string().email().required(),
      password: Joi.string().required()
    });


const validation = schema.validate(req.body);

if (validation.error) {
  return res.status(400).json({
    error: {
      message: "Datos inválidos",
      details: validation.error.details.map(d => d.message)
    }
  });
}

const { email, password } = validation.value;

if (process.env.NODE_ENV !== "production") {
  console.log("LOGIN ATTEMPT:", { email });
}

const { data: authData, error: authError } =
  await supabase.auth.signInWithPassword({
    email,
    password
  });

if (authError) {
  return res.status(401).json({
  error: {
    message: "Credenciales incorrectas"
  }
  });
}

if (!authData?.session?.access_token) {
  return res.status(500).json({
    error: { message: "Auth session missing" }
  });
}

const { data: usuario, error: usuarioError } = await supabaseAdmin
  .from("usuarios")
  .select("*")
  .eq("id", authData.user.id)
  .single();

if (usuarioError || !usuario) {
  return res.status(403).json({
  error: {
    message: "Perfil de usuario no encontrado. Contacta al administrador."
  }
});
}

res.json({
  message: "Login exitoso",
  token: {
    access_token: authData.session.access_token,
    expires_at: authData.session.expires_at
  },
  usuario: {
    id: usuario.id,
    email: usuario.email,
    nombre_completo: usuario.nombre_completo,
    rol_id: usuario.rol_id
  }
});

  } catch (err) {
    console.error("AUTH ERROR:", err);
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
router.post("/reset-password", authLimiter, async (req, res, next) => {
  try {
    const schema = Joi.object({
      email: Joi.string().email().required()
    });

    const validation = schema.validate(req.body);

if (validation.error) {
  return res.status(400).json({
    error: { message: "Email inválido" }
  });
}

const { email } = validation.value;

const normalizedEmail = email.trim().toLowerCase();

    // Esto instruye a Supabase a mandar un correo con un link hacia http://localhost:8100/reset-password
    const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:8100";
    
    const { error } = await supabase.auth.resetPasswordForEmail(normalizedEmail, {
  redirectTo: `${FRONTEND_URL}/reset-password`,
});

    if (error) {
  return res.status(400).json({
    error: { message: "No se pudo procesar la solicitud de recuperación." }
  });
}

    res.json({ message: "Si el correo está registrado, se han enviado las instrucciones de recuperación." });

  } catch (err) {
    console.error("AUTH ERROR:", err);
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
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({
  error: {
    message: "No se proporcionó el token"
  }
});
    }

    const token = authHeader.split(" ")[1];

    const authClient = createAuthClient(token);

    const schema = Joi.object({
      newPassword: Joi.string().min(8).max(72).required()
    });

    const validation = schema.validate(req.body);

    if (validation.error) {
      return res.status(400).json({
        error: { message: "Password too weak (min 8 chars)" }
      });
    }

    const { newPassword } = validation.value;

    const { error: updateError } = await authClient.auth.updateUser({
      password: newPassword
    });

    if (updateError) {
      return res.status(400).json({
  error: {
    message: "La contraseña no cumple con los requisitos de seguridad",
    rules: [
      "12 a 16 caracteres",
      "Al menos una letra mayúscula",
      "Al menos una letra minúscula",
      "Al menos un número",
      "Al menos un carácter especial"
    ]
  }
      });
    }

    res.json({ message: "Password updated successfully" });
  } catch (err) {
    next(err);
  }
});


router.get("/me", authMiddleware, async (req, res) => {
  res.json({ user: req.user });
});

module.exports = router;

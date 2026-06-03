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
  .eq("auth_user_id", authData.user.id)
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
/**
 * @swagger
 * /api/auth/registro-padres:
 *   post:
 *     summary: Registra a un Padre de Familia validando la matrícula del alumno
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
 *               - nombre_completo
 *               - matricula
 *               - fecha_nacimiento
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               nombre_completo:
 *                 type: string
 *               matricula:
 *                 type: string
 *               fecha_nacimiento:
 *                 type: string
 *                 format: date
 */
router.post("/registro-padres", authLimiter, async (req, res, next) => {
  try {
    const schema = Joi.object({
      email: Joi.string().email().required(),
      password: Joi.string().min(8).required(),
      nombre_completo: Joi.string().required(),
      matricula: Joi.string().required(),
      fecha_nacimiento: Joi.string().isoDate().required()
    });

    const validation = schema.validate(req.body);
    if (validation.error) {
      return res.status(400).json({ error: { message: "Datos inválidos", details: validation.error.details.map(d => d.message) } });
    }

    const { email, password, nombre_completo, matricula, fecha_nacimiento } = validation.value;

    // 1. Validar que el alumno existe con esa matrícula y fecha de nacimiento
    const { data: alumno, error: alumnoError } = await supabaseAdmin
      .from("alumnos")
      .select("id")
      .eq("matricula", matricula)
      .eq("fecha_nacimiento", fecha_nacimiento)
      .single();

    if (alumnoError || !alumno) {
      return res.status(400).json({ error: { message: "La matrícula o la fecha de nacimiento no coinciden con ningún alumno registrado." } });
    }

    // 2. Crear usuario en Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true // Asumimos que el correo está confirmado para simplificar flujo
    });

    if (authError) {
      return res.status(400).json({ error: { message: "No se pudo crear la cuenta de autenticación.", details: authError.message } });
    }

    const authUserId = authData.user.id;

    // 3. Crear el perfil público en la tabla 'usuarios' con rol_id = 3 (Padre)
    const { error: usuarioError } = await supabaseAdmin
      .from("usuarios")
      .insert([
        {
          auth_user_id: authUserId,
          email: email,
          nombre_completo: nombre_completo,
          rol_id: 3,
          activo: true
        }
      ]);

    if (usuarioError) {
      // Si falla, podríamos hacer un "rollback" eliminando el usuario de Auth, pero lo dejaremos así por ahora y lo loggeamos
      console.error("Error creando perfil de usuario:", usuarioError);
      return res.status(500).json({ error: { message: "El usuario se creó en Auth, pero falló la creación del perfil." } });
    }

    // 4. Vincular al Padre con el Alumno en la tabla 'parentescos'
    // Recuperamos el ID del usuario recién creado para insertarlo (si la PK es autoincremental, auth_user_id servirá como FK)
    const { error: parentescoError } = await supabaseAdmin
      .from("parentescos")
      .insert([
        {
          padre_id: authUserId, // OJO: Verifica si padre_id es el UUID de auth.users o el ID serial de usuarios. Normalmente es el UUID si se usan las convenciones estándar de Supabase
          alumno_id: alumno.id,
          relacion: "Padre/Tutor"
        }
      ]);

    if (parentescoError) {
      console.error("Error creando parentesco:", parentescoError);
      // No detenemos el flujo porque ya se registró, pero no se vinculó el alumno
    }

    res.status(201).json({ message: "Padre registrado y vinculado exitosamente." });

  } catch (err) {
    console.error("REGISTRO PADRES ERROR:", err);
    next(err);
  }
});

router.get("/me", authMiddleware, async (req, res) => {
  res.json({ user: req.user });
});

module.exports = router;

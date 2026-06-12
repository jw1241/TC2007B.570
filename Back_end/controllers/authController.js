const Joi = require("joi");
const { supabase, supabaseAdmin, createAuthClient } = require("../config/supabaseClient");

const login = async (req, res, next) => {
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

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
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
};

const resetPassword = async (req, res, next) => {
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
};

const updatePassword = async (req, res, next) => {
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
      newPassword: Joi.string().pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{12,}$/).required().messages({
        'string.pattern.base': 'La contraseña debe tener al menos 12 caracteres, una mayúscula, una minúscula, un número y un símbolo.'
      })
    });

    const validation = schema.validate(req.body);

    if (validation.error) {
      return res.status(400).json({
        error: { message: validation.error.details[0].message }
      });
    }

    const { newPassword } = validation.value;

    const { error: updateError } = await authClient.auth.updateUser({
      password: newPassword
    });

    if (updateError) {
      return res.status(400).json({
        error: {
          message: "No se pudo actualizar la contraseña",
          details: updateError.message
        }
      });
    }

    const { data: userData } = await authClient.auth.getUser();

    await supabaseAdmin
      .from('usuarios')
      .update({
        activo: true,
        requiere_cambio_password: false,
        activado_en: new Date().toISOString()
      })
      .eq('auth_user_id', userData.user.id);

    res.json({ message: "Password updated successfully" });
  } catch (err) {
    next(err);
  }
};

const registroPadres = async (req, res, next) => {
  try {
    const schema = Joi.object({
      email: Joi.string().email().required(),
      password: Joi.string().pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{12,}$/).required().messages({
        'string.pattern.base': 'La contraseña debe tener al menos 12 caracteres, una mayúscula, una minúscula, un número y un símbolo.'
      }),
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
      email_confirm: true
    });

    if (authError) {
      return res.status(400).json({ error: { message: "No se pudo crear la cuenta de autenticación.", details: authError.message } });
    }

    const authUserId = authData.user.id;

    // 3. Crear el perfil público
    const { data: usuarioData, error: usuarioError } = await supabaseAdmin
      .from("usuarios")
      .insert([{
          auth_user_id: authUserId,
          email: email,
          nombre_completo: nombre_completo,
          rol_id: 3,
          activo: true
      }])
      .select("id")
      .single();

    if (usuarioError || !usuarioData) {
      console.error("Error creando perfil de usuario:", usuarioError);
      return res.status(500).json({ error: { message: "El usuario se creó en Auth, pero falló la creación del perfil." } });
    }

    // 4. Vincular al Padre con el Alumno
    const { error: parentescoError } = await supabaseAdmin
      .from("parentescos")
      .insert([{
          padre_id: usuarioData.id,
          alumno_id: alumno.id,
          relacion: "Padre/Tutor"
      }]);

    if (parentescoError) {
      console.error("Error creando parentesco:", parentescoError);
    }

    res.status(201).json({ message: "Padre registrado y vinculado exitosamente." });

  } catch (err) {
    console.error("REGISTRO PADRES ERROR:", err);
    next(err);
  }
};

const me = async (req, res) => {
  res.json({ user: req.user });
};

module.exports = {
  login,
  resetPassword,
  updatePassword,
  registroPadres,
  me
};

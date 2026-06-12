const { createClient } = require("@supabase/supabase-js");

const {
  supabase,
  supabaseAdmin
} = require("../config/supabaseClient");

/**
 * AUTH MIDDLEWARE
 */
const authMiddleware = async (
  req,
  res,
  next
) => {

  try {

    const authHeader =
      req.headers.authorization;

    if (
      !authHeader ||
      !authHeader.startsWith("Bearer ")
    ) {

      return res.status(401).json({
        error: {
          message:
            "No token provided"
        }
      });

    }

    const token =
      authHeader.split(" ")[1];

    /**
     * VALIDATE JWT
     */
    const {
      data: { user },
      error: authError
    } =
      await supabase.auth.getUser(token);

    if (authError || !user) {

      return res.status(401).json({
        error: {
          message:
            "Invalid or expired token"
        }
      });

    }

    /**
     * GET USER PROFILE
     */
    const {
  data: profile,
  error: profileError
} =
  await supabaseAdmin
    .from("usuarios")
    .select(`
      id,
      email,
      nombre_completo,
      rol_id,
      activo,
      auth_user_id
    `)
    .eq("auth_user_id", user.id)
    .single();

    if (profileError || !profile) {

      return res.status(401).json({
        error: {
          message:
            "Perfil de usuario no encontrado"
        }
      });

    }

    if (!profile.activo) {

      return res.status(403).json({
        error: {
          message:
            "Usuario desactivado"
        }
      });

    }

    /**
     * SAFE USER OBJECT
     */

    req.user = {
  id: profile.id,
  auth_user_id: user.id,
  email: user.email,
  rol_id: profile.rol_id,
  activo: profile.activo,
  nombre_completo: profile.nombre_completo
};

    /**
     * AUTHENTICATED SUPABASE CLIENT
     */
    req.supabase =
      createClient(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_ANON_KEY,
        {
          global: {
            headers: {
              Authorization:
                `Bearer ${token}`
            }
          }
        }
      );

    next();

  } catch (err) {

    console.error(
      "AUTH MIDDLEWARE ERROR:",
      err
    );

    next(err);

  }

};

/**
 * ROLE MIDDLEWARE
 */

module.exports = {
  authMiddleware
};
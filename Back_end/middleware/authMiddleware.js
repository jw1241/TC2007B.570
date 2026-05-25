const supabase = require("../config/supabaseClient");

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: { message: "No token provided. Authorization header is missing or malformed." } });
    }

    const token = authHeader.split(" ")[1];
    
    // Validar el token JWT con Supabase para asegurarnos de que la sesión es válida
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ error: { message: "Invalid or expired token", details: error?.message } });
    }

    // Guardar el usuario en la request
    req.user = user;
    
    // Instanciar un cliente de Supabase autenticado como el usuario de la petición.
    const { createClient } = require("@supabase/supabase-js");
    const authenticatedSupabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_ANON_KEY,
      {
        global: {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      }
    );
    req.supabase = authenticatedSupabase;

    next();
  } catch (err) {
    next(err); // Pasa errores inesperados al manejador global
  }
};

const requireAdmin = async (req, res, next) => {
  try {
    // Buscar el rol del usuario autenticado
    // Se asume la existencia de la tabla 'usuarios' con la columna 'rol_id'
    const { data: userProfile, error } = await req.supabase
      .from('usuarios')
      .select('rol_id')
      .eq('id', req.user.id)
      .single();

    // Asumiremos que rol_id = 1 corresponde a "Administrador".
    // TODO: Ajustar este ID si en la base de datos el Admin tiene otro ID.
    if (error || !userProfile || userProfile.rol_id !== 1) {
      return res.status(403).json({ error: { message: "Forbidden: Requiere privilegios de Administrador" } });
    }

    next();
  } catch (err) {
    next(err); // Pasa errores inesperados al manejador global
  }
};

module.exports = { authMiddleware, requireAdmin };

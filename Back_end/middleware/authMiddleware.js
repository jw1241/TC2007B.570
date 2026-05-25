const supabase = require("../config/supabaseClient");

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: "No token provided. Authorization header is missing." });
  }

  const token = authHeader.split(" ")[1];
  
  // Validar el token JWT con Supabase para asegurarnos de que la sesión es válida
  const { data: { user }, error } = await supabase.auth.getUser(token);

  if (error || !user) {
    return res.status(401).json({ message: "Invalid token", error: error?.message });
  }

  // Guardar el usuario en la request
  req.user = user;
  
  // Instanciar un cliente de Supabase autenticado como el usuario de la petición.
  // IMPORTANTE: Esto asegura que las reglas de RLS de la base de datos se apliquen
  // automáticamente a todas las queries que usemos en los endpoints con `req.supabase`
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
      return res.status(403).json({ message: "Forbidden: Requiere privilegios de Administrador" });
    }

    next();
  } catch (err) {
    res.status(500).json({ message: "Error verificando rol de administrador", error: err.message });
  }
};

module.exports = { authMiddleware, requireAdmin };

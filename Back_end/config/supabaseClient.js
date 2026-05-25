require("dotenv").config({ path: ".env.production" });
const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  console.warn("⚠️ Advertencia: Falta configurar SUPABASE_URL en el archivo .env");
}

// Inicializa el cliente global estándar
const supabase = createClient(supabaseUrl || "https://placeholder.supabase.co", supabaseAnonKey || "placeholder");

// Inicializa el cliente Administrador con Service Role (Bypass RLS y permite Auth Admin)
let supabaseAdmin = null;
if (supabaseServiceKey) {
  supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}

module.exports = supabase;
module.exports.supabaseAdmin = supabaseAdmin;

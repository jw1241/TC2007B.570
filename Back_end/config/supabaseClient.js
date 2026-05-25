require("dotenv").config();
const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn("⚠️ Advertencia: Falta configurar SUPABASE_URL y/o la Key en el archivo .env");
}

// Inicializa el cliente global (puede usar el Service Role Key si se especificó para tareas de backend puro)
const supabase = createClient(supabaseUrl || "https://placeholder.supabase.co", supabaseKey || "placeholder");

module.exports = supabase;

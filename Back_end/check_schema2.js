require("dotenv").config({ path: ".env.production" });
const { supabaseAdmin } = require("./config/supabaseClient");

async function check() {
  const { data, error } = await supabaseAdmin.from("materias").select("*").limit(1);
  if (error) console.error(error);
  else console.log("materias columns:", data.length > 0 ? Object.keys(data[0]) : "table empty");
}
check();

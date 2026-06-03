require("dotenv").config({ path: ".env.production" });
const { supabaseAdmin } = require("./config/supabaseClient");

async function check() {
  const { data, error } = await supabaseAdmin.from("periodos_evaluacion").select("*");
  if (error) console.error(error);
  else console.log("periodos_evaluacion:", data);
}
check();

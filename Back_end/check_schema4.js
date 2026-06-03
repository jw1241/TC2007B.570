require("dotenv").config({ path: ".env.production" });
const { supabaseAdmin } = require("./config/supabaseClient");

async function check() {
  const { data, error } = await supabaseAdmin.from("periodos").select("*");
  if (error) console.error(error);
  else console.log("periodos:", data);
}
check();

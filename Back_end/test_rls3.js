require('dotenv').config({ path: '.env.production' });
const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const serviceClient = createClient(supabaseUrl, serviceKey);

const tables = ['alumnos', 'calificaciones', 'usuarios', 'parentescos', 'asignaciones_docentes'];
async function run() {
  for (const table of tables) {
    const { data } = await serviceClient.from(table).select('*').limit(1);
    console.log(`\n--- Schema sample for ${table} ---`);
    if (data && data.length > 0) {
      console.log(data[0]);
    } else {
      console.log('No data found.');
    }
  }
}
run();

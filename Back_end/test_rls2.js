require('dotenv').config({ path: '.env.production' });
const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = process.env.SUPABASE_URL;
const anonKey = process.env.SUPABASE_ANON_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const anonClient = createClient(supabaseUrl, anonKey);
const serviceClient = createClient(supabaseUrl, serviceKey);

const tables = ['alumnos', 'calificaciones', 'usuarios', 'parentescos', 'asignaciones_docentes'];
async function run() {
  for (const table of tables) {
    console.log(`\n--- Testing ${table} ---`);
    const { data: serviceData, error: serviceError } = await serviceClient.from(table).select('*').limit(1);
    if (serviceError) {
      console.log(`Service Role SELECT error:`, serviceError.message);
      continue;
    }
    console.log(`Service Role found: ${serviceData.length} rows.`);
    
    const { data: anonData, error: anonError } = await anonClient.from(table).select('*').limit(1);
    console.log(`Anon Key found: ${anonData.length} rows. (error: ${anonError ? anonError.message : 'none'})`);

    // Try a dummy insert with Anon
    const dummyData = {}; // empty insert
    const { error: insertError } = await anonClient.from(table).insert([dummyData]);
    console.log(`Anon INSERT error:`, insertError ? insertError.code + ' ' + insertError.message : 'SUCCESS! (VULNERABLE)');
  }
}
run();

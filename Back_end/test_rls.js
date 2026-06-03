require('dotenv').config({ path: '.env.production' });
const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = process.env.SUPABASE_URL;
const anonKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, anonKey);
const tables = ['alumnos', 'calificaciones', 'usuarios', 'parentescos', 'asignaciones_docentes'];
async function run() {
  for (const table of tables) {
    console.log(`\n--- Testing ${table} ---`);
    const { data, error } = await supabase.from(table).select('*').limit(1);
    console.log(`SELECT:`, error ? error.message : `Accessible, found ${data.length} rows.`);

    const { error: insertError } = await supabase.from(table).insert([{ id: 999999 }]);
    console.log(`INSERT:`, insertError ? insertError.message : 'Success (VULNERABLE!)');

    const { error: updateError } = await supabase.from(table).update({ id: 999999 }).eq('id', 999999);
    console.log(`UPDATE:`, updateError ? updateError.message : 'Success (VULNERABLE!)');

    const { error: deleteError } = await supabase.from(table).delete().eq('id', 999999);
    console.log(`DELETE:`, deleteError ? deleteError.message : 'Success (VULNERABLE!)');
  }
}
run();

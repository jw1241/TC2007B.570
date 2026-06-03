require('dotenv').config({ path: '.env.production' });
const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = process.env.SUPABASE_URL;
const anonKey = process.env.SUPABASE_ANON_KEY;
const anonClient = createClient(supabaseUrl, anonKey);

async function run() {
  console.log('\n--- Deleting from parentescos ---');
  let { data, error, count } = await anonClient.from('parentescos')
    .delete({ count: 'exact' })
    .eq('padre_id', '656529ed-3ce3-4ff5-9d46-9925355a5bc8')
    .eq('alumno_id', '4a835c6a-286a-45ca-8524-bce25642a589');
  console.log('Error:', error ? error.message : 'none');
  console.log('Count deleted by anon:', count);

  console.log('\n--- Deleting from asignaciones_docentes ---');
  let { data: d2, error: e2, count: c2 } = await anonClient.from('asignaciones_docentes')
    .delete({ count: 'exact' })
    .eq('id', 'dbe660b0-943a-40a0-984d-bcaedeb46c10');
  console.log('Error:', e2 ? e2.message : 'none');
  console.log('Count deleted by anon:', c2);
}
run();

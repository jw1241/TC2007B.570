require('dotenv').config({ path: '.env.production' });
const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = process.env.SUPABASE_URL;
const anonKey = process.env.SUPABASE_ANON_KEY;
const anonClient = createClient(supabaseUrl, anonKey);

async function run() {
  const padreRow = {
    padre_id: '656529ed-3ce3-4ff5-9d46-9925355a5bc8',
    alumno_id: '4a835c6a-286a-45ca-8524-bce25642a589'
  };
  const asignacionRow = {
    id: 'dbe660b0-943a-40a0-984d-bcaedeb46c10',
    docente_id: 'd3b036b5-e25f-496d-8091-145be1ffcd6a',
    materia_id: '0474c55f-8ff5-464e-a55e-cf5388e6264c',
    grupo_id: '834a23d0-0beb-4d36-8807-f1baeb6b4ce2'
  };

  console.log('\n--- Inserting into parentescos ---');
  let { error: err1 } = await anonClient.from('parentescos').insert([padreRow]);
  console.log(err1 ? err1.code + ' ' + err1.message : 'SUCCESS!');

  console.log('\n--- Inserting into asignaciones_docentes ---');
  let { error: err2 } = await anonClient.from('asignaciones_docentes').insert([asignacionRow]);
  console.log(err2 ? err2.code + ' ' + err2.message : 'SUCCESS!');
}
run();

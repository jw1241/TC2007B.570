require('dotenv').config({ path: '.env.production' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function clean() {
  const emails = ['maestro123@test.com', 'alumno123@test.com'];
  
  // get ids
  const { data: users } = await supabase.from('usuarios').select('id, email').in('email', emails);
  
  for (const u of users || []) {
    // try to delete references
    await supabase.from('conversaciones').delete().eq('padre_id', u.id);
    await supabase.from('conversaciones').delete().eq('docente_id', u.id);
    await supabase.from('parentescos').delete().eq('padre_id', u.id);
    await supabase.from('asignaciones_docentes').delete().eq('docente_id', u.id);
    
    // now delete user
    await supabase.from('usuarios').delete().eq('id', u.id);
  }
}
clean();

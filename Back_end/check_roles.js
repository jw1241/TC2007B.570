require('dotenv').config({ path: '.env' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  const { data: roles } = await supabase.from('roles').select('*');
  console.log('Roles:', roles);
  
  const { data: admins } = await supabase.from('usuarios').select('*').eq('rol_id', 1).limit(1);
  console.log('Admins:', admins);
}

run();

require('dotenv').config({ path: '.env' });
const { createClient } = require('@supabase/supabase-js');

const supabaseAdmin = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const users = [
  { email: 'admin123@test.com', password: 'Password123!', nombre: 'Admin Prueba', rol: 1 },
  { email: 'maestro123@test.com', password: 'Password123!', nombre: 'Maestro Prueba', rol: 2 },
  { email: 'alumno123@test.com', password: 'Password123!', nombre: 'Padre Prueba', rol: 3 }
];

async function seedUsers() {
  for (const u of users) {
    console.log(`Verificando usuario: ${u.email}...`);
    
    // 1. Crear o actualizar en Supabase Auth
    let authUser;
    
    // Buscar en Auth (solo si tuvieramos la API, pero createUser falla si existe)
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: u.email,
      password: u.password,
      email_confirm: true
    });

    if (authError) {
      if (authError.message.includes('already registered')) {
        console.log(` - Ya existe en Auth. Obteniendo ID...`);
        // Actualizar el password por si acaso
        const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
        authUser = existingUsers.users.find(user => user.email === u.email);
        if (authUser) {
          await supabaseAdmin.auth.admin.updateUserById(authUser.id, { password: u.password });
        }
      } else {
        console.error(` - Error creando en Auth: ${authError.message}`);
        continue;
      }
    } else {
      authUser = authData.user;
      console.log(` - Creado en Auth: ${authUser.id}`);
    }

    if (!authUser) {
      console.log(` - No se pudo resolver el authUser para ${u.email}`);
      continue;
    }

    // 2. Crear o actualizar en public.usuarios
    const { data: existingProfile, error: profileError } = await supabaseAdmin
      .from('usuarios')
      .select('id')
      .eq('email', u.email)
      .single();

    if (existingProfile) {
      // Actualizar
      await supabaseAdmin
        .from('usuarios')
        .update({ auth_user_id: authUser.id, rol_id: u.rol })
        .eq('id', existingProfile.id);
      console.log(` - Perfil actualizado y enlazado.`);
    } else {
      // Insertar
      await supabaseAdmin
        .from('usuarios')
        .insert([{
          email: u.email,
          nombre_completo: u.nombre,
          rol_id: u.rol,
          activo: true,
          auth_user_id: authUser.id
        }]);
      console.log(` - Perfil creado y enlazado.`);
    }
  }
  console.log('Completado.');
}

seedUsers();

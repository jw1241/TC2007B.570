require('dotenv').config({ path: '.env' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  try {
    console.log('--- Creando Usuarios de Prueba ---');

    const adminEmail = 'admin123@test.com';
    const maestroEmail = 'maestro123@test.com';
    const padreEmail = 'alumno123@test.com';
    const password = 'Password123!';

    // Cleanup existing users if any
    const emails = [adminEmail, maestroEmail, padreEmail];
    for (const email of emails) {
      const { data: users } = await supabase.from('usuarios').select('auth_user_id').eq('email', email);
      if (users && users.length > 0) {
        for (const u of users) {
          await supabase.from('usuarios').delete().eq('auth_user_id', u.auth_user_id);
          await supabase.auth.admin.deleteUser(u.auth_user_id);
        }
      }
    }

    // 1. Create Admin
    console.log('\nCreando Admin...');
    const { data: adminAuth, error: adminAuthErr } = await supabase.auth.admin.createUser({
      email: adminEmail,
      password: password,
      email_confirm: true,
      user_metadata: { rol_id: 1, nombre_completo: 'Admin Prueba' }
    });
    if (adminAuthErr) throw new Error('Error admin auth: ' + adminAuthErr.message);

    const { data: adminUser, error: adminUsrErr } = await supabase.from('usuarios').insert({
      email: adminEmail,
      nombre_completo: 'Admin Prueba',
      rol_id: 1,
      auth_user_id: adminAuth.user.id,
      activo: true,
      activado_en: new Date().toISOString()
    }).select().single();
    if (adminUsrErr) throw new Error('Error admin usuarios: ' + adminUsrErr.message);
    console.log('✅ Admin creado:', adminEmail);

    // 2. Create Maestro (Docente)
    console.log('\nCreando Maestro...');
    const { data: docAuth, error: docAuthErr } = await supabase.auth.admin.createUser({
      email: maestroEmail,
      password: password,
      email_confirm: true,
      user_metadata: { rol_id: 2, nombre_completo: 'Maestro Prueba' }
    });
    if (docAuthErr) throw new Error('Error maestro auth: ' + docAuthErr.message);

    const { data: maestroUser, error: docUsrErr } = await supabase.from('usuarios').insert({
      email: maestroEmail,
      nombre_completo: 'Maestro Prueba',
      rol_id: 2,
      auth_user_id: docAuth.user.id,
      activo: true,
      activado_en: new Date().toISOString()
    }).select().single();
    if (docUsrErr) throw new Error('Error maestro usuarios: ' + docUsrErr.message);
    console.log('✅ Maestro creado:', maestroEmail);

    // Asignar grupo a Maestro
    let { data: materias } = await supabase.from('materias').select('id').limit(1);
    let { data: grupos } = await supabase.from('grupos').select('id').limit(1);

    if (!materias || materias.length === 0) {
      console.log('Creando materia semilla...');
      const { data: newMateria } = await supabase.from('materias').insert({
        nombre_materia: 'Materia de Prueba',
        es_general: true
      }).select().single();
      materias = [newMateria];
    }

    if (!grupos || grupos.length === 0) {
      console.log('Creando grupo semilla...');
      const { data: newGrupo } = await supabase.from('grupos').insert({
        grado: 1,
        seccion: 'A'
      }).select().single();
      grupos = [newGrupo];
    }

    if (materias?.length && grupos?.length) {
      const { error: asignError } = await supabase.from('asignaciones_docentes').insert({
        docente_id: maestroUser.id,
        materia_id: materias[0].id,
        grupo_id: grupos[0].id
      });
      if (asignError) {
        console.error("❌ Error al asignar clase al maestro:", asignError.message);
      } else {
        console.log('✅ Clase asignada al maestro.');
      }
    }

    // 3. Create Alumno & Padre
    console.log('\nCreando Alumno/Padre...');
    const matricula = `MAT-TEST-${Date.now()}`;
    const { data: alumno, error: alumErr } = await supabase.from('alumnos').insert({
      matricula: matricula,
      nombre_completo: 'Estudiante Prueba',
      grupo_id: grupos?.[0]?.id || null,
      fecha_nacimiento: '2010-01-01'
    }).select().single();
    if (alumErr) throw new Error('Error alumno: ' + alumErr.message);

    const { data: padAuth, error: padAuthErr } = await supabase.auth.admin.createUser({
      email: padreEmail,
      password: password,
      email_confirm: true,
      user_metadata: { rol_id: 3, nombre_completo: 'Padre Prueba' }
    });
    if (padAuthErr) throw new Error('Error padre auth: ' + padAuthErr.message);

    const { data: padreUser, error: padUsrErr } = await supabase.from('usuarios').insert({
      email: padreEmail,
      nombre_completo: 'Padre Prueba',
      rol_id: 3,
      auth_user_id: padAuth.user.id,
      activo: true,
      activado_en: new Date().toISOString()
    }).select().single();
    if (padUsrErr) throw new Error('Error padre usuarios: ' + padUsrErr.message);

    // Asignar Padre al Alumno
    await supabase.from('parentescos').insert({
      padre_id: padreUser.id,
      alumno_id: alumno.id,
      relacion: 'Padre/Tutor'
    });
    console.log('✅ Padre y Alumno creados y vinculados:', padreEmail);

    console.log('\n=== RESUMEN DE CREDENCIALES ===');
    console.log('Todos usan la contraseña:', password);
    console.log('Admin:', adminEmail);
    console.log('Maestro:', maestroEmail);
    console.log('Alumno/Padre:', padreEmail);

  } catch (err) {
    console.error('❌ Error setup:', err);
  }
}

run();

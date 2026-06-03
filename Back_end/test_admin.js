require('dotenv').config({ path: '.env.production' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

async function run() {
  try {
    console.log('--- Starting test setup ---');

    // 1. Get an unassigned subject and group combination
    const { data: asig } = await supabase.from('asignaciones_docentes').select('materia_id, grupo_id');
    const { data: materias } = await supabase.from('materias').select('id');
    const { data: grupos } = await supabase.from('grupos').select('id');

    let materiaId = null;
    let grupoId = null;

    for (const mat of materias) {
      for (const grp of grupos) {
        if (!asig.find(x => x.materia_id === mat.id && x.grupo_id === grp.id)) {
          materiaId = mat.id;
          grupoId = grp.id;
          break;
        }
      }
      if (materiaId) break;
    }

    if (!materiaId || !grupoId) {
      throw new Error('No available subject/group combination found.');
    }
    console.log('Materia ID:', materiaId);
    console.log('Grupo ID:', grupoId);

    // 2. Create Docente (role 2)
    const docenteEmail = `docente_${Date.now()}@test.com`;
    const docentePassword = 'Password123!';
    const { data: docAuth, error: docAuthErr } = await supabase.auth.admin.createUser({
      email: docenteEmail,
      password: docentePassword,
      email_confirm: true,
      user_metadata: { rol_id: 2, nombre_completo: 'Test Docente' }
    });
    if (docAuthErr) throw new Error('Error creating Docente auth: ' + docAuthErr.message);
    const docenteAuthId = docAuth.user.id;

    const { data: docenteUser, error: docUsrErr } = await supabase.from('usuarios').insert({
      email: docenteEmail,
      nombre_completo: 'Test Docente',
      rol_id: 2,
      auth_user_id: docenteAuthId,
      activo: true,
      activado_en: new Date().toISOString()
    }).select().single();
    if (docUsrErr) throw new Error('Error inserting Docente in usuarios: ' + docUsrErr.message);
    const docenteId = docenteUser.id;
    console.log('Docente ID:', docenteId);

    // 3. Create Padre (role 3)
    const padreEmail = `padre_${Date.now()}@test.com`;
    const padrePassword = 'Password123!';
    const { data: padAuth, error: padAuthErr } = await supabase.auth.admin.createUser({
      email: padreEmail,
      password: padrePassword,
      email_confirm: true,
      user_metadata: { rol_id: 3, nombre_completo: 'Test Padre' }
    });
    if (padAuthErr) throw new Error('Error creating Padre auth: ' + padAuthErr.message);
    const padreAuthId = padAuth.user.id;

    const { data: padreUser, error: padUsrErr } = await supabase.from('usuarios').insert({
      email: padreEmail,
      nombre_completo: 'Test Padre',
      rol_id: 3,
      auth_user_id: padreAuthId,
      activo: true,
      activado_en: new Date().toISOString()
    }).select().single();
    if (padUsrErr) throw new Error('Error inserting Padre in usuarios: ' + padUsrErr.message);
    const padreId = padreUser.id;
    console.log('Padre ID:', padreId);

    // 4. Create Alumno
    const { data: alumno, error: alumErr } = await supabase.from('alumnos').insert({
      matricula: `MAT-${Date.now()}`,
      nombre_completo: 'Test Alumno',
      grupo_id: grupoId,
      fecha_nacimiento: '2010-01-01'
    }).select().single();
    if (alumErr) throw new Error('Error inserting Alumno: ' + alumErr.message);
    const alumnoId = alumno.id;
    console.log('Alumno ID:', alumnoId);

    // 5. Assign Docente to class
    const { error: asigErr } = await supabase.from('asignaciones_docentes').insert({
      docente_id: docenteId,
      materia_id: materiaId,
      grupo_id: grupoId
    });
    if (asigErr) throw new Error('Error assigning Docente: ' + asigErr.message);
    console.log('Docente assigned successfully.');

    // 6. Assign Padre to Alumno
    const { error: parErr } = await supabase.from('parentescos').insert({
      padre_id: padreId,
      alumno_id: alumnoId
    });
    if (parErr) throw new Error('Error assigning Padre to Alumno: ' + parErr.message);
    console.log('Padre assigned to Alumno successfully.');

    console.log('\n--- SUCCESS ---');
    console.log('Docente Credentials:');
    console.log(`Email: ${docenteEmail}`);
    console.log(`Password: ${docentePassword}`);
    console.log(`Usuario ID: ${docenteId}`);
    
    console.log('\nPadre Credentials:');
    console.log(`Email: ${padreEmail}`);
    console.log(`Password: ${padrePassword}`);
    console.log(`Usuario ID: ${padreId}`);

    console.log('\nAlumno Info:');
    console.log(`ID: ${alumnoId}`);
    console.log(`Matricula: ${alumno.matricula}`);

  } catch (err) {
    console.error('Test setup failed:', err.message);
  }
}

run();

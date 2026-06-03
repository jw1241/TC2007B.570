const axios = require('axios');
const PORT = 4002;
process.env.PORT = PORT;

// Require index.js which will start the server on process.env.PORT
require('./index');

async function runTest() {
  // wait 1 sec for server to start
  await new Promise(r => setTimeout(r, 1000));
  const baseURL = `http://localhost:${PORT}/api`;

  try {
    console.log('\n--- 1. Login ---');
    const loginRes = await axios.post(`${baseURL}/auth/login`, {
      email: 'padre_1780529344951@test.com',
      password: 'Password123!'
    });
    const token = loginRes.data.token;
    console.log('Login successful, token:', token.substring(0, 20) + '...');

    const headers = { Authorization: `Bearer ${token}` };
    const alumnoId = '51fe41ac-722e-4142-a757-28deec3c47d2';

    console.log('\n--- 2. Fetch Grades ---');
    const gradesRes = await axios.get(`${baseURL}/padre/hijo/${alumnoId}/calificaciones`, { headers });
    console.log('Grades response:', JSON.stringify(gradesRes.data, null, 2));

    console.log('\n--- 3. Sign Report Card ---');
    const signRes = await axios.post(`${baseURL}/padre/hijo/${alumnoId}/firmar-acuse`, { alumno_id: alumnoId }, { headers });
    console.log('Sign response:', JSON.stringify(signRes.data, null, 2));

    console.log('\n✅ All steps completed successfully!');

  } catch (error) {
    console.error('\n❌ Error occurred:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error(error.message);
    }
  } finally {
    process.exit(0);
  }
}

runTest();

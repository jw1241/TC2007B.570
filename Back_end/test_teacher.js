require("dotenv").config({ path: ".env.production" });
process.env.PORT = 4001;

// Load the server
require("./index.js");

async function run() {
  await new Promise(r => setTimeout(r, 1500)); // wait for server to bind

  const baseURL = "http://localhost:4001";
  
  try {
    console.log("1. Logging in as Teacher...");
    const loginRes = await fetch(`${baseURL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "docente_1780529344658@test.com",
        password: "Password123!"
      })
    });
    
    if (!loginRes.ok) {
      const err = await loginRes.json();
      throw new Error(`Login failed: ${loginRes.status} ${JSON.stringify(err)}`);
    }
    const loginData = await loginRes.json();
    const token = loginData.token.access_token;
    console.log("✅ Login successful. Token acquired.\n");
    
    console.log("2. Fetching classes...");
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const clasesRes = await fetch(`${baseURL}/api/docente/mis-clases`, config);
    if (!clasesRes.ok) {
      const err = await clasesRes.json();
      throw new Error(`Fetch classes failed: ${clasesRes.status} ${JSON.stringify(err)}`);
    }
    
    const clasesData = await clasesRes.json();
    const clases = clasesData.data;
    console.log("✅ Classes fetched:");
    console.log(JSON.stringify(clases, null, 2));
    
    if (!clases || clases.length === 0) {
      console.log("❌ No classes found, cannot assign grade.");
      process.exit(1);
    }
    
    const primeraClase = clases[0];
    const materia_id = primeraClase.materias.id;
    const alumno_id = "51fe41ac-722e-4142-a757-28deec3c47d2";
    
    console.log(`\n3. Assigning grade 9.5 for trimester 1 to student ${alumno_id} in class ${materia_id}...`);
    
    const gradePayload = {
      alumno_id: alumno_id,
      materia_id: materia_id,
      trimestre: 1,
      calificacion: 9.5
    };
    
    const gradeRes = await fetch(`${baseURL}/api/docente/calificaciones`, {
      method: "PUT",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(gradePayload)
    });

    if (!gradeRes.ok) {
      const err = await gradeRes.json();
      throw new Error(`Submit grade failed: ${gradeRes.status} ${JSON.stringify(err)}`);
    }
    
    const gradeData = await gradeRes.json();
    console.log("✅ Grade submitted successfully!");
    console.log(gradeData);

  } catch (error) {
    console.error("❌ Error:", error.message);
  } finally {
    process.exit(0);
  }
}

run();

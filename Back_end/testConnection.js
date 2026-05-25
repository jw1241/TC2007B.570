require("dotenv").config({ path: ".env.production" });
const supabase = require("./config/supabaseClient");

async function checkSchema() {
  const tables = ['usuarios', 'alumnos', 'calificaciones', 'asignaciones_docentes', 'parentescos', 'materias'];
  
  console.log("=== VERIFICANDO ESQUEMA ===");
  
  for (const table of tables) {
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .limit(1);
      
    if (error) {
      console.log(`❌ Tabla '${table}' ERROR: ${error.message}`);
    } else {
      if (data.length > 0) {
        console.log(`✅ Tabla '${table}' EXISTE. Columnas detectadas:`);
        console.log(Object.keys(data[0]).join(', '));
      } else {
        console.log(`✅ Tabla '${table}' EXISTE, pero está VACÍA. No se pueden deducir columnas automáticamente con este método.`);
      }
    }
  }
}

checkSchema();

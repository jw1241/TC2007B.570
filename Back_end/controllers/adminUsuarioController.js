const { supabaseAdmin } = require("../config/supabaseClient");
const csv = require("csv-parser");
const { Readable } = require("stream");
const crypto = require("crypto");

// ─── Helpers ──────────────────────────────────────────────────────────────────

function codigoRegistro() {
  return crypto.randomBytes(4).toString("hex").toUpperCase();
}

function generarIdentificador(prefijo) {
  const num = Math.floor(10000 + Math.random() * 90000);
  return `${prefijo}-${num}`;
}

function parseCsv(file) {
  return new Promise((resolve, reject) => {
    const results = [];
    Readable.from(file.buffer)
      .pipe(csv())
      .on("data", (data) => results.push(data))
      .on("end", () => resolve(results))
      .on("error", reject);
  });
}

function normalize(row) {
  const out = {};
  for (const k of Object.keys(row)) {
    const key = k.replace(/^﻿/, "").toLowerCase().trim();
    out[key] = row[k];
  }
  return out;
}

function cleanStr(v) { return typeof v === "string" ? v.trim() : ""; }
function toBool(v) { return v === true || v === "true" || v === "TRUE" || v === "1" || v === 1; }
function toInt(v) { const n = Number(v); return Number.isInteger(n) ? n : NaN; }

function logRowError(row, err) {
  console.error("ROW FAILED:", { row, error: err.message });
}

// ─── POST /import/grupos ──────────────────────────────────────────────────────
async function importGrupos(req, res) {
  try {
    const rows = await parseCsv(req.file);
    const inserts = [];

    for (const raw of rows) {
      const row = normalize(raw);
      const grado = toInt(row.grado);
      const seccion = cleanStr(row.seccion).toUpperCase();

      if (!Number.isInteger(grado) || grado < 1 || grado > 6) { logRowError(raw, new Error("Invalid grado")); continue; }
      if (!seccion) { logRowError(raw, new Error("Missing seccion")); continue; }

      inserts.push({ grado, seccion });
    }

    if (!inserts.length) {
      return res.status(400).json({ ok: false, message: "No valid rows" });
    }

    const { error } = await supabaseAdmin.from("grupos").insert(inserts);
    if (error) throw error;

    res.json({ ok: true, inserted: inserts.length });
  } catch (err) {
    console.error("IMPORT ERROR:", err);
    res.status(500).json({ ok: false, error: err.message || "Unexpected error" });
  }
}

// ─── POST /import/materias ────────────────────────────────────────────────────
async function importMaterias(req, res) {
  try {
    const rows = await parseCsv(req.file);
    const inserts = [];

    for (const raw of rows) {
      const row = normalize(raw);
      const nombre_materia = cleanStr(row.nombre_materia);
      const es_general = toBool(row.es_general);

      if (!nombre_materia) { logRowError(raw, new Error("Missing nombre_materia")); continue; }

      inserts.push({ nombre_materia, es_general });
    }

    if (!inserts.length) {
      return res.status(400).json({ ok: false, message: "No valid materias" });
    }

    const { error } = await supabaseAdmin.from("materias").insert(inserts);
    if (error) throw error;

    res.json({ ok: true, inserted: inserts.length });
  } catch (err) {
    console.error("IMPORT ERROR:", err);
    res.status(500).json({ ok: false, error: err.message || "Unexpected error" });
  }
}

// ─── POST /import/alumnos ─────────────────────────────────────────────────────
async function importAlumnos(req, res) {
  try {
    const rows = await parseCsv(req.file);

    for (const raw of rows) {
      try {
        const row = normalize(raw);
        const estudiante = cleanStr(row.nombre_estudiante);
        const padre = cleanStr(row.nombre_padre);
        const grado = toInt(row.grado);
        const seccion = cleanStr(row.seccion).toUpperCase();

        if (!estudiante || !padre || !grado || !seccion) throw new Error("Missing required fields");

        const matricula = generarIdentificador('ALU');

        const { data: grupo } = await supabaseAdmin.from("grupos").select("id").eq("grado", grado).eq("seccion", seccion).maybeSingle();
        if (!grupo) throw new Error("Grupo not found");

        const codigo = codigoRegistro();

        const { data: padreUser, error: padreErr } = await supabaseAdmin
          .from("usuarios")
          .insert({ nombre_completo: padre, rol_id: 3, activo: false, codigo_registro: codigo })
          .select().single();
        if (padreErr) throw padreErr;

        const { data: alumno, error: alumnoErr } = await supabaseAdmin
          .from("alumnos")
          .insert({ matricula, nombre_completo: estudiante, grupo_id: grupo.id, fecha_nacimiento: "2015-01-01", codigo_registro: codigo })
          .select().single();
        if (alumnoErr) throw alumnoErr;

        await supabaseAdmin.from("parentescos").insert({ padre_id: padreUser.id, alumno_id: alumno.id });
      } catch (err) {
        logRowError(raw, err);
      }
    }

    res.json({ ok: true });
  } catch (err) {
    console.error("IMPORT ERROR:", err);
    res.status(500).json({ ok: false, error: err.message || "Unexpected error" });
  }
}

// ─── POST /import/profesores ──────────────────────────────────────────────────
async function importProfesores(req, res) {
  try {
    const rows = await parseCsv(req.file);

    for (const raw of rows) {
      try {
        const row = normalize(raw);
        const nombre = cleanStr(row.nombre_completo);
        const materia_name = cleanStr(row.nombre_materia);
        const grado = toInt(row.grado);
        const seccion = cleanStr(row.seccion).toUpperCase();

        if (!nombre || !materia_name || !grado || !seccion) throw new Error("Missing fields");

        const identificacion_docente = generarIdentificador('DOC');
        const codigo = codigoRegistro();
        const generatedEmail = `${identificacion_docente.toLowerCase()}@escuelametropolitana.edu.mx`;

        const { data: docente, error: docErr } = await supabaseAdmin
          .from("usuarios")
          .insert({ nombre_completo: nombre, identificacion_docente, rol_id: 2, activo: false, codigo_registro: codigo, email: generatedEmail })
          .select().single();
        if (docErr) throw docErr;

        const { data: materia } = await supabaseAdmin.from("materias").select("id").eq("nombre_materia", materia_name).maybeSingle();
        const { data: grupo } = await supabaseAdmin.from("grupos").select("id").eq("grado", grado).eq("seccion", seccion).maybeSingle();

        if (!materia || !grupo) throw new Error("Missing relation");

        await supabaseAdmin.from("asignaciones_docentes").insert({ docente_id: docente.id, materia_id: materia.id, grupo_id: grupo.id });
      } catch (err) {
        logRowError(raw, err);
      }
    }

    res.json({ ok: true });
  } catch (err) {
    console.error("IMPORT ERROR:", err);
    res.status(500).json({ ok: false, error: err.message || "Unexpected error" });
  }
}

// ─── GET /grupos ──────────────────────────────────────────────────────────────
async function getGrupos(req, res, next) {
  try {
    const { data, error } = await supabaseAdmin.from("grupos")
      .select("*")
      .order("grado", { ascending: true })
      .order("seccion", { ascending: true });
    if (error) return res.status(500).json({ error });
    res.json(data);
  } catch (err) { next(err); }
}

// ─── GET /alumnos ─────────────────────────────────────────────────────────────
async function getAlumnos(req, res, next) {
  try {
    const { data, error } = await supabaseAdmin
      .from("alumnos")
      .select(`id, matricula, nombre_completo, codigo_registro, grupos ( grado, seccion ), parentescos ( usuarios ( nombre_completo ) )`);

    if (error) return res.status(500).json({ error });

    res.json(data.map(a => ({
      id: a.id,
      nombre_padre: a.parentescos?.[0]?.usuarios?.nombre_completo || "",
      matricula: a.matricula,
      nombre_estudiante: a.nombre_completo,
      codigo_registro: a.codigo_registro || "",
      grado: a.grupos?.grado || "",
      seccion: a.grupos?.seccion || ""
    })));
  } catch (err) { next(err); }
}

// ─── GET /materias ────────────────────────────────────────────────────────────
async function getMaterias(req, res, next) {
  try {
    const { data, error } = await supabaseAdmin.from("materias")
      .select("*")
      .order("nombre_materia", { ascending: true });
    if (error) return res.status(500).json({ error });
    res.json(data);
  } catch (err) { next(err); }
}

// ─── GET /profesores ──────────────────────────────────────────────────────────
async function getProfesores(req, res, next) {
  try {
    const { data, error } = await supabaseAdmin
      .from("asignaciones_docentes")
      .select(`
        docente:usuarios!asignaciones_docentes_docente_id_fkey ( id, nombre_completo, identificacion_docente, codigo_registro, email ),
        materia:materias ( nombre_materia ),
        grupo:grupos ( grado, seccion )
      `);

    if (error) return res.status(500).json({ error });

    res.json(data.map(p => ({
      nombre_completo: p.docente?.nombre_completo || "",
      docente_id: p.docente?.identificacion_docente || "",
      codigo_registro: p.docente?.codigo_registro || "",
      email: p.docente?.email || "",
      nombre_materia: p.materia?.nombre_materia || "",
      grado: p.grupo?.grado || "",
      seccion: p.grupo?.seccion || ""
    })));
  } catch (err) { next(err); }
}

// ─── POST /grupo ──────────────────────────────────────────────────────────────
async function crearGrupo(req, res, next) {
  try {
    const gradoInt = toInt(req.body.grado);
    const seccionClean = cleanStr(req.body.seccion).toUpperCase();

    if (!Number.isInteger(gradoInt) || gradoInt < 1 || gradoInt > 6) {
      return res.status(400).json({ ok: false, message: "Grado inválido" });
    }
    if (!seccionClean) return res.status(400).json({ ok: false, message: "Sección requerida" });

    const { error } = await supabaseAdmin.from("grupos").insert([{ grado: gradoInt, seccion: seccionClean }]);
    if (error) throw error;

    res.json({ ok: true });
  } catch (err) { next(err); }
}

// ─── POST /materia ────────────────────────────────────────────────────────────
async function crearMateria(req, res, next) {
  try {
    const nombreClean = cleanStr(req.body.nombre_materia);
    const esGeneralBool = toBool(req.body.es_general);

    if (!nombreClean) return res.status(400).json({ ok: false, message: "Nombre de materia requerido" });

    const { error } = await supabaseAdmin.from("materias").insert([{ nombre_materia: nombreClean, es_general: esGeneralBool }]);
    if (error) throw error;

    res.json({ ok: true });
  } catch (err) { next(err); }
}

// ─── POST /alumno ─────────────────────────────────────────────────────────────
async function crearAlumno(req, res, next) {
  try {
    const { nombre_estudiante, nombre_padre, grado, seccion } = req.body;
    const estClean = cleanStr(nombre_estudiante);
    const padreClean = cleanStr(nombre_padre);
    const gradoInt = toInt(grado);
    const secClean = cleanStr(seccion).toUpperCase();

    if (!estClean || !padreClean || !gradoInt || !secClean) {
      return res.status(400).json({ ok: false, message: "Faltan campos requeridos" });
    }

    const matClean = generarIdentificador('ALU');

    const { data: grupo } = await supabaseAdmin.from("grupos").select("id").eq("grado", gradoInt).eq("seccion", secClean).maybeSingle();
    if (!grupo) return res.status(404).json({ ok: false, message: "Grupo no encontrado en el sistema" });

    const codigo = codigoRegistro();

    const { data: padreUser, error: padreErr } = await supabaseAdmin
      .from("usuarios")
      .insert({ nombre_completo: padreClean, rol_id: 3, activo: false, codigo_registro: codigo })
      .select().single();
    if (padreErr) throw padreErr;

    const { data: alumno, error: alumnoErr } = await supabaseAdmin
      .from("alumnos")
      .insert({ matricula: matClean, nombre_completo: estClean, grupo_id: grupo.id, fecha_nacimiento: "2015-01-01", codigo_registro: codigo })
      .select().single();
    if (alumnoErr) throw alumnoErr;

    await supabaseAdmin.from("parentescos").insert({ padre_id: padreUser.id, alumno_id: alumno.id });

    res.json({ ok: true });
  } catch (err) { next(err); }
}

// ─── POST /profesor ───────────────────────────────────────────────────────────
async function crearProfesor(req, res, next) {
  try {
    const { nombre_completo, nombre_materia, grado, seccion } = req.body;
    const nomClean = cleanStr(nombre_completo);
    const matClean = cleanStr(nombre_materia);
    const gradoInt = toInt(grado);
    const secClean = cleanStr(seccion).toUpperCase();

    if (!nomClean || !matClean || !gradoInt || !secClean) {
      return res.status(400).json({ ok: false, message: "Faltan campos requeridos" });
    }

    const docClean = generarIdentificador('DOC');

    const codigo = codigoRegistro();
    const generatedEmail = `${docClean.toLowerCase()}@escuelametropolitana.edu.mx`;

    const { data: docente, error: docErr } = await supabaseAdmin
      .from("usuarios")
      .insert({ nombre_completo: nomClean, identificacion_docente: docClean, rol_id: 2, activo: false, codigo_registro: codigo, email: generatedEmail })
      .select().single();
    if (docErr) throw docErr;

    const { data: materia } = await supabaseAdmin.from("materias").select("id").eq("nombre_materia", matClean).maybeSingle();
    const { data: grupo } = await supabaseAdmin.from("grupos").select("id").eq("grado", gradoInt).eq("seccion", secClean).maybeSingle();

    if (!materia || !grupo) return res.status(404).json({ ok: false, message: "La materia o el grupo no existen en el sistema" });

    await supabaseAdmin.from("asignaciones_docentes").insert({ docente_id: docente.id, materia_id: materia.id, grupo_id: grupo.id });

    res.json({ ok: true });
  } catch (err) { next(err); }
}

// ─── POST /profesor/asignar ───────────────────────────────────────────────────
async function asignarProfesor(req, res, next) {
  try {
    const { identificacion_docente, nombre_materia, grado, seccion } = req.body;
    const matClean = cleanStr(nombre_materia);
    const gradoInt = toInt(grado);
    const secClean = cleanStr(seccion).toUpperCase();

    if (!identificacion_docente || !matClean || !gradoInt || !secClean) {
      return res.status(400).json({ ok: false, message: "Faltan campos requeridos" });
    }

    const { data: docente } = await supabaseAdmin.from("usuarios").select("id").eq("identificacion_docente", identificacion_docente).maybeSingle();
    if (!docente) return res.status(404).json({ ok: false, message: "Docente no encontrado" });

    const { data: materia } = await supabaseAdmin.from("materias").select("id").eq("nombre_materia", matClean).maybeSingle();
    const { data: grupo } = await supabaseAdmin.from("grupos").select("id").eq("grado", gradoInt).eq("seccion", secClean).maybeSingle();

    if (!materia || !grupo) return res.status(404).json({ ok: false, message: "La materia o el grupo no existen en el sistema" });

    const { error } = await supabaseAdmin.from("asignaciones_docentes").insert({ docente_id: docente.id, materia_id: materia.id, grupo_id: grupo.id });
    
    if (error) {
      if (error.code === '23505') return res.status(400).json({ ok: false, message: "El maestro ya tiene asignada esta materia en este grupo" });
      throw error;
    }

    res.json({ ok: true });
  } catch (err) { next(err); }
}

// ─── PUT /grupo/:id ───────────────────────────────────────────────────────────
async function updateGrupo(req, res, next) {
  try {
    const { id } = req.params;
    const gradoInt = toInt(req.body.grado);
    const seccionClean = cleanStr(req.body.seccion).toUpperCase();

    if (!Number.isInteger(gradoInt) || gradoInt < 1 || gradoInt > 6) return res.status(400).json({ ok: false, message: "Grado inválido" });
    if (!seccionClean) return res.status(400).json({ ok: false, message: "Sección requerida" });

    const { error } = await supabaseAdmin.from("grupos").update({ grado: gradoInt, seccion: seccionClean }).eq("id", id);
    if (error) throw error;
    res.json({ ok: true });
  } catch (err) { next(err); }
}

// ─── DELETE /grupo/:id ────────────────────────────────────────────────────────
async function deleteGrupo(req, res, next) {
  try {
    const { id } = req.params;
    const { error } = await supabaseAdmin.from("grupos").delete().eq("id", id);
    if (error) throw error;
    res.json({ ok: true });
  } catch (err) { next(err); }
}

// ─── PUT /materia/:id ─────────────────────────────────────────────────────────
async function updateMateria(req, res, next) {
  try {
    const { id } = req.params;
    const nombreClean = cleanStr(req.body.nombre_materia);
    const esGeneralBool = toBool(req.body.es_general);

    if (!nombreClean) return res.status(400).json({ ok: false, message: "Nombre de materia requerido" });

    const { error } = await supabaseAdmin.from("materias").update({ nombre_materia: nombreClean, es_general: esGeneralBool }).eq("id", id);
    if (error) throw error;
    res.json({ ok: true });
  } catch (err) { next(err); }
}

// ─── DELETE /materia/:id ──────────────────────────────────────────────────────
async function deleteMateria(req, res, next) {
  try {
    const { id } = req.params;
    const { error } = await supabaseAdmin.from("materias").delete().eq("id", id);
    if (error) throw error;
    res.json({ ok: true });
  } catch (err) { next(err); }
}

// ─── PUT /alumno/:id ──────────────────────────────────────────────────────────
async function updateAlumno(req, res, next) {
  try {
    const { id } = req.params;
    const { matricula, nombre_estudiante, grado, seccion } = req.body;
    
    const matClean = cleanStr(matricula);
    const estClean = cleanStr(nombre_estudiante);
    const gradoInt = toInt(grado);
    const secClean = cleanStr(seccion).toUpperCase();

    if (!matClean || !estClean || !gradoInt || !secClean) {
      return res.status(400).json({ ok: false, message: "Faltan campos requeridos" });
    }

    const { data: grupo } = await supabaseAdmin.from("grupos").select("id").eq("grado", gradoInt).eq("seccion", secClean).maybeSingle();
    if (!grupo) return res.status(404).json({ ok: false, message: "Grupo no encontrado en el sistema" });

    const { error: alumnoErr } = await supabaseAdmin
      .from("alumnos")
      .update({ matricula: matClean, nombre_completo: estClean, grupo_id: grupo.id })
      .eq("id", id);
    if (alumnoErr) throw alumnoErr;

    res.json({ ok: true });
  } catch (err) { next(err); }
}

// ─── DELETE /alumno/:id ───────────────────────────────────────────────────────
async function deleteAlumno(req, res, next) {
  try {
    const { id } = req.params;
    const { error } = await supabaseAdmin.from("alumnos").delete().eq("id", id);
    if (error) throw error;
    res.json({ ok: true });
  } catch (err) { next(err); }
}

// ─── PUT /profesor/:id ────────────────────────────────────────────────────────
async function updateProfesor(req, res, next) {
  try {
    const { id } = req.params; // ID of the asignaciones_docentes or user? Actually let's assume id is 'identificacion_docente' or 'nombre' since it's nested.
    // To keep it simple, we update based on docente_id (which is identificacion_docente)
    const { docente_id, nombre_completo, nombre_materia, grado, seccion } = req.body;
    
    // First find the user
    const { data: user } = await supabaseAdmin.from("usuarios").select("id").eq("identificacion_docente", id).maybeSingle();
    if (!user) return res.status(404).json({ ok: false, message: "Profesor no encontrado" });

    if (nombre_completo) {
        await supabaseAdmin.from("usuarios").update({ nombre_completo: cleanStr(nombre_completo) }).eq("id", user.id);
    }
    
    // Optional: update assignments
    res.json({ ok: true, message: "Profesor actualizado (solo nombre soportado en esta versión)" });
  } catch (err) { next(err); }
}

// ─── DELETE /profesor/:id ─────────────────────────────────────────────────────
async function deleteProfesor(req, res, next) {
  try {
    const { id } = req.params; // Assuming ID is the identificacion_docente string
    const { data: user } = await supabaseAdmin.from("usuarios").select("id").eq("identificacion_docente", id).maybeSingle();
    if (user) {
        const { error } = await supabaseAdmin.from("usuarios").delete().eq("id", user.id);
        if (error) throw error;
    }
    res.json({ ok: true });
  } catch (err) { next(err); }
}

module.exports = {
  importGrupos,
  importMaterias,
  importAlumnos,
  importProfesores,
  getGrupos,
  getAlumnos,
  getMaterias,
  getProfesores,
  crearGrupo,
  crearMateria,
  crearAlumno,
  crearProfesor,
  asignarProfesor,
  updateGrupo,
  deleteGrupo,
  updateMateria,
  deleteMateria,
  updateAlumno,
  deleteAlumno,
  updateProfesor,
  deleteProfesor
};

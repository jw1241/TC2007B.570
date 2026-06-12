const { supabaseAdmin } = require("../config/supabaseClient");
const csv = require("csv-parser");
const { Readable } = require("stream");
const crypto = require("crypto");

// ─── Helpers ──────────────────────────────────────────────────────────────────

function codigoRegistro() {
  return crypto.randomBytes(4).toString("hex").toUpperCase();
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
        const matricula = cleanStr(row.matricula);
        const estudiante = cleanStr(row.nombre_estudiante);
        const padre = cleanStr(row.nombre_padre);
        const grado = toInt(row.grado);
        const seccion = cleanStr(row.seccion).toUpperCase();

        if (!matricula || !estudiante || !padre || !grado || !seccion) throw new Error("Missing required fields");

        const existing = await supabaseAdmin.from("alumnos").select("id").eq("matricula", matricula).maybeSingle();
        if (existing.data) continue;

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
        const docente_id = cleanStr(row.docente_id);
        const nombre = cleanStr(row.nombre_completo);
        const materia_name = cleanStr(row.nombre_materia);
        const grado = toInt(row.grado);
        const seccion = cleanStr(row.seccion).toUpperCase();

        if (!docente_id || !nombre || !materia_name || !grado || !seccion) throw new Error("Missing fields");

        const existing = await supabaseAdmin.from("usuarios").select("id").eq("identificacion_docente", docente_id).maybeSingle();
        if (existing.data) continue;

        const codigo = codigoRegistro();

        const { data: docente, error: docErr } = await supabaseAdmin
          .from("usuarios")
          .insert({ nombre_completo: nombre, identificacion_docente: docente_id, rol_id: 2, activo: false, codigo_registro: codigo })
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
    const { data, error } = await supabaseAdmin.from("grupos").select("*");
    if (error) return res.status(500).json({ error });
    res.json(data);
  } catch (err) { next(err); }
}

// ─── GET /alumnos ─────────────────────────────────────────────────────────────
async function getAlumnos(req, res, next) {
  try {
    const { data, error } = await supabaseAdmin
      .from("alumnos")
      .select(`id, matricula, nombre_completo, grupos ( grado, seccion ), parentescos ( usuarios ( nombre_completo ) )`);

    if (error) return res.status(500).json({ error });

    res.json(data.map(a => ({
      nombre_padre: a.parentescos?.[0]?.usuarios?.nombre_completo || "",
      matricula: a.matricula,
      nombre_estudiante: a.nombre_completo,
      grado: a.grupos?.grado || "",
      seccion: a.grupos?.seccion || ""
    })));
  } catch (err) { next(err); }
}

// ─── GET /materias ────────────────────────────────────────────────────────────
async function getMaterias(req, res, next) {
  try {
    const { data, error } = await supabaseAdmin.from("materias").select("*");
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
        docente:usuarios!asignaciones_docentes_docente_id_fkey ( id, nombre_completo, identificacion_docente ),
        materia:materias ( nombre_materia ),
        grupo:grupos ( grado, seccion )
      `);

    if (error) return res.status(500).json({ error });

    res.json(data.map(p => ({
      nombre_completo: p.docente?.nombre_completo || "",
      docente_id: p.docente?.identificacion_docente || "",
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
    const { matricula, nombre_estudiante, nombre_padre, grado, seccion } = req.body;
    const matClean = cleanStr(matricula);
    const estClean = cleanStr(nombre_estudiante);
    const padreClean = cleanStr(nombre_padre);
    const gradoInt = toInt(grado);
    const secClean = cleanStr(seccion).toUpperCase();

    if (!matClean || !estClean || !padreClean || !gradoInt || !secClean) {
      return res.status(400).json({ ok: false, message: "Faltan campos requeridos" });
    }

    const existing = await supabaseAdmin.from("alumnos").select("id").eq("matricula", matClean).maybeSingle();
    if (existing.data) return res.status(400).json({ ok: false, message: "La matrícula ya existe" });

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
    const { docente_id, nombre_completo, nombre_materia, grado, seccion } = req.body;
    const docClean = cleanStr(docente_id);
    const nomClean = cleanStr(nombre_completo);
    const matClean = cleanStr(nombre_materia);
    const gradoInt = toInt(grado);
    const secClean = cleanStr(seccion).toUpperCase();

    if (!docClean || !nomClean || !matClean || !gradoInt || !secClean) {
      return res.status(400).json({ ok: false, message: "Faltan campos requeridos" });
    }

    const existing = await supabaseAdmin.from("usuarios").select("id").eq("identificacion_docente", docClean).maybeSingle();
    if (existing.data) return res.status(400).json({ ok: false, message: "El docente con este ID ya existe" });

    const codigo = codigoRegistro();

    const { data: docente, error: docErr } = await supabaseAdmin
      .from("usuarios")
      .insert({ nombre_completo: nomClean, identificacion_docente: docClean, rol_id: 2, activo: false, codigo_registro: codigo })
      .select().single();
    if (docErr) throw docErr;

    const { data: materia } = await supabaseAdmin.from("materias").select("id").eq("nombre_materia", matClean).maybeSingle();
    const { data: grupo } = await supabaseAdmin.from("grupos").select("id").eq("grado", gradoInt).eq("seccion", secClean).maybeSingle();

    if (!materia || !grupo) return res.status(404).json({ ok: false, message: "La materia o el grupo no existen en el sistema" });

    await supabaseAdmin.from("asignaciones_docentes").insert({ docente_id: docente.id, materia_id: materia.id, grupo_id: grupo.id });

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
  crearProfesor
};

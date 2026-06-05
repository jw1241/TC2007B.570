const express = require("express");
const router = express.Router();
const Joi = require("joi");
const { supabaseAdmin } = require("../config/supabaseClient");
const csv = require("csv-parser");
const { Readable } = require('stream');

const { authMiddleware } = require("../middleware/authMiddleware");
const { requireRole } = require("../middleware/roleMiddleware");
const ROLES = require("../constants/roles");

const multer = require('multer');

const upload = multer({
  storage: multer.memoryStorage()
});

const crypto = require('crypto');

function codigoRegistro() {
  return crypto
    .randomBytes(4)
    .toString('hex')
    .toUpperCase();
}

router.post(
  "/import/grupos",
  authMiddleware,
  requireRole([ROLES.ADMIN]),
  upload.single("file"),
  safeRoute(async (req, res) => {

    const rows = await parseCsv(req.file);

    const inserts = [];

    for (const raw of rows) {
      const row = normalize(raw);

      const grado = toInt(row.grado);
      const seccion = cleanStr(row.seccion).toUpperCase();

      if (!Number.isInteger(grado) || grado < 1 || grado > 6) {
        logRowError(raw, new Error("Invalid grado"));
        continue;
      }

      if (!seccion) {
        logRowError(raw, new Error("Missing seccion"));
        continue;
      }

      inserts.push({ grado, seccion });
    }

    if (!inserts.length) {
      return res.status(400).json({
        ok: false,
        message: "No valid rows"
      });
    }

    const { error } = await supabaseAdmin
      .from("grupos")
      .insert(inserts);

    if (error) throw error;

    res.json({ ok: true, inserted: inserts.length });
  })
);

router.post(
  "/import/materias",
  authMiddleware,
  requireRole([ROLES.ADMIN]),
  upload.single("file"),
  safeRoute(async (req, res) => {

    const rows = await parseCsv(req.file);

    const inserts = [];

    for (const raw of rows) {
      const row = normalize(raw);

      const nombre_materia = cleanStr(row.nombre_materia);
      const es_general = toBool(row.es_general);

      if (!nombre_materia) {
        logRowError(raw, new Error("Missing nombre_materia"));
        continue;
      }

      inserts.push({
        nombre_materia,
        es_general
      });
    }

    if (!inserts.length) {
      return res.status(400).json({
        ok: false,
        message: "No valid materias"
      });
    }

    const { error } = await supabaseAdmin
      .from("materias")
      .insert(inserts);

    if (error) throw error;

    res.json({ ok: true, inserted: inserts.length });
  })
);

router.post(
  "/import/alumnos",
  authMiddleware,
  requireRole([ROLES.ADMIN]),
  upload.single("file"),
  safeRoute(async (req, res) => {

    const rows = await parseCsv(req.file);

    for (const raw of rows) {
      try {
        const row = normalize(raw);

        const matricula = cleanStr(row.matricula);
        const estudiante = cleanStr(row.nombre_estudiante);
        const padre = cleanStr(row.nombre_padre);
        const grado = toInt(row.grado);
        const seccion = cleanStr(row.seccion).toUpperCase();

        if (!matricula || !estudiante || !padre || !grado || !seccion) {
          throw new Error("Missing required fields");
        }

        const existing = await supabaseAdmin
          .from("alumnos")
          .select("id")
          .eq("matricula", matricula)
          .maybeSingle();

        if (existing.data) continue;

        const { data: grupo } = await supabaseAdmin
          .from("grupos")
          .select("id")
          .eq("grado", grado)
          .eq("seccion", seccion)
          .maybeSingle();

        if (!grupo) throw new Error("Grupo not found");

        const codigo = codigoRegistro();

        const { data: padreUser, error: padreErr } = await supabaseAdmin
          .from("usuarios")
          .insert({
            nombre_completo: padre,
            rol_id: 3,
            activo: false,
            codigo_registro: codigo
          })
          .select()
          .single();

        if (padreErr) throw padreErr;

        const { data: alumno, error: alumnoErr } = await supabaseAdmin
          .from("alumnos")
          .insert({
            matricula,
            nombre_completo: estudiante,
            grupo_id: grupo.id,
            fecha_nacimiento: "2015-01-01",
            codigo_registro: codigo
          })
          .select()
          .single();

        if (alumnoErr) throw alumnoErr;

        await supabaseAdmin
          .from("parentescos")
          .insert({
            padre_id: padreUser.id,
            alumno_id: alumno.id
          });

      } catch (err) {
        logRowError(raw, err);
      }
    }

    res.json({ ok: true });
  })
);

router.post(
  "/import/profesores",
  authMiddleware,
  requireRole([ROLES.ADMIN]),
  upload.single("file"),
  safeRoute(async (req, res) => {

    const rows = await parseCsv(req.file);

    for (const raw of rows) {
      try {
        const row = normalize(raw);

        const docente_id = cleanStr(row.docente_id);
        const nombre = cleanStr(row.nombre_completo);
        const materia_name = cleanStr(row.nombre_materia);
        const grado = toInt(row.grado);
        const seccion = cleanStr(row.seccion).toUpperCase();

        if (!docente_id || !nombre || !materia_name || !grado || !seccion) {
          throw new Error("Missing fields");
        }

        const existing = await supabaseAdmin
          .from("usuarios")
          .select("id")
          .eq("identificacion_docente", docente_id)
          .maybeSingle();

        if (existing.data) continue;

        const codigo = codigoRegistro();

        const { data: docente, error: docErr } = await supabaseAdmin
          .from("usuarios")
          .insert({
            nombre_completo: nombre,
            identificacion_docente: docente_id,
            rol_id: 2,
            activo: false,
            codigo_registro: codigo
          })
          .select()
          .single();

        if (docErr) throw docErr;

        const { data: materia } = await supabaseAdmin
          .from("materias")
          .select("id")
          .eq("nombre_materia", materia_name)
          .maybeSingle();

        const { data: grupo } = await supabaseAdmin
          .from("grupos")
          .select("id")
          .eq("grado", grado)
          .eq("seccion", seccion)
          .maybeSingle();

        if (!materia || !grupo) throw new Error("Missing relation");

        await supabaseAdmin
          .from("asignaciones_docentes")
          .insert({
            docente_id: docente.id,
            materia_id: materia.id,
            grupo_id: grupo.id
          });

      } catch (err) {
        logRowError(raw, err);
      }
    }

    res.json({ ok: true });
  })
);

router.get(
  "/grupos",
  authMiddleware,
  requireRole([ROLES.ADMIN]),
  async (req, res) => {
    const { data, error } = await supabaseAdmin
      .from("grupos")
      .select("*");

    if (error) return res.status(500).json({ error });

    res.json(data);
  }
);

router.get(
  "/alumnos",
  authMiddleware,
  requireRole([ROLES.ADMIN]),
  async (req, res) => {
    const { data, error } = await supabaseAdmin
  .from("alumnos")
  .select(`
    id,
    matricula,
    nombre_completo,
    grupos (
      grado,
      seccion
    ),
    parentescos (
      usuarios (
        nombre_completo
      )
    )
  `);

    if (error) return res.status(500).json({ error });

    const formatted = data.map(a => ({
  nombre_padre: a.parentescos?.[0]?.usuarios?.nombre_completo || '',
  matricula: a.matricula,
  nombre_estudiante: a.nombre_completo,
  grado: a.grupos?.grado || '',
  seccion: a.grupos?.seccion || ''
}));

res.json(formatted);
  }
);

router.get(
  "/materias",
  authMiddleware,
  requireRole([ROLES.ADMIN]),
  async (req, res) => {
    const { data, error } = await supabaseAdmin
      .from("materias")
      .select("*");

    if (error) return res.status(500).json({ error });

    res.json(data);
  }
);

router.get(
  "/profesores",
  authMiddleware,
  requireRole([ROLES.ADMIN]),
  async (req, res) => {

    const { data, error } = await supabaseAdmin
      .from("asignaciones_docentes")
      .select(`
        docente:usuarios!asignaciones_docentes_docente_id_fkey (
          id,
          nombre_completo,
          identificacion_docente
        ),
        materia:materias (
          nombre_materia
        ),
        grupo:grupos (
          grado,
          seccion
        )
      `);

    if (error) return res.status(500).json({ error });

    const formatted = data.map(p => ({
      nombre_completo: p.docente?.nombre_completo || '',
      docente_id: p.docente?.identificacion_docente || '', // ✅ FIX HERE
      nombre_materia: p.materia?.nombre_materia || '',
      grado: p.grupo?.grado || '',
      seccion: p.grupo?.seccion || ''
    }));

    res.json(formatted);
  }
);

async function parseCsv(file) {
  return new Promise((resolve, reject) => {
    const results = [];

    const readable = Readable.from(file.buffer);

    readable
      .pipe(csv())
      .on("data", (data) => results.push(data))
      .on("end", () => resolve(results))
      .on("error", reject);
  });
}

function safeRoute(handler) {
  return async (req, res) => {
    try {
      await handler(req, res);
    } catch (err) {
      console.error("IMPORT ERROR:", err);

      res.status(500).json({
        ok: false,
        error: err.message || "Unexpected error"
      });
    }
  };
}

function logRowError(row, err) {
  console.error("ROW FAILED:", {
    row,
    error: err.message
  });
}

function validateRow(schema, row) {
  const { error, value } = schema.validate(row);

  if (error) {
    throw new Error(error.details[0].message);
  }

  return value;
}

function toBool(v) {
  return v === true ||
    v === "true" ||
    v === "TRUE" ||
    v === "1" ||
    v === 1;
}

function cleanStr(v) {
  return typeof v === "string" ? v.trim() : "";
}

function toInt(v) {
  const n = Number(v);
  return Number.isInteger(n) ? n : NaN;
}

function normalize(row) {
  const out = {};
  for (const k of Object.keys(row)) {
    const key = k.toLowerCase().trim();
    out[key] = row[k];
  }
  return out;
}

function normalizeRow(row) {
  const cleaned = {};

  for (const key of Object.keys(row)) {
    const cleanKey = key
      .replace(/^\uFEFF/, '') // remove BOM
      .trim()
      .toLowerCase();

    cleaned[cleanKey] = row[key];
  }

  return cleaned;
}
module.exports = router;
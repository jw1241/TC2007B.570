const express = require("express");
const router = express.Router();

const Joi = require("joi");

const {
  authMiddleware
} = require("../middleware/authMiddleware");

const {
  requireRole
} = require("../middleware/roleMiddleware");

const ROLES =
  require("../constants/roles");

const schema = Joi.object({
  alumnoId: Joi.string()
    .uuid()
    .required()
});

router.get(
  "/:alumnoId/summary",
  authMiddleware,
  requireRole([
    ROLES.ADMIN,
    ROLES.DOCENTE,
    ROLES.PADRE
  ]),
  async (req, res, next) => {

    try {

      const { error, value } =
        schema.validate(req.params);

      if (error) {
        return res.status(400).json({
          error: {
            message: "Alumno inválido"
          }
        });
      }

      const { alumnoId } = value;

      console.log(
  "VALIDATED ALUMNO ID =",
  alumnoId
);

      /**
       * LOAD STUDENT
       */
      const {
        data: alumno,
        error: alumnoError
      } = await req.supabase
        .from("alumnos")
        .select(`
          id,
          matricula,
          nombre_completo,
          fecha_nacimiento,
          grupo_id,
          grupos:grupo_id (
            grado,
            seccion
          )
        `)
        .eq("id", alumnoId)
        .maybeSingle();

      if (alumnoError) {
        throw alumnoError;
      }

      if (!alumno) {
        return res.status(404).json({
          error: {
            message: "Alumno no encontrado"
          }
        });
      }

      /**
       * PARENT AUTHORIZATION
       */
      console.log("REQ.USER =", req.user);
console.log("ALUMNO ID 1 =", alumnoId);
console.log(
  "PARENT CHECK:",
  req.user.id,
  alumnoId
);
      if (req.user.rol_id === ROLES.PADRE) {

        const {
          data: parentesco,
          error: parentescoError
        } = await req.supabase
          .from("parentescos")
          .select("*")
          .eq("padre_id", req.user.id)
          .eq("alumno_id", alumnoId)
          .maybeSingle();

        if (parentescoError) {
          throw parentescoError;
        }

        if (!parentesco) {

          return res.status(403).json({
            error: {
              message: "No autorizado"
            }
          });

        }

      }

      /**
       * TEACHER AUTHORIZATION
       */
      let materiaIds = [];
      console.log("REQ.USER =", req.user);
console.log("ALUMNO ID 2 =", alumnoId);

      if (req.user.rol_id === ROLES.DOCENTE) {

        const {
          data: asignaciones,
          error: asignacionError
        } = await req.supabase
          .from("asignaciones_docentes")
          .select(`
            id,
            materia_id
          `)
          .eq(
            "docente_id",
            req.user.id
          )
          .eq(
            "grupo_id",
            alumno.grupo_id
          );

        if (asignacionError) {
          throw asignacionError;
        }

        if (
          !asignaciones ||
          asignaciones.length === 0
        ) {

          return res.status(403).json({
            error: {
              message: "No autorizado"
            }
          });

        }

        materiaIds =
          asignaciones.map(
            a => a.materia_id
          );

      }

      /**
       * LOAD PARENT
       */
console.log(
  "PARENT CHECK:",
  req.user.id,
  alumnoId
);
      const {
  data: parentescos,
  error: parentescoLookupError
} = await req.supabase
  .from("parentescos")
  .select(`
    padre_id,
    usuarios!parentescos_padre_id_fkey (
      id,
      nombre_completo
    )
  `)
  .eq("alumno_id", alumnoId);

  console.log(
  "PARENT QUERY RESULT",
  parentescos
);

  const padres =
  (parentescos || [])
    .map(p => p.usuarios)
    .filter(Boolean);

      if (parentescoLookupError) {
        throw parentescoLookupError;
      }

      /**
       * LOAD GRADES
       */
      let gradesQuery =
        req.supabase
          .from("calificaciones")
          .select(`
  id,
  nota,
  comentario,
  tarea,
  materia_id,
  materias (
    id,
    nombre_materia
  )
`)
          .eq(
            "alumno_id",
            alumnoId
          );

const materiaMap = await req.supabase
  .from("materias")
  .select("id, nombre_materia");

const map = Object.fromEntries(
  (materiaMap.data || []).map(m => [m.id, m.nombre_materia])
);

console.log("MATERIAS RAW:", materiaMap);
console.log("MATERIAS DATA:", materiaMap.data);
          
console.log("REQ.USER =", req.user);
console.log("ALUMNO ID =", alumnoId);
      if (
  req.user.rol_id === ROLES.DOCENTE &&
  materiaIds.length > 0
) {

  gradesQuery =
    gradesQuery.in(
      "materia_id",
      materiaIds
    );

}



      const {
  data: calificaciones,
  error: gradesError
} = await gradesQuery;

if (gradesError) {
  throw gradesError;
}


const grouped = {};

for (const item of calificaciones || []) {
  const key = item.materia_id;

  const nombre = map[key] || "Sin materia";

  if (!grouped[key]) {
    grouped[key] = {
      materia_id: key,
      nombre_materia: nombre,
      calificaciones: []
    };
  }

  grouped[key].calificaciones.push({
    id: item.id,
    tarea: item.tarea,
    nota: Number(item.nota),
    comentario: item.comentario
  });
}

const materias = Object.values(grouped); // ✅ FIX 1

let promedio = 0;
let mejorMateria = null;
let peorMateria = null;

if (calificaciones?.length > 0 && materias.length > 0) {

  const total = calificaciones.reduce(
    (sum, item) => sum + Number(item.nota),
    0
  );

  promedio = Number((total / calificaciones.length).toFixed(1));

  const subjectAverages = materias.map(m => {
    const avg =
      m.calificaciones.reduce((s, c) => s + Number(c.nota), 0) /
      m.calificaciones.length;

    return {
      materia_id: m.materia_id,
      nombre_materia: m.nombre_materia,
      promedio: Number(avg.toFixed(1))
    };
  });

  mejorMateria = subjectAverages.reduce((best, curr) =>
    curr.promedio > best.promedio ? curr : best
  );

  peorMateria = subjectAverages.reduce((worst, curr) =>
    curr.promedio < worst.promedio ? curr : worst
  );
}

console.log("CALIFICACIONES SAMPLE:", calificaciones?.[0]);
console.log("MATERIAS GROUPED:", materias);

return res.json({
  alumno,
  padre: padres[0] || null,
  padres,

  resumen: {
    promedio,
    totalMaterias: materias.length,
    mejorMateria,
    peorMateria
  },

  materias
});

    } catch (err) {

      next(err);

    }

  }
);

module.exports = router;
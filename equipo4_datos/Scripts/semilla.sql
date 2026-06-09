WITH nuevo_docente AS (
    INSERT INTO usuarios (
        nombre_completo,
        rol_id,
        activo,
        identificacion_docente,
        codigo_registro
    )
    VALUES (
        'Juan Carlos Pérez',
        2,
        false,
        'DOC-2026-001',
        UPPER(SUBSTRING(REPLACE(gen_random_uuid()::text, '-', '') FROM 1 FOR 8))
    )
    RETURNING id
),
grupo_encontrado AS (
    SELECT id
    FROM grupos
    WHERE grado = 5
      AND seccion = 'A'
),
materia_encontrada AS (
    SELECT id
    FROM materias
    WHERE nombre_materia = 'Matemáticas'
)
INSERT INTO asignaciones_docentes (
    docente_id,
    materia_id,
    grupo_id
)
SELECT
    nd.id,
    me.id,
    ge.id
FROM nuevo_docente nd
CROSS JOIN materia_encontrada me
CROSS JOIN grupo_encontrado ge;

WITH codigo_generado AS (
    SELECT
        'ALU-' || UPPER(SUBSTRING(REPLACE(gen_random_uuid()::text, '-', '') FROM 1 FOR 6))
        AS codigo
),
grupo_encontrado AS (
    SELECT id
    FROM grupos
    WHERE grado = 5
      AND seccion = 'A'
),
nuevo_padre AS (
    INSERT INTO usuarios (
        nombre_completo,
        rol_id,
        activo,
        codigo_registro
    )
    SELECT
        'María González',
        3,
        false,
        codigo
    FROM codigo_generado
    RETURNING id
),
nuevo_alumno AS (
    INSERT INTO alumnos (
        matricula,
        nombre_completo,
        grupo_id,
        fecha_nacimiento,
        codigo_registro
    )
    SELECT
        'A001',
        'Juan Pérez',
        ge.id,
        DATE '2015-03-15',
        cg.codigo
    FROM grupo_encontrado ge
    CROSS JOIN codigo_generado cg
    RETURNING id
)
INSERT INTO parentescos (
    padre_id,
    alumno_id
)
SELECT
    np.id,
    na.id
FROM nuevo_padre np
CROSS JOIN nuevo_alumno na;
-- ==============================================================================
-- 1. LIMPIEZA PREVIA DE DATOS (Opcional, útil para re-correr la semilla)
-- ==============================================================================
TRUNCATE TABLE public.soporte_archivos CASCADE;
TRUNCATE TABLE public.soporte_tickets CASCADE;
TRUNCATE TABLE public.mensajes CASCADE;
TRUNCATE TABLE public.conversaciones CASCADE;
TRUNCATE TABLE public.firmas_boletas CASCADE;
TRUNCATE TABLE public.calificaciones CASCADE;
TRUNCATE TABLE public.asignaciones_docentes CASCADE;
TRUNCATE TABLE public.parentescos CASCADE;
TRUNCATE TABLE public.boletas_publicadas CASCADE;
TRUNCATE TABLE public.alumnos CASCADE;
TRUNCATE TABLE public.usuarios CASCADE;
TRUNCATE TABLE public.periodos_evaluacion CASCADE;
TRUNCATE TABLE public.materias CASCADE;
TRUNCATE TABLE public.grupos CASCADE;
TRUNCATE TABLE public.palabras_prohibidas CASCADE;
TRUNCATE TABLE public.roles CASCADE;

-- Eliminar usuarios de prueba en auth.users si existen
DELETE FROM auth.users WHERE email IN ('admin@escuela.com', 'docente@escuela.com', 'padre@escuela.com');

-- ==============================================================================
-- 2. CATÁLOGOS BASE
-- ==============================================================================

-- Roles
INSERT INTO public.roles (id, nombre_rol) VALUES
(1, 'Administrador'),
(2, 'Docente'),
(3, 'Padre')
ON CONFLICT (nombre_rol) DO NOTHING;

-- Periodos de Evaluación
INSERT INTO public.periodos_evaluacion (id, nombre, mes_inicio, mes_fin) VALUES
('b1111111-1111-1111-1111-111111111111', 'Trimestre 1', 8, 11),
('b2222222-2222-2222-2222-222222222222', 'Trimestre 2', 12, 3),
('b3333333-3333-3333-3333-333333333333', 'Trimestre 3', 4, 7);

-- Grupos
INSERT INTO public.grupos (id, grado, seccion) VALUES
('g1111111-1111-1111-1111-111111111111', 1, 'A'),
('g2222222-2222-2222-2222-222222222222', 2, 'A'),
('g3333333-3333-3333-3333-333333333333', 3, 'A'),
('g4444444-4444-4444-4444-444444444444', 4, 'A'),
('g5555555-5555-5555-5555-555555555555', 5, 'A'),
('g6666666-6666-6666-6666-666666666666', 6, 'A');

-- Materias
INSERT INTO public.materias (id, nombre_materia, es_general) VALUES
('m1111111-1111-1111-1111-111111111111', 'Matemáticas', true),
('m2222222-2222-2222-2222-222222222222', 'Español', true),
('m3333333-3333-3333-3333-333333333333', 'Ciencias Naturales', true),
('m4444444-4444-4444-4444-444444444444', 'Historia', false);

-- ==============================================================================
-- 3. USUARIOS (Auth + Public)
-- ==============================================================================
-- Se utiliza PL/pgSQL para asegurar que la encriptación funcione correctamente.
-- Todas las contraseñas son: Password123!

DO $$
DECLARE
    admin_auth_id UUID := 'a1111111-1111-1111-1111-111111111111';
    docente_auth_id UUID := 'd2222222-2222-2222-2222-222222222222';
    padre_auth_id UUID := 'p3333333-3333-3333-3333-333333333333';
BEGIN
    -- Habilitar pgcrypto si no está habilitado (lo usa Supabase por defecto, pero por seguridad)
    CREATE EXTENSION IF NOT EXISTS pgcrypto;

    -- 3.1 Insertar en auth.users
    INSERT INTO auth.users (
        id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, 
        raw_app_meta_data, raw_user_meta_data, created_at, updated_at
    ) VALUES 
    (admin_auth_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'admin@escuela.com', crypt('Password123!', gen_salt('bf')), now(), '{"provider": "email", "providers": ["email"]}', '{}', now(), now()),
    (docente_auth_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'docente@escuela.com', crypt('Password123!', gen_salt('bf')), now(), '{"provider": "email", "providers": ["email"]}', '{}', now(), now()),
    (padre_auth_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'padre@escuela.com', crypt('Password123!', gen_salt('bf')), now(), '{"provider": "email", "providers": ["email"]}', '{}', now(), now());

    -- 3.2 Insertar en public.usuarios
    INSERT INTO public.usuarios (id, auth_user_id, email, nombre_completo, rol_id, activo, identificacion_docente, codigo_registro) VALUES
    ('u1111111-1111-1111-1111-111111111111', admin_auth_id, 'admin@escuela.com', 'Administrador Principal', 1, true, NULL, 'ADM-001'),
    ('u2222222-2222-2222-2222-222222222222', docente_auth_id, 'docente@escuela.com', 'Juan Carlos Pérez', 2, true, 'DOC-2026-001', 'DOC-001'),
    ('u3333333-3333-3333-3333-333333333333', padre_auth_id, 'padre@escuela.com', 'María González', 3, true, NULL, 'PAD-001');

END $$;

-- ==============================================================================
-- 4. ALUMNOS, ASIGNACIONES Y PARENTESCOS
-- ==============================================================================

-- Alumnos
INSERT INTO public.alumnos (id, matricula, nombre_completo, grupo_id, fecha_nacimiento, codigo_registro) VALUES
('a1111111-1111-1111-1111-111111111111', 'A001', 'Juan Pérez González', 'g5555555-5555-5555-5555-555555555555', '2015-03-15', 'ALU-001'),
('a2222222-2222-2222-2222-222222222222', 'A002', 'Sofía Martínez', 'g5555555-5555-5555-5555-555555555555', '2015-06-20', 'ALU-002');

-- Parentescos (Padre -> Alumnos)
INSERT INTO public.parentescos (padre_id, alumno_id) VALUES
('u3333333-3333-3333-3333-333333333333', 'a1111111-1111-1111-1111-111111111111');

-- Asignaciones Docentes (Docente -> Matemáticas -> 5A)
INSERT INTO public.asignaciones_docentes (docente_id, materia_id, grupo_id) VALUES
('u2222222-2222-2222-2222-222222222222', 'm1111111-1111-1111-1111-111111111111', 'g5555555-5555-5555-5555-555555555555'),
('u2222222-2222-2222-2222-222222222222', 'm2222222-2222-2222-2222-222222222222', 'g5555555-5555-5555-5555-555555555555');

-- Calificaciones de ejemplo
INSERT INTO public.calificaciones (alumno_id, materia_id, nota, comentario, periodo_id, tarea, evaluado_por) VALUES
('a1111111-1111-1111-1111-111111111111', 'm1111111-1111-1111-1111-111111111111', 9.5, 'Excelente desempeño', 'b1111111-1111-1111-1111-111111111111', 'Examen Parcial', 'u2222222-2222-2222-2222-222222222222');
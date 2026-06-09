CREATE TABLE public.roles (
  id integer NOT NULL DEFAULT nextval('roles_id_seq'::regclass),
  nombre_rol character varying NOT NULL UNIQUE,
  CONSTRAINT roles_pkey PRIMARY KEY (id)
);
CREATE TABLE public.usuarios (
  id uuid NOT NULL DEFAULT gen_random_uuid() UNIQUE,
  email character varying UNIQUE,
  nombre_completo character varying NOT NULL,
  rol_id integer,
  activo boolean DEFAULT false,
  creado_en timestamp without time zone DEFAULT now(),
  invitado_en timestamp without time zone DEFAULT now(),
  activado_en timestamp without time zone,
  auth_user_id uuid UNIQUE,
  identificacion_docente character varying UNIQUE,
  codigo_registro character varying,
  CONSTRAINT usuarios_pkey PRIMARY KEY (id),
  CONSTRAINT usuarios_rol_id_fkey FOREIGN KEY (rol_id) REFERENCES public.roles(id),
  CONSTRAINT usuarios_auth_user_id_fkey FOREIGN KEY (auth_user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.grupos (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  grado integer NOT NULL CHECK (grado >= 1 AND grado <= 6),
  seccion character varying NOT NULL,
  CONSTRAINT grupos_pkey PRIMARY KEY (id)
);
CREATE TABLE public.materias (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  nombre_materia character varying NOT NULL,
  es_general boolean DEFAULT false,
  CONSTRAINT materias_pkey PRIMARY KEY (id)
);
CREATE TABLE public.alumnos (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  matricula character varying NOT NULL UNIQUE,
  nombre_completo character varying NOT NULL,
  grupo_id uuid,
  fecha_nacimiento date NOT NULL,
  codigo_registro character varying,
  CONSTRAINT alumnos_pkey PRIMARY KEY (id),
  CONSTRAINT alumnos_grupo_id_fkey FOREIGN KEY (grupo_id) REFERENCES public.grupos(id)
);
CREATE TABLE public.parentescos (
  padre_id uuid NOT NULL,
  alumno_id uuid NOT NULL,
  CONSTRAINT parentescos_pkey PRIMARY KEY (padre_id, alumno_id),
  CONSTRAINT parentescos_alumno_id_fkey FOREIGN KEY (alumno_id) REFERENCES public.alumnos(id),
  CONSTRAINT parentescos_padre_id_fkey FOREIGN KEY (padre_id) REFERENCES public.usuarios(id)
);
CREATE TABLE public.asignaciones_docentes (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  docente_id uuid NOT NULL,
  materia_id uuid NOT NULL,
  grupo_id uuid NOT NULL,
  CONSTRAINT asignaciones_docentes_pkey PRIMARY KEY (id),
  CONSTRAINT asignaciones_docentes_materia_id_fkey FOREIGN KEY (materia_id) REFERENCES public.materias(id),
  CONSTRAINT asignaciones_docentes_grupo_id_fkey FOREIGN KEY (grupo_id) REFERENCES public.grupos(id),
  CONSTRAINT asignaciones_docentes_docente_id_fkey FOREIGN KEY (docente_id) REFERENCES public.usuarios(id)
);
CREATE TABLE public.calificaciones (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  alumno_id uuid,
  materia_id uuid,
  nota numeric CHECK (nota >= 0::numeric AND nota <= 10::numeric),
  comentario text,
  periodo_id uuid,
  tarea character varying,
  CONSTRAINT calificaciones_pkey PRIMARY KEY (id),
  CONSTRAINT calificaciones_alumno_id_fkey FOREIGN KEY (alumno_id) REFERENCES public.alumnos(id),
  CONSTRAINT calificaciones_materia_id_fkey FOREIGN KEY (materia_id) REFERENCES public.materias(id),
  CONSTRAINT calificaciones_periodo_id_fkey FOREIGN KEY (periodo_id) REFERENCES public.periodos_evaluacion(id)
);
CREATE TABLE public.firmas_boletas (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  alumno_id uuid,
  padre_id uuid,
  firmado_en timestamp without time zone DEFAULT now(),
  periodo_id uuid NOT NULL,
  CONSTRAINT firmas_boletas_pkey PRIMARY KEY (id),
  CONSTRAINT firmas_boletas_alumno_id_fkey FOREIGN KEY (alumno_id) REFERENCES public.alumnos(id),
  CONSTRAINT firmas_boletas_padre_id_fkey FOREIGN KEY (padre_id) REFERENCES public.usuarios(id),
  CONSTRAINT firmas_boletas_periodo_id_fkey FOREIGN KEY (periodo_id) REFERENCES public.periodos_evaluacion(id)
);
CREATE TABLE public.conversaciones (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  alumno_id uuid,
  padre_id uuid,
  docente_id uuid,
  creado_en timestamp without time zone DEFAULT now(),
  CONSTRAINT conversaciones_pkey PRIMARY KEY (id),
  CONSTRAINT conversaciones_alumno_id_fkey FOREIGN KEY (alumno_id) REFERENCES public.alumnos(id),
  CONSTRAINT conversaciones_padre_id_fkey FOREIGN KEY (padre_id) REFERENCES public.usuarios(id),
  CONSTRAINT conversaciones_docente_id_fkey FOREIGN KEY (docente_id) REFERENCES public.usuarios(id)
);
CREATE TABLE public.mensajes (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  conversacion_id uuid,
  remitente_id uuid,
  contenido text NOT NULL,
  estado character varying DEFAULT 'enviado'::character varying CHECK (estado::text = ANY (ARRAY['enviado'::character varying, 'bloqueado'::character varying, 'leido'::character varying]::text[])),
  creado_en timestamp without time zone DEFAULT now(),
  CONSTRAINT mensajes_pkey PRIMARY KEY (id),
  CONSTRAINT mensajes_conversacion_id_fkey FOREIGN KEY (conversacion_id) REFERENCES public.conversaciones(id),
  CONSTRAINT mensajes_remitente_id_fkey FOREIGN KEY (remitente_id) REFERENCES public.usuarios(id)
);
CREATE TABLE public.palabras_prohibidas (
  id integer NOT NULL DEFAULT nextval('palabras_prohibidas_id_seq'::regclass),
  palabra character varying NOT NULL UNIQUE,
  CONSTRAINT palabras_prohibidas_pkey PRIMARY KEY (id)
);
CREATE TABLE public.soporte_tickets (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  ticket_codigo text NOT NULL UNIQUE,
  matricula text,
  estudiante_nombre text,
  fecha_nacimiento text,
  codigo_registro text,
  asunto text NOT NULL,
  descripcion text NOT NULL,
  estado text DEFAULT 'Pendiente'::text CHECK (estado = ANY (ARRAY['Pendiente'::text, 'En proceso'::text, 'Resuelto'::text])),
  creado_por uuid,
  creado_en timestamp without time zone DEFAULT now(),
  role integer NOT NULL,
  CONSTRAINT soporte_tickets_pkey PRIMARY KEY (id),
  CONSTRAINT soporte_tickets_creado_por_fkey FOREIGN KEY (creado_por) REFERENCES public.usuarios(id),
  CONSTRAINT soporte_tickets_role_fkey FOREIGN KEY (role) REFERENCES public.roles(id)
);
CREATE TABLE public.soporte_archivos (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  ticket_id uuid,
  archivo_url text NOT NULL,
  creado_en timestamp without time zone DEFAULT now(),
  CONSTRAINT soporte_archivos_pkey PRIMARY KEY (id),
  CONSTRAINT soporte_archivos_ticket_id_fkey FOREIGN KEY (ticket_id) REFERENCES public.soporte_tickets(id)
);
CREATE TABLE public.periodos_evaluacion (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  nombre character varying NOT NULL,
  mes_inicio integer NOT NULL CHECK (mes_inicio >= 1 AND mes_inicio <= 12),
  mes_fin integer NOT NULL CHECK (mes_fin >= 1 AND mes_fin <= 12),
  CONSTRAINT periodos_evaluacion_pkey PRIMARY KEY (id)
);
CREATE TABLE public.boletas_publicadas (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  periodo_id uuid NOT NULL,
  publicada boolean DEFAULT false,
  publicada_por uuid,
  publicada_en timestamp without time zone DEFAULT now(),
  CONSTRAINT boletas_publicadas_pkey PRIMARY KEY (id),
  CONSTRAINT boletas_publicadas_periodo_id_fkey FOREIGN KEY (periodo_id) REFERENCES public.periodos_evaluacion(id),
  CONSTRAINT boletas_publicadas_publicada_por_fkey FOREIGN KEY (publicada_por) REFERENCES public.usuarios(id)
);
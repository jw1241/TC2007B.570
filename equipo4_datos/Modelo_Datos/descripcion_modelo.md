# Descripción del Modelo de Datos

## Motor de Base de Datos

El sistema utiliza PostgreSQL administrado mediante Supabase.

## Justificación

Se eligió una base de datos relacional debido a que el sistema requiere:

- Integridad referencial.
- Relaciones entre alumnos, padres y docentes.
- Manejo de calificaciones.
- Control de periodos de evaluación.
- Registro de firmas de boletas.
- Sistema de mensajería.

Las restricciones y llaves foráneas garantizan la consistencia de los datos académicos.

## Entidades Principales

### usuarios

Almacena administradores, docentes y padres.

### alumnos

Información académica y personal de los estudiantes.

### grupos

Representa grado y sección.

### materias

Catálogo de materias.

### asignaciones_docentes

Relaciona docentes con materias y grupos.

### calificaciones

Registra las notas de los estudiantes por materia y periodo.

### conversaciones y mensajes

Implementan la comunicación entre padres y docentes.

### soporte_tickets

Permite registrar solicitudes de soporte.
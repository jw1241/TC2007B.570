# README_datos

## Sistema gestor utilizado

PostgreSQL 15 administrado mediante Supabase. El sistema utiliza UUID como identificador principal y mantiene integridad referencial mediante llaves foráneas y protege los datos con Row Level Security (RLS).

## Requisitos

* Cuenta de Supabase
* Proyecto Supabase creado
* Acceso al SQL Editor
* (Opcional) CLI de Supabase para desarrollo local

## Instalación en Supabase

1. Crear un nuevo proyecto en Supabase.
2. Abrir SQL Editor.
3. Ejecutar el archivo `Scripts/estructura_inicial.sql`. Este script creará todas las tablas, asignará restricciones de integridad referencial, establecerá el campo de auditoría y activará RLS (Row Level Security).
4. Verificar que todas las 16 tablas fueron creadas correctamente en la vista de *Table Editor*.

## Variables de Entorno (.env)

Para que el frontend/backend pueda conectarse correctamente a esta base de datos, en la raíz de su proyecto deberán crear un archivo `.env` o definir las siguientes variables de entorno:

```env
SUPABASE_URL=https://[TU_PROYECTO].supabase.co
SUPABASE_ANON_KEY=ey...[TU_ANON_KEY_PUBLICA]
```
> **Nota:** Al estar RLS activo, la llave anónima es segura para estar expuesta en el Frontend. El backend podría usar `SUPABASE_SERVICE_ROLE_KEY` si requiere acceso administrativo para bypassear RLS.

## Cargar datos de ejemplo (Semilla)

1. En el mismo SQL Editor de Supabase.
2. Ejecutar `Scripts/semilla.sql`.
Este script insertará automáticamente catálogos (Roles, Materias, Grupos) y usuarios de prueba. Además, **encriptará automáticamente** las contraseñas e insertará los usuarios en el esquema seguro nativo `auth.users` de Supabase para que el login funcione desde el primer instante.

## Credenciales de ejemplo para probar

Todas las cuentas generadas por la semilla comparten la misma contraseña:
**Contraseña única:** `Password123!`

* **Administrador Principal:**
  * Email: `admin@escuela.com`
* **Docente:**
  * Email: `docente@escuela.com`
* **Padre de Familia:**
  * Email: `padre@escuela.com`

## Reiniciar la base de datos

El script `estructura_inicial.sql` ha sido diseñado de forma idempotente. Si deseas borrar todo y empezar de cero en un entorno limpio, simplemente vuelve a ejecutar los scripts en el siguiente orden:

1. `Scripts/estructura_inicial.sql` (Este ejecutará los `DROP TABLE IF EXISTS ... CASCADE` en el orden correcto eliminando las tablas y datos viejos).
2. `Scripts/semilla.sql` (Este limpiará la tabla `auth.users` de los usuarios antiguos e insertará la semilla de cero).

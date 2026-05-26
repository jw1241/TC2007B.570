# Desarrollo Integral del Backend (Fase 2)

Con la arquitectura y conexión a Supabase ya cimentadas, el objetivo de esta fase es completar el resto de los módulos del backend descritos en el `contexto_proyecto.md`. Esto asegurará que el Backend quede prácticamente completo en cuanto a lógica de negocio antes de tocar la base de datos o el frontend profundo.

## User Review Required
Revisa la propuesta de endpoints a continuación. El flujo más crítico es el **Registro de Padres**, donde validamos un "secreto compartido" (Matrícula + Fecha de Nacimiento) para ligar la cuenta del padre con el alumno. ¿Estás de acuerdo con el uso de `pdfkit` para la generación de boletas en el backend?

## Proposed Changes

### 1. Módulo de Autenticación Especial (`Back_end/routes/authRoutes.js`)
- `POST /api/auth/registro-padres`: 
  1. Recibe email, password, matrícula y fecha de nacimiento.
  2. Busca al alumno en la BD usando la matrícula y fecha. Si no coincide, rechaza con `400`.
  3. Si coincide, usa el `supabaseAdmin` para crear la cuenta del Padre en Auth.
  4. Inserta al Padre en la tabla `usuarios` y finalmente crea la relación en la tabla `parentescos`.

### 2. Módulo de Docentes (`Back_end/routes/docenteRoutes.js`)
Estarán protegidas y requerirán que el `rol_id` del token corresponda a "Docente".
- `GET /api/docentes/grupos`: Consulta la tabla `asignaciones_docentes` filtrando estrictamente por el `req.user.id` para que el maestro solo vea sus materias.
- `PUT /api/docentes/calificaciones`: Recibe un arreglo de calificaciones y las actualiza/inserta en la tabla `calificaciones`.

### 3. Módulo de Padres (`Back_end/routes/padreRoutes.js`)
Estarán protegidas y requerirán que el `rol_id` corresponda a "Padre".
- `GET /api/padres/hijos`: Obtiene los perfiles de los hijos consultando la tabla `parentescos`.
- `GET /api/padres/calificaciones/:alumno_id`: Obtiene el registro trimestral del alumno.
- `POST /api/padres/firmar/:boleta_id`: Actualiza el estatus a "Firmado de Recibido" (timestamp y marca booleana).

### 4. Generación de PDFs al Vuelo (`Back_end/routes/boletasRoutes.js`)
- `GET /api/boletas/descargar/:alumno_id`: 
  1. Utilizará el paquete `pdfkit` (nuevo a instalar).
  2. Extraerá las calificaciones del alumno.
  3. Construirá un documento PDF en memoria y lo devolverá directamente como un archivo descargable (`Content-Type: application/pdf`).

### Actualización de `index.js`
Se importarán los 4 nuevos archivos de rutas y se aplicará el middleware de seguridad correspondiente a cada uno.

## Verification Plan
1. Levantaremos el servidor de Node.js.
2. Usaremos Swagger o Postman para validar la estructura de las rutas.
3. Simularemos el endpoint de registro de padres mandando una matrícula inválida para ver cómo reacciona y protege la información.

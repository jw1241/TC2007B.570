# Documentación Completa del Proyecto: Escuela Metropolitana "La Luz"

Este documento contiene un análisis profundo y estructurado del estado actual del proyecto. Se detalla el funcionamiento de las rutas, la lógica de negocio, el manejo del estado y la estructura de archivos, dividiéndose en la arquitectura del Backend y Frontend.

---

## 1. Arquitectura del Backend (`Back_end`)

### Resumen y Arquitectura
El backend es una API REST construida en **Node.js** con **Express.js** (v5.x). Depende fuertemente de **Supabase** para su base de datos (PostgreSQL), sistema de autenticación y almacenamiento de archivos. El backend actúa como la capa de orquestación principal que impone reglas de negocio, control de acceso basado en roles (RBAC) y validaciones, a menudo utilizando la *Service Role Key* de Supabase para evadir las políticas directas de seguridad a nivel de fila (RLS) en favor de una autorización manejada por la lógica del código.

**Dependencias principales:** `express`, `@supabase/supabase-js`, `joi` (validaciones de entrada), `pdfkit` (generación de PDFs), `multer` (subida de archivos), `cors`, `helmet`, `express-rate-limit`.

### Estructura de Carpetas
- `/config/`: Configuración del cliente Supabase. Exporta los clientes `supabase` (Anon key) y `supabaseAdmin` (Service Role Key), además de una función `createAuthClient`.
- `/constants/`: Constantes globales, notablemente `roles.js` (`ADMIN: 1, DOCENTE: 2, PADRE: 3`).
- `/middleware/`: Middlewares de Express: `authMiddleware.js` (validación de tokens JWT), `roleMiddleware.js` (RBAC) y `errorHandler.js`.
- `/routes/`: Contiene todas las definiciones de endpoints. Como no hay una carpeta separada para controladores, estos archivos de rutas actúan como controladores e incluyen lógica de negocio, esquemas Joi y consultas a la base de datos de Supabase.
- `index.js`: Punto de entrada principal. Inicializa Express, configura seguridad (Helmet, CORS, Rate Limit), registra todas las rutas y maneja errores globales.

### Endpoints y Rutas
La API está segmentada mediante routers específicos según los roles:

#### Autenticación y Registro (`/api/auth`)
- `POST /login`: Autentica vía Supabase Auth y obtiene el perfil/rol.
- `POST /reset-password`, `POST /update-password`: Flujo de recuperación de contraseña en Supabase.
- `POST /validate-student`, `POST /validate-docente`, `POST /validate-admin`: Endpoints de pre-onboarding que validan el `codigo_registro` con los registros existentes.
- `POST /activate-account`: Paso final de registro; crea la identidad en Supabase Auth y vincula el perfil (creando parentescos si es necesario).

#### Administrador (`/api/admin`) - *Requiere Rol 1*
- `GET /usuarios`: Retorna una lista paginada de todos los usuarios del sistema.
- `POST /usuarios`: Permite a los administradores registrar nuevos Docentes o Padres, generando una contraseña temporal y creando los enlaces académicos (p.ej., asignación de materias o relaciones padre-hijo).

#### Docente (`/api/docente`) - *Requiere Rol 2*
- `GET /mis-clases`: Recupera las materias y grupos asignados al profesor.
- `GET /clase/:grupo_id/materia/:materia_id/alumnos`: Lista los alumnos y sus calificaciones para la clase elegida (valida previamente que el docente esté asignado a dicha clase).
- `PUT /calificaciones`: Aplica un *Upsert* (Insertar o Actualizar) a la calificación trimestral de un estudiante.

#### Padre / Alumno (`/api/padre`) - *Requiere Rol 3*
- `GET /mis-hijos`: Lista los alumnos directamente enlazados al padre autenticado.
- `GET /hijo/:alumno_id/calificaciones`: Obtiene el historial de calificaciones del hijo (restringe el acceso si no hay un parentesco registrado).
- `POST /hijo/:alumno_id/firmar-acuse`: Firma digitalmente la boleta creando un registro de auditoría en la tabla `firmas_boletas`.

#### Generación de Boletas (`/api/boletas`)
- `GET /:alumno_id/descargar-pdf`: Genera dinámicamente el PDF de la boleta mediante `pdfkit`.

#### Mensajería (`/api/mensajes`)
- `GET /contactos`: Resuelve de forma dinámica los contactos disponibles. (Los padres ven a los docentes de sus hijos; los docentes ven a los padres de sus alumnos).
- `GET /chat/:destinatario_id`: Carga el historial del chat y marca los mensajes como leídos. Autocrea una `conversacion` si es el primer mensaje.
- `POST /enviar`: Inserta un mensaje en el hilo del chat existente.

#### Soporte Técnico (`/api/soporte`)
- `POST /soporte-ticket`: Recibe peticiones multi-parte (con `multer`), sube las capturas al bucket de Supabase y guarda el ticket con URLs públicas.

### Esquema de Base de Datos (Supabase PostgreSQL)
- **`usuarios`**: Perfiles principales del sistema.
- **`alumnos`**: Información directa del estudiante.
- **`parentescos`**: Tabla pivote vinculando `padre_id` (de `usuarios`) con `alumno_id`.
- **`grupos`** y **`materias`**: Catálogos base de la escuela.
- **`asignaciones_docentes`**: Vincula `docente_id` con su `grupo_id` y `materia_id`.
- **`calificaciones`**: Registros individuales con un Constraint único en `(alumno_id, materia_id, trimestre)`.
- **`firmas_boletas`**: Historial de acuses de recibo firmados por los padres.
- **`conversaciones`** y **`mensajes`**: Plataforma interna de comunicación.
- **`soporte_tickets`** y **`soporte_archivos`**: Tracking de helpdesk y adjuntos.

---

## 2. Arquitectura del Frontend (`Front_end`)

### Resumen
La interfaz cliente es una aplicación web y móvil moderna (Mobile-First) construida con **Angular 20** (empleando *Standalone Components*) e **Ionic 8**. Su infraestructura está lista para un despliegue nativo usando **Capacitor**, y hace llamadas constantes a **Supabase** (para la autenticación y queries directos a la base de datos) así como a la API de Node.js local.

### Estructura de Carpetas Principal
```text
Front_end/
├── src/
│   ├── app/
│   │   ├── pages/         # Vistas UI (lazy-loaded routes)
│   │   ├── services/      # Lógica global, Guards, consumo de API y manejo de estado local
│   │   ├── app.routes.ts  # Definiciones de enrutamiento
│   │   └── app.component.*# Componente raíz
│   ├── environments/      # Variables de entorno 
```

### Rutas y Roles (RBAC)
Las rutas se configuran de manera centralizada en `app.routes.ts` aprovechando el "lazy loading" (`loadComponent()`). La seguridad se aplica mediante `authGuard` y `roleGuard`.

El flujo se divide por `rol_id`:
- **Rutas Públicas / Auth:** `iniciar-sesion`, `registro`, `recuperar-contrasena`, `soporte-tecnico`, `auth/callback`.
- **Administrador (Rol 1):** `inicio-resumen-administrador`, `panel-administracion`.
- **Profesor (Rol 2):** `inicio-resumen-profesor`, `captura-calificaciones`.
- **Padre/Alumno (Rol 3):** `seleccionar-alumno`, `inicio-resumen-alumno`.
- **Rutas Compartidas Autenticadas:** `mensajes`, `mensajes-chat`, `perfil`.

### Manejo del Estado (State Management)
En lugar de emplear librerías complejas como NgRx, el proyecto adopta estrategias pragmáticas incorporadas:
1. **Estado de Autenticación:** Se delega nativamente al cliente oficial `@supabase/supabase-js`.
2. **Estado de Componentes:** Uso estricto de enlace de datos bidireccional (`[(ngModel)]`) mediante `FormsModule`.
3. **Estado Global / Persistencia entre Rutas (`StudentService`):** Mediante servicios custom (e.g. `student.ts`), la data crítica como el alumno seleccionado o códigos de registro, se guardan y serializan en `localStorage` (como `alumno:v1`) permitiendo recargas y transiciones de páginas sin perder contexto.

### Lógica Central (Servicios)
Toda la orquestación reside en `src/app/services/`:
- **`supabase.ts`**: Instanciación base del cliente Supabase.
- **`auth.service.ts`**: Administra el `login` y `logout`. Intercepta la sesión, verifica en base de datos qué rol tiene el usuario e instruye el redireccionamiento correspondiente al dashboard correcto.
- **`api.ts`**: Un wrapper alrededor de la función `fetch` nativa, que se encarga de inyectar dinámicamente el token JWT (Bearer) en los Headers hacia las peticiones de nuestro Backend local en el puerto 3000.
- **`role.guard.ts` y `auth.guard.ts`**: Las barreras lógicas en Angular que impiden la inyección a rutas que no pertenezcan al rol actual o si el usuario no tiene una sesión activa.

### Componentes Actuales y Lógica UI
Construidos puramente como *Standalone Components* (sin `NgModules`) en Angular, importan directamente las directivas de Ionic (como `IonContent`).
- **`iniciar-sesion.page.ts`**: Implementa el Toggle de "Recordarme", maneja el log-in con Supabase y rutea en cascada.
- **`seleccionar-alumno.page.ts`**: Demuestra un patrón híbrido donde el Front-End consulta **directamente a Supabase** (sin pasar por el Backend de Node) para extraer los registros de la tabla `parentescos`, almacena en el `StudentService` la decisión del padre, y enruta.
- **Páginas Scaffoldeadas**: Componentes como `panel-administracion` o `captura-calificaciones` ya poseen las bases gráficas nativas con maquetado en HTML/SCSS utilizando Ionic, y están esperando la conexión e implementación de la lógica interna.

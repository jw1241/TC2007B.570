# Estado Actual del Proyecto: Sistema de Boletas Escolares

## 1. Contexto General del Proyecto
El proyecto consiste en una plataforma web responsiva (Ionic + Angular) diseñada para la gestión, captura y consulta de boletas de calificaciones de la Escuela Metropolitana "La Luz".
Su arquitectura técnica está conformada por:
*   **Backend & Base de Datos**: Node.js/Express, conectado a Supabase (PostgreSQL) con políticas de seguridad RLS (Row Level Security).
*   **Frontend**: Angular (v17+) + Ionic Framework para crear una interfaz accesible, adaptada tanto para docentes (incluidos adultos mayores) como para padres de familia y administradores.

El sistema maneja 3 roles fundamentales, cada uno con flujos separados:
1.  **Administrador (Director / TI):** Gestión global de usuarios, grupos y descarga masiva de PDFs.
2.  **Docente:** Captura de calificaciones y gestión de las materias que tiene asignadas. Comunicación con padres.
3.  **Padre de Familia:** Visualización, descarga (PDF al vuelo) y firma de acuse de las boletas de sus hijos.

---

## 2. Estado de Desarrollo del Backend (`/Back_end`)
El servidor de backend en Node.js (Express) ya cuenta con la base estructural, medidas de seguridad iniciales para entorno de producción, y la **Fase 2 (Lógica de Negocio)** ha sido completada en su mayor parte.

**✅ Completado:**
*   **Configuración y Seguridad Base:** Implementación de CORS restringido, `helmet` para cabeceras de seguridad, `express-rate-limit` contra fuerza bruta y límite de tamaño de payloads en `index.js`.
*   **Manejo de Errores y Middlewares:** Se cuenta con `errorHandler.js`, `authMiddleware.js` y `roleMiddleware.js` (RBAC).
*   **Rutas Base Existentes (`/api/auth`, `/api/admin`, `/api/items`):** Implementado el Login, flujo de recuperación de contraseñas, CRUD de administradores y un CRUD genérico.
*   **Documentación:** Integración funcional con Swagger (`/api-docs`).
*   **Registro de Padres y Docentes (`registration.routes.js`):** Endpoints (`/validate-student`, `/validate-docente`, `/activate-account`) creados y funcionales. Realizan validaciones con códigos de registro e interactúan con `supabaseAdmin` para crear las cuentas y relaciones en la tabla `parentescos`.
*   **Módulos de Lógica de Negocio:**
    *   `docenteRoutes.js`: Consulta de grupos asignados y alumnos.
    *   `padreRoutes.js`: Rutas establecidas.
    *   `boletasRoutes.js`: Implementación de la librería `pdfkit` para la generación de PDFs de boletas "al vuelo" a través del endpoint `/:alumno_id/descargar-pdf`.
    *   `calificacionesRoutes.js`, `mensajesRoutes.js`, `sorporteRoutes.js`: Endpoints listos.

**⏳ Pendiente:**
*   Ajustes menores, corrección de bugs y conexión completa con el Frontend en todos los nuevos endpoints.

---

## 3. Estado de Desarrollo del Frontend (`/Front_end`)
El frontend ya tiene una estructura sólida de proyecto en **Angular + Ionic**. Se han andamiado la mayoría de las páginas/vistas requeridas, y se ha avanzado en la configuración de la seguridad de las rutas.

*(Nota: La carpeta duplicada `/Front_end_1` fue eliminada y consolidada en `/Front_end`.)*

**✅ Completado:**
*   **Estructura Base:** Configuración completa de Ionic/Angular, TypeScript, y variables de entorno (`capacitor.config.ts`, `ionic.config.json`).
*   **Enrutamiento (`app.routes.ts`):** Archivo de rutas principal configurado para orquestar la navegación.
*   **Protección de Rutas (Guards):** Las rutas de Angular están protegidas validando la sesión con `auth.guard.ts` y verificando el rol con `role.guard.ts`.
*   **Páginas (Componentes de UI):** Se han generado de manera exitosa los andamiajes para los distintos flujos y roles (Login, Admin, Docentes, Padres, Mensajes, Perfil, etc.).
*   **Servicios:** Se cuenta con servicios base de conexión como `auth.service.ts`, `student.ts`, `supabase.ts` y la integración con la API (`api.ts`).
*   **Interceptores:** Carpeta `interceptors` creada (para inyectar el JWT en las peticiones al backend de forma automática).

**⏳ Pendiente:**
*   **Integración y Lógica de Vistas:** Las páginas creadas (ej. `captura-calificaciones.page.ts`) en su mayoría son andamiajes vacíos que necesitan la implementación de la UI final y el enlace (binding) con los métodos de los servicios.
*   **Generador de PDF Frontend:** Consumir correctamente el endpoint del backend (`boletasRoutes.js`) que regresa el PDF como `application/pdf` para su descarga o visualización en la app.
*   **Manejo Limpio de RLS (Errores 403):** Capturar los estados de error provenientes del backend de manera amigable (pantallas de "Acceso Denegado" o notificaciones en UI).

## Próximos Pasos Recomendados
1.  **En Frontend:** Completar la UI principal en las páginas, implementar la llamada a los endpoints del backend en los componentes (especialmente captura de calificaciones y flujos de padre/alumno), y enlazar las peticiones usando los servicios (`api.ts`, `auth.service.ts`) y los interceptores.
2.  **En Backend:** Pruebas exhaustivas (End-to-End) de la integración del Frontend con las rutas de lógica de negocio recién creadas.

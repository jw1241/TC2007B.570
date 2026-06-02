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
El servidor de backend en Node.js (Express) ya cuenta con la base estructural y medidas de seguridad iniciales para entorno de producción, pero **la lógica de negocio aún está incompleta** frente al plan de implementación (`implementation_plan.md`).

**✅ Completado:**
*   **Configuración y Seguridad Base:** Implementación de CORS restringido, `helmet` para cabeceras de seguridad, `express-rate-limit` contra fuerza bruta y límite de tamaño de payloads en `index.js`.
*   **Manejo de Errores y Middlewares:** Se cuenta con `errorHandler.js` y `authMiddleware.js` (incluyendo validación de roles como `requireAdmin`).
*   **Rutas Base Existentes:**
    *   `/api/auth`: Implementado el Login, y el flujo de recuperación de contraseñas (`/reset-password` y `/update-password`).
    *   `/api/admin`: Archivo de rutas estructurado para uso de administradores (`adminRoutes.js`).
    *   `/api/items`: CRUD genérico/prueba.
*   **Documentación:** Integración funcional con Swagger (`/api-docs`).

**⏳ Pendiente (Fase 2 de Backend):**
*   **Registro de Padres (`POST /api/auth/registro-padres`):** Falta crear el endpoint especializado que valide la "Matrícula + Fecha de Nacimiento" e interactúe con `supabaseAdmin` para crear la relación en la tabla `parentescos`.
*   **Módulos Faltantes:** No se han creado los archivos de rutas para:
    *   `docenteRoutes.js`: Para consulta de grupos asignados y actualización de calificaciones.
    *   `padreRoutes.js`: Para listar hijos asignados, ver historial trimestral y enviar firma electrónica.
    *   `boletasRoutes.js`: Implementación de la librería `pdfkit` para la generación de PDFs de boletas "al vuelo".

---

## 3. Estado de Desarrollo del Frontend (`/Front_end`)
El frontend ya tiene una estructura sólida de proyecto en **Angular + Ionic**. Se han andamiado la mayoría de las páginas/vistas requeridas, preparadas para conectar con el backend.

*(Nota: La carpeta duplicada `/Front_end_1` fue eliminada y consolidada en `/Front_end`.)*

**✅ Completado:**
*   **Estructura Base:** Configuración completa de Ionic/Angular, TypeScript, y variables de entorno (`capacitor.config.ts`, `ionic.config.json`).
*   **Enrutamiento (`app.routes.ts`):** Archivo de rutas principal configurado para orquestar la navegación.
*   **Páginas (Componentes de UI):** Se han generado de manera exitosa los andamiajes para los distintos flujos y roles:
    *   **Autenticación/Acceso:** `iniciar-sesion`, `registro`, `registro2`, `recuperar-contrasena`, `enviar-codigo`.
    *   **Administrador:** `panel-administracion`, `soporte-tecnico`.
    *   **Docentes/Padres:** `inicio-resumen`, `inicio-resumen-alumno`, `boleta`, `captura-calificaciones`, `mensajes`, `mensajes-chat`, `seleccionar-alumno`, `perfil`.
*   **Servicios:** Se cuenta con los primeros servicios base de conexión:
    *   `auth.service.ts`: Para la comunicación con los endpoints de autenticación.
    *   `student.ts`: Lógica/Modelos iniciales de estudiantes.
*   **Interceptores:** Carpeta `interceptors` creada (presumiblemente para inyectar el JWT en las peticiones al backend de forma automática).

**⏳ Pendiente:**
*   **Integración y Lógica de Vistas:** Las páginas recién creadas necesitan la implementación de la UI final y el enlace (binding) con los métodos de los servicios.
*   **Protección de Rutas (Guards):** Asegurar que las rutas de Angular estén protegidas validando la sesión de Supabase Auth y el `rol_id` respectivo, tal como dicta el contexto del proyecto.
*   **Generador de PDF Frontend:** Si no se delega todo a `pdfkit` en el backend, faltaría implementar la captura/descarga desde el front o, de preferencia, consumir correctamente el nuevo endpoint del backend que regresará el PDF como `application/pdf`.
*   **Manejo Limpio de RLS (Errores 403):** Capturar los estados de error provenientes del backend de manera amigable (pantallas de "Acceso Denegado").

## Próximos Pasos Recomendados
1.  **En Backend:** Crear `authRoutes.js` (la parte de registro de padres con validación de secreto), `docenteRoutes.js`, `padreRoutes.js` y `boletasRoutes.js`.
2.  **En Frontend:** Proteger las rutas con Guards (`canActivate`), completar la UI principal y enlazar las peticiones usando `auth.service.ts` y los interceptores.

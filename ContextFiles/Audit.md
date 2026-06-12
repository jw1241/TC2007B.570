# Reporte de Auditoría Técnica y Arquitectura - "La Luz"
**Fecha:** 11 de Junio, 2026
**Analista:** Senior Software Engineer (Gemini)
**Objetivo:** Auditoría de código, detección de redundancias (Technical Debt), arquitectura MVC, escalabilidad y limpieza general del repositorio.

---

## > [!NOTE]
## Resumen Ejecutivo
El proyecto presenta una estructura funcional que cumple con los requerimientos básicos del Módulo 3, operando bajo un stack moderno (Angular/Ionic + Node.js/Express + Supabase). Sin embargo, bajo los estándares de ingeniería de software a nivel Senior, **el proyecto acumula una considerable Deuda Técnica (Technical Debt)**. 

Se observa una violación sistemática del patrón de diseño MVC en el Backend, duplicación de vistas en el Frontend, y una severa falta de "higiene" en el control de archivos de prueba (archivos basura). Este reporte expone dichos fallos críticos para facilitar un *handover* (entrega) limpio a futuros desarrolladores.

---

## > [!WARNING]
## 1. Back-end: Violación del Patrón MVC y Rutas Infladas

El fallo arquitectónico más grave en el backend es la mezcla de la lógica de negocios y consultas de base de datos directamente en los archivos de rutas (`Routes`), en lugar de utilizar el directorio `controllers/` de forma consistente.

- **Rutas Obesas (Fat Routes):** Archivos como `adminUsuario.js` (16 KB), `padreRoutes.js` (13 KB), y `profeRoutes.js` (14 KB) procesan inyecciones de dependencias, lógica de validación, consultas a Supabase y hasta generación de documentos PDF (uso de `pdfkit` embebido directo en la ruta `/:alumnoId/pdf/:periodoId`). 
- **Controladores Subutilizados:** Aunque existe un directorio `controllers/` con archivos como `authController.js` y `boletasController.js`, gran parte del flujo de la aplicación se lo salta.
- **Impacto:** Esto hace que testear unitariamente (Unit Testing) la lógica de negocios sea casi imposible sin levantar el servidor Express, y complica severamente el mantenimiento a largo plazo.

### Solución Recomendada:
Aplicar refactorización estricta. Las rutas (p. ej. `padreRoutes.js`) solo deben recibir el `req, res`, validar los inputs mediante middlewares y delegar la ejecución a un controlador (p. ej. `PadreController.descargarBoleta(req.params.alumnoId)`).

---

## > [!CAUTION]
## 2. Archivos "Basura" (Test Scripts & Dead Code)

El directorio raíz del servidor (`/Back_end`) está contaminado con múltiples archivos de depuración y experimentación que nunca debieron ser subidos a la rama principal (main).

- **Scripts Huérfanos:**
  - `test_rls.js`, `test_rls2.js`, `test_rls3.js`, `test_rls4.js`, `test_rls5.js`
  - `check_schema.js` al `check_schema5.js`
  - `test_admin.js`, `test_parent.js`, `test_teacher.js`
  - `deep_clean.js`
  - `testConnection.js`, `check_roles.js`
- **Impacto:** Causa confusión a los nuevos desarrolladores (ruido cognitivo). Da la impresión de un entorno de pruebas no profesional y expone lógicas de prueba a posibles vulnerabilidades si llegaran a ser ejecutados en producción.

### Solución Recomendada:
1. Eliminar inmediatamente todos estos archivos.
2. Si los scripts son útiles para mantenimiento (como `seed_users.js` o `deep_clean.js`), deben moverse a una carpeta exclusiva `Back_end/scripts/` e ignorarse en la construcción de producción.

---

## > [!WARNING]
## 3. Front-end: Redundancias y Duplicación de Pantallas

El ecosistema de Angular presenta duplicación de código en la navegación y las vistas, lo cual incrementa el peso del *bundle* final y duplica el esfuerzo de rediseño.

- **Páginas Duplicadas:** 
  - Existen rutas activas para `registro` y `registro2`. Se debe definir cuál es el flujo estándar (Onboarding) y purgar el directorio obsoleto.
  - Existen divisiones innecesarias como `mensajes` y `parent-mensajes`. En Angular, la mejor práctica es tener un solo componente `MensajesComponent` dinámico que cambie la UI dependiendo del rol en el JWT (`Padre` o `Profesor`).
- **SCSS Globalizado:** Recientemente corregido en esta auditoría, pero como nota histórica: los componentes abusaban de inyectar sus propias variables de entorno (como colores beige) en vez de acatar el sistema global (Tailwind / Ionic themes).

### Solución Recomendada:
- Fusionar pantallas idénticas que solo varían por rol y utilizar los directivos de Angular (`*ngIf="userRole === 'admin'"`) o las guardas de rutas (Route Guards).
- Borrar carpetas de vistas huérfanas (`registro2`).

---

## > [!TIP]
## 4. Logros Técnicos y Puntos Fuertes

Pese a los detalles de arquitectura, el proyecto implementa patrones altamente deseables para un producto escalable:
- **Middleware de Seguridad Sólido:** Implementación de `sanitizeMiddleware.js` (DOMPurify, xss) y Helmet contra ataques XSS e inyecciones.
- **Manejo Central de Errores:** Centralización mediante `globalErrorHandler` que impide caídas abruptas de Node y previene la filtración de Stack Traces en entornos de producción.
- **Autenticación Desacoplada:** Uso de JWT y Supabase RLS policies para blindar la lectura de datos confidenciales.
- **Generación de Archivos al Vuelo:** Uso de `pdfkit` que no ocupa espacio en el disco duro del servidor al retornar Streams.

---

## Plan de Acción para la Deuda Técnica (Roadmap)
Si se entregara este código a un equipo nuevo, el Sprint 0 debería consistir obligatoriamente en:
1. **Limpieza (1 día):** Borrar todos los archivos de testing del root y los componentes de Angular duplicados.
2. **Refactor de Controladores (3 días):** Extraer TODAS las llamadas a `supabaseAdmin` dentro de `/routes` y moverlas a `/controllers`.
3. **Optimización de Interfaz (Completada hoy):** Mantenimiento global de directivas UI (ya realizado con Tailwind base classes).

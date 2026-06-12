# Reporte de QA - Plataforma "La Luz"

A continuación, presento los resultados detallados de la ejecución de pruebas automatizadas sobre el Frontend (levantado en `http://localhost:4200`) para los tres flujos solicitados.

## Resumen Ejecutivo

*   **Flujo del Padre de familia:** Funcionó correctamente hasta donde los datos lo permitieron (la boleta ya estaba firmada). No hubo errores críticos.
*   **Flujo del Profesor:** Bloqueado por falta de datos. El usuario profesor no tiene grupos asignados.
*   **Flujo del Administrador:** Presenta varias fallas de ruteo (rutas no existentes) y opciones de UI incompletas (botones no interactivos).

---

## 1. Flujo del Profesor (Captura de datos)
**Usuario:** `maestro123@test.com`

*   **Estado:** ⚠️ **Incompleto (Bloqueado por falta de datos)**
*   **Login:** Exitoso.
*   **Dashboard y Grupos:** Al ingresar, el sistema no mostró ninguna lista de grupos. 
*   **Captura de Calificaciones:** Debido a que el profesor no tiene materias o grupos vinculados en la base de datos de prueba, no fue posible navegar a la vista de captura ni probar la validación de calificaciones (9.5, 11 o -1).
*   **Errores/Excepciones JS:** Ninguna detectada. El sistema no crasheó, simplemente mostró un estado vacío.
*   **Logout:** Exitoso.

## 2. Flujo del Padre de Familia (Consulta y Firma)
**Usuario:** `alumno123@test.com`

*   **Estado:** ✅ **Exitoso (Comportamiento esperado según datos)**
*   **Login:** Exitoso.
*   **Dashboard:** Cargó correctamente y permitió seleccionar el perfil de la alumna (Valentina Sofía Gómez Rodríguez).
*   **Ver Boleta:** En la pestaña "Calificaciones", se visualizaron las calificaciones (ej. Matemáticas 9.5 y Español 3.33 para Enero-Marzo). El botón "Ver Boleta" funcionó correctamente abriendo el PDF (URL de tipo `blob:`).
*   **Firmar de Enterado:** No se pudo interactuar con el botón de firma porque el sistema detectó correctamente que la boleta **ya estaba firmada** (mostraba el estado *'✓ Boleta firmada'* con fecha del 5 de junio de 2026).
*   **Errores/Excepciones JS:** Ninguna. Solo se detectaron algunas advertencias menores de Supabase relacionadas con el `LockManager` durante el inicio de sesión.
*   **Logout:** Exitoso.

## 3. Flujo del Administrador
**Usuario:** `admin123@test.com`

*   **Estado:** ❌ **Fallido (Rutas y botones incompletos)**
*   **Login:** Exitoso (redirige a `/inicio-resumen-administrador`).
*   **Navegación y Botones Rotos:** 
    *   En la barra de navegación inferior, la opción **"Usuarios"** no es un botón interactivo. Se renderiza como texto/icono plano, impidiendo el acceso a la gestión de usuarios mediante la interfaz.
    *   No existe ningún botón o menú visible para descargar "Boletas masivas".
*   **Rutas Inexistentes (JS Exceptions):** Al intentar forzar la navegación por URL a rutas administrativas lógicas, la consola arrojó **excepciones de Angular** (`ERROR RuntimeError: NG04002: Cannot match any routes. URL Segment: '<segment>'`). Esto ocurrió para las siguientes rutas:
    *   `/usuarios`
    *   `/admin/usuarios`
    *   `/boletas`
    *   `/descarga-boletas`
    *   `/boletas-masivas`
*   **Errores de Red:** Advertencia de Supabase en consola (`NavigatorLockAcquireTimeoutError: Acquiring an exclusive Navigator LockManager lock "lock:sb-gdfdagwhzxkmjolamyvf-auth-token" immediately failed`).
*   **Logout:** Exitoso.

---

### Recomendaciones y Próximos Pasos:
1.  **Datos Semilla (Seed):** Asignar grupos y materias de prueba al profesor `maestro123@test.com` para poder probar el flujo de captura de calificaciones.
2.  **Ruteo Admin:** Definir y registrar en Angular las rutas correspondientes al administrador (`/usuarios`, `/boletas-masivas`, etc.).
3.  **UI Admin:** Enlazar correctamente los íconos del menú de navegación inferior del administrador para que ejecuten eventos de navegación (RouterLink).

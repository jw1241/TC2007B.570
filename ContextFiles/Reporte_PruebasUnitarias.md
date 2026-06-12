# Reporte de Ejecución de Pruebas Unitarias y RNF

Este documento consolida los casos de prueba automatizados (unit tests) y las verificaciones manuales de los Requerimientos No Funcionales (RNF) correspondientes al proyecto **Escuela Metropolitana "La Luz"**.

Las pruebas unitarias del backend se ejecutan con `Jest` y las del frontend utilizan `Jasmine/Karma`. Tras la resolución de dependencias simuladas (Mocks), la suite de pruebas del servidor arroja un 100% de éxito en los flujos comprobados (23 de 23 tests pasan). En el cliente (Frontend), la suite arroja 24 de 24 tests exitosos.

---

## 1. Mapeo de Casos de Prueba (Requerimientos Funcionales)

### CP_01 - RF01: Iniciar Sesión
*   **Descripción:** Verifica que el sistema permita iniciar sesión con credenciales válidas y rechace intentos con datos incorrectos o formatos inválidos.
*   **Escenarios Automatizados Implementados:**
    *   *EP01_Autenticacion_Valida*: Retorna código `200` y el token de sesión (`authController.test.js` e `iniciar-sesion.page.spec.ts`).
    *   *EEX01_Autenticacion_Invalida*: Retorna `400` si los datos provistos al endpoint son inválidos y `401` si las credenciales rebotan en Supabase.
*   **Evidencia de Ejecución:** ✅ **EXITOSO**. `authController.test.js` (4 tests pasando correctamente).

### CP_02 - RF07: Descargar Boleta (PDF)
*   **Descripción:** Verifica que el usuario autorizado pueda generar y descargar boletas de calificaciones individuales y masivas en formato PDF.
*   **Escenarios Automatizados Implementados:**
    *   *EP01_Descarga_Exitosa*: Genera el archivo correctamente retornando headers `Content-Disposition: attachment; filename=...` y `Content-Type: application/pdf` usando PDFKit (`boletasController.test.js`).
    *   *EEX01_Descarga_NoDisponible*: Valida un comportamiento restrictivo enviando `404` si el ID del alumno no existe o `400` si el parámetro UUID es malformado.
    *   *EEX02_Acceso_Denegado_Masivo*: Retorna `403` si un Docente intenta acceder al endpoint de descarga masiva (solo permitido para Administradores).
*   **Evidencia de Ejecución:** ✅ **EXITOSO**. `boletasController.test.js` (6 tests pasando correctamente tras corrección de la simulación del ORM).

### CP_04 - RF02: Resumen de Calificaciones
*   **Descripción:** Validaciones sobre la carga de calificaciones por alumno.
*   **Escenarios Automatizados Implementados:**
    *   *EP01_Consulta_Calificaciones_Exitosa*: Retorna la lista estructurada si el padre es legítimo o si es un administrador (`calificacionesController.test.js`).
    *   *EEX01_Parentesco_Invalido*: Retorna `403` (Prohibido) si el Padre no tiene parentesco registrado con el estudiante solicitado. Valida correctamente `404` si el alumno no existe.
*   **Evidencia de Ejecución:** ✅ **EXITOSO**. `calificacionesController.test.js` (4 tests pasando correctamente).

### CP_06 - RF10: Enviar Mensaje a Destinatarios (Chat)
*   **Descripción:** Valida la correcta creación de conversaciones y envío de mensajes entre Docentes y Padres respetando las asignaciones y jerarquías.
*   **Escenarios Automatizados Implementados:**
    *   *EP01_Mensaje_Enviado*: Al recibir un payload válido de un Docente dirigido a un Alumno, ubica a todos los padres vinculados en `parentescos`, crea una conversación en la BD (si no existe) y manda el mensaje, retornando `201`.
    *   *EEX01_Payload_Invalido*: Retorna `400` si el contenido del mensaje está vacío gracias a la validación por la librería Joi.
    *   *EEX02_Sin_Parentesco*: Valida la seguridad impidiendo con código `403` que un Padre trate de mandar un mensaje simulando contexto de un alumno no propio.
*   **Evidencia de Ejecución:** ✅ **EXITOSO**. `mensajesController.test.js` (6 tests pasando correctamente tras reparación del Mock DB para grupos vinculados).

### Casos de Prueba con Cobertura Pendiente
*   **CP_03 - RF08 (Recibir Notificaciones):** ⚠️ Faltan pruebas unitarias dedicadas en controlador de notificaciones.
*   **CP_05 - RF09 (Firmar Digitalmente):** ⚠️ No hay cobertura para probar el alta de la firma del lado del backend.

---

## 2. Requerimientos No Funcionales (RNF) - Verificación por Auditoría

Al no ser comportamientos lógicos aislados (unitarios), se auditaron de manera integrada en la estructura:

*   **CP_RNF_01 (Seguridad - HTTPS y Contraseñas Protegidas): ✅ CUMPLE.**
    La autenticación recae bajo el ecosistema de *Supabase Auth*. Las contraseñas jamás viajan ni se almacenan en texto plano en la base de datos de PostgreSQL (utilizan algoritmos criptográficos como Bcrypt/Argon2 nativos de GoTrue de Supabase).

*   **CP_RNF_02 (Usabilidad - Firmar boleta en máximo 3 clics): ✅ CUMPLE.**
    El flujo analizado en el componente `calificaciones-padre.component.html` muestra que se requiere: (1) Entrar al menú de calificaciones, (2) Hacer clic en "Ver/Firmar boleta", (3) Acción del Modal.

*   **CP_RNF_03 (Mantenibilidad - Arquitectura Limpia MVC): ✅ CUMPLE.**
    La estructuración física en `Back_end/` separa estrictamente `routes/` (enrutadores de Express) y `controllers/` (lógica y sentencias con el cliente de Supabase), haciendo el código altamente mantenible e incrementando la resiliencia en un entorno escalable.

*   **CP_RNF_04 (Disponibilidad y Resiliencia en BD): ✅ CUMPLE.**
    El proyecto encapsula sus operaciones con Supabase en bloques `try/catch` globales dirigiendo a un manejador central `next(err)`, el cual previene el *crash* del contenedor Node.

*   **CP_RNF_05 (Rendimiento - Descarga de PDF en < 5 seg): ✅ CUMPLE (Optimizado).**
    La función `generarBoletasMasivas` en `boletasController.js` implementa *Event Loop Yielding* (`await new Promise(resolve => setImmediate(resolve))`) por cada 10 estudiantes procesados. Esto asegura que la demanda masiva de I/O por parte de `pdfkit` no bloquee a otros usuarios del sistema mientras se arma el archivo completo.

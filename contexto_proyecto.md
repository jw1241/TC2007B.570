# Contexto del Proyecto: Sistema de Boletas Escolares

## Descripción General
El proyecto es una plataforma web responsiva (React + TypeScript) para la gestión, captura y consulta de boletas de calificaciones de la Escuela Metropolitana "La Luz". El objetivo principal es descentralizar la captura de calificaciones y proveer un portal seguro para que los padres consulten el progreso académico de sus hijos. 

El backend y la base de datos están gestionados con Supabase (PostgreSQL). La base de datos ya cuenta con políticas RLS (Row Level Security) robustas. **El frontend debe respetar y reflejar estas restricciones de acceso en sus rutas y componentes.**

---

## 1. Roles de Usuario y Flujos Principales

El sistema maneja tres perfiles de usuario estrictamente diferenciados. Cada uno tiene un flujo de trabajo aislado.

### A. Administrador (Director / TI)
[cite_start]Tiene acceso global al sistema para supervisión y configuración[cite: 22].
* **Gestión:** Puede hacer CRUD completo de usuarios (alumnos, docentes, padres, asignaciones de materias).
* **Visibilidad:** Puede ver las calificaciones de todos los grupos y alumnos.
* **Acciones clave:** Descarga masiva de todas las boletas en formato PDF al finalizar el ciclo escolar. Generación de reportes de uso y firmas.

### B. Docente (Maestro)
Su acceso está estrictamente limitado a los grupos y materias que tiene asignados en la tabla `asignaciones_docentes`.
* **Captura:** Visualiza una cuadrícula de calificaciones (Trimestre 1, 2 y 3) únicamente de sus alumnos correspondientes. No puede editar ni ver materias de otros profesores.
* **Interacción:** Puede ver si los padres ya firmaron digitalmente la boleta de sus alumnos.
* [cite_start]**Comunicación:** Tiene una bandeja de entrada para visualizar mensajes o dudas de los padres de familia y responderles[cite: 21].

### C. Padre de Familia (Usuario Final)
Es el usuario consumidor de la información. [cite_start]Puede tener uno o múltiples hijos asociados a su cuenta[cite: 25].
* **Registro:** Su flujo de registro exige validar un secreto compartido: la `matricula` del alumno + su `fecha_nacimiento`. Si coinciden, el backend crea el registro en la tabla `parentescos`.
* [cite_start]**Consulta:** Puede visualizar el historial de calificaciones y descargar en formato PDF la boleta del estudiante[cite: 17]. 
* [cite_start]**Acciones clave:** Tiene un botón para firmar digitalmente de recibido (acuse de boleta)[cite: 18, 19].
* [cite_start]**Comunicación:** Puede enviar mensajes directos a los docentes asignados a los grupos de sus hijos[cite: 20, 21].

---

## 2. Mapa de Rutas (React Router) y Control de Acceso

El frontend debe implementar **Rutas Protegidas** (Protected Routes) que verifiquen tanto la sesión activa en Supabase Auth como el `rol_id` del usuario antes de renderizar la vista.

### Rutas Públicas (No Autenticadas)
* `/login`: Pantalla de inicio de sesión genérica. Redirige al dashboard correspondiente según el rol tras el login.
* `/registro/padres`: Formulario específico que requiere Nombre, Email, Password, `matricula` del alumno y `fecha_nacimiento`.

### Rutas Privadas: Administrador
* `/admin/dashboard`: Resumen general de la escuela.
* `/admin/usuarios`: CRUD de personal y padres.
* `/admin/alumnos`: Gestión de grupos y estudiantes.
* `/admin/asignaciones`: Interfaz para vincular `docente` -> `materia` -> `grupo`.
* `/admin/reportes`: Vista para ejecutar descargas masivas de PDFs y métricas.

### Rutas Privadas: Docente
* `/docente/dashboard`: Lista de los grupos que tiene asignados.
* `/docente/grupo/:grupo_id/materia/:materia_id`: Vista principal de trabajo. Cuadrícula editable para capturar calificaciones y comentarios por trimestre.
* `/docente/mensajes`: Bandeja de entrada de las comunicaciones con los padres.

### Rutas Privadas: Padre de Familia
* `/padre/dashboard`: Selector de perfiles de sus hijos vinculados (si tiene más de uno).
* `/padre/alumno/:alumno_id`: Vista detallada de las calificaciones del niño por trimestre. Contiene los botones "Descargar Boleta PDF" y "Firmar de Recibido".
* `/padre/mensajes`: Interfaz de chat filtrada para mostrar únicamente a los maestros activos de sus hijos.

---

## 3. Reglas de Negocio Clave para el Frontend

1.  **Generación de PDF al Vuelo:** Los PDFs de las boletas no están almacenados físicamente en Supabase Storage. El frontend debe generar el documento PDF "al vuelo" (utilizando librerías como `jspdf` o `react-pdf`) extrayendo la data en crudo de la tabla `calificaciones`.
2.  **Manejo de Errores por RLS:** Como la base de datos tiene Row Level Security, las peticiones HTTP del frontend pueden regresar arreglos vacíos o errores `403/401` si un usuario intenta forzar el acceso a un ID que no le corresponde (por ejemplo, un docente modificando la URL para ver otro grupo). El frontend debe capturar estos errores de forma limpia y mostrar pantallas de "Acceso Denegado".
3.  **UI/UX para Adultos Mayores:** La interfaz debe ser altamente intuitiva, con tipografías legibles y botones claros, asumiendo que algunos docentes son adultos mayores.
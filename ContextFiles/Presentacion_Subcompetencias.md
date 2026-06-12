# Presentación de Evaluación de Subcompetencias
**Proyecto:** Sistema de Control Escolar - Escuela Metropolitana "La Luz"
**Alumno/Desarrollador:** Santiago Gamborino Morales

Este documento justifica formalmente la obtención y el nivel de dominio de las subcompetencias de área, carrera y transversales requeridas durante el bloque, evidenciadas mediante el desarrollo del sistema integral de la Escuela Metropolitana "La Luz" y la configuración de su infraestructura de red.

---

## 1. Competencias de Área (SICT)

### SICT0200 / SICT0203 - Desarrollo de escenarios y análisis de datos (Nivel de Dominio C)
**Obtención y Evidencia:**
Se ha implementado un proceso integral para la captura, procesamiento y consumo de datos del alumnado. A través del análisis de requerimientos del socio formador, se estructuró un sistema que permite a docentes y directivos visualizar **resúmenes de calificaciones y promedios** extraídos de bases de datos relacionales robustas (PostgreSQL alojado en Supabase). 

Al procesar la información de `alumnos`, `calificaciones` y `materias`, la plataforma genera escenarios dinámicos que facilitan el proceso de toma de decisiones:
- **Directivos:** Obtienen visibilidad sobre el rendimiento masivo y la capacidad de emitir boletas oficiales en lotes.
- **Padres de Familia:** Visualizan el escenario académico de sus hijos en tiempo real, lo que permite acciones correctivas tempranas y la recolección de firmas digitales.

---

## 2. Competencias de Carrera (STC)

### STC0200 / STC0203 - Diseño de componentes de software (Nivel de Dominio B)
**Obtención y Evidencia:**
Se elaboró la arquitectura del sistema basándose en el estándar MVC (Modelo-Vista-Controlador) y la filosofía *Clean Architecture*.
*   **Diseño de Datos:** Se esquematizó un modelo entidad-relación en Supabase conectando `usuarios`, `alumnos`, `parentescos` y `calificaciones` bajo estrictas políticas RLS (Row Level Security).
*   **Persistencia y Servicios:** Se diseñaron las APIs REST (Rutas y Controladores) considerando interfaces estandarizadas y seguridad HTTP, minimizando el acoplamiento y optimizando los recursos del servidor.

### STC0204 - Desarrollo de componentes de software (Nivel de Dominio B)
**Obtención y Evidencia:**
Se desarrolló la totalidad de la pila tecnológica (*Full-Stack*):
*   **Backend:** Lógica de negocio en Node.js/Express, manipulando Supabase JS y librerías como `pdfkit` para generación de documentos y `joi` para sanitización de datos.
*   **Frontend:** Aplicación fluida e interactiva en Ionic/Angular con TailwindCSS para garantizar experiencia de usuario responsiva y adaptabilidad móvil.
*   **Documentación:** El código está debidamente documentado mediante archivos dentro de la carpeta `ContextFiles` y mediante descripciones en las suites de pruebas automatizadas.

### STC0205 - Elaboración de pruebas de software (Nivel de Dominio B)
**Obtención y Evidencia:**
El aseguramiento de calidad (QA) se validó con éxito demostrando metodologías de pruebas dinámicas y estáticas.
*   **Pruebas Unitarias:** Construcción de *suites* con **Jest** y **Karma/Jasmine** cubriendo rutas de autenticación, descargas de PDFs, mensajería y consulta de calificaciones. Se probaron valores promedio, mínimos (vaciados) y excepciones controladas (`400`, `401`, `403`, `404`).
*   **Pruebas No Funcionales:** Verificación de rendimiento (I/O asíncrono no bloqueante en generación masiva de PDFs) y usabilidad.

### STC0206 - Implantación de software (Nivel de Dominio B)
**Obtención y Evidencia:**
Despliegue del entorno en producción garantizando los requerimientos del cliente.
*   Configuración del cliente hacia los entornos en la nube (Vercel/Hosting web y Backend Server).
*   Se proporcionaron artefactos documentales comprensibles para roles no técnicos (como administradores escolares o padres), incluyendo manuales formales sobre los flujos del proyecto (Documento Final de Requerimientos).

### STC0207 - Administración de proyectos computacionales (Nivel de Dominio B)
**Obtención y Evidencia:**
Gestión controlada de las etapas de diseño, codificación, prueba e implementación utilizando marcos de trabajo de metodologías ágiles. Se definió claramente el alcance en historias de usuario/requerimientos funcionales (Ej. RF01 a RF10) y se ejecutaron seguimientos de progreso en equipo, midiendo el esfuerzo y gestionando el repositorio del código.

### STC0300 / STC0301 / STC0302 - Infraestructura y Redes (Nivel de Dominio B)
**Obtención y Evidencia:**
En el contexto de la infraestructura computacional, se evidencian fuertes bases de *Networking* aplicando conceptos corporativos a la simulación física/lógica de la red escolar (vía **Cisco Packet Tracer** u otras herramientas).
*   **Configuración (STC0301):** Diseño de la topología local, estructuración de subredes (Subnetting) y segmentación del tráfico a través de **VLANs** (por ejemplo, dividiendo redes Administrativas, Docentes y Alumnos). Configuración de enrutamiento (estático/dinámico) e interconexión con equipos Cisco.
*   **Validación de Calidad (STC0302):** Comprobación de conectividad (*ping, traceroute*), asegurando que la infraestructura satisfaga las necesidades operativas sin caída de paquetes entre áreas.

### STC0303 - Integración de seguridad en proyectos computacionales (Nivel de Dominio B)
**Obtención y Evidencia:**
Se ha abordado la seguridad desde una perspectiva en dos capas:
1.  **Seguridad Informática (Red):** Comprensión técnica de controles de acceso (Listas de Control de Acceso / ACLs) en dispositivos Cisco, evitando ataques básicos y aislando el tráfico sensible de la red administrativa.
2.  **Seguridad a Nivel Software:** Implementación de cifrado para credenciales usando algoritmos robustos (Bcrypt/Argon2 en Supabase Auth). Aplicación del principio de privilegios mínimos mediante validaciones en controladores, imposibilitando el escalamiento de privilegios o *Data Leaks* (ej. validando estrictamente que el JWT de un padre solo le permita consultar los datos del alumno de quien es tutor legal).

---

## 3. Competencias Transversales (SEG)

### SEG0400 / SEG0403 - Integridad y Ética Ciudadana (Nivel de Dominio A)
**Obtención y Evidencia:**
El sistema gestiona datos altamente sensibles: expedientes académicos, datos personales de menores de edad y comunicación directa docente-padre.
La normatividad vigente respecto a la privacidad se resolvió aplicando integridad estructural; las validaciones del backend impiden de forma intencional que un padre manipule calificaciones o lea los expedientes de otros alumnos, velando por la transparencia y honestidad. Así, se implementó un software que, reconociendo las consecuencias de un mal uso de la información, bloquea de raíz fallas éticas y procedimentales.

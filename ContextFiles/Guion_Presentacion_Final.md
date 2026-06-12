# Guion y Estructura de la Presentación Final

Este documento contiene la propuesta de estructura para la exposición de 10 minutos frente al socio formador, así como una guía para tu evaluación individual de 15 minutos con los profesores. Está diseñado para asegurar que **todos los integrantes participen**, muestren la funcionalidad completa y no se excedan del tiempo.

---

## PARTE 1: Exposición al Socio Formador (10 Minutos)

*Nota: Calculando un equipo de 4 integrantes, cada uno hablará un promedio de 2.5 minutos. Asegúrense de ensayar con cronómetro.*

### 🟢 Diapositiva 1: Portada e Introducción (1 minuto)
*   **Contenido Visual:** Logo de la Escuela Metropolitana "La Luz", nombre del proyecto (Sistema Integral de Control Escolar) y nombres de los integrantes.
*   **Orador (Integrante 1):** 
    > "Buenas tardes, somos el equipo encargado del desarrollo del Sistema Integral para la Escuela Metropolitana 'La Luz'. Hoy presentaremos la plataforma que digitaliza y agiliza el control de calificaciones, la comunicación entre docentes y padres, y optimiza la infraestructura tecnológica del colegio."

### 🟢 Diapositiva 2: La Problemática y el Valor Agregado (1 minuto)
*   **Contenido Visual:** Puntos breves sobre los procesos manuales (papel) vs. la nueva digitalización.
*   **Orador (Integrante 1):**
    > "El reto consistía en modernizar la gestión escolar. Reemplazamos la captura manual y los boletines impresos por un portal seguro, accesible desde móviles y computadoras, reduciendo errores humanos y tiempos de respuesta, facilitando la toma de decisiones basada en datos."

### 🟢 Diapositiva 3: Arquitectura Tecnológica e Infraestructura (1.5 minutos)
*   **Contenido Visual:** Diagrama de la arquitectura (Ionic/Angular Frontend, Node.js Backend, Supabase/PostgreSQL BD) y diagrama topológico de red (Cisco Packet Tracer).
*   **Orador (Integrante 2 - Sugerencia: Santiago):**
    > "Para lograrlo, dividimos el proyecto en dos pilares. A nivel de infraestructura, diseñamos en Packet Tracer la topología de red separando el tráfico por VLANs para alumnos, docentes y administrativos, asegurando calidad y seguridad. A nivel de software, desarrollamos una arquitectura robusta *Full-Stack* con Frontend responsivo, un Backend Node.js y bases de datos relacionales en Supabase para garantizar integridad."

### 🟢 Diapositiva 4: DEMOSTRACIÓN FUNCIONAL (4.5 minutos)
*   **Contenido Visual:** En lugar de diapositivas estáticas, **compartan pantalla interactuando con el sistema en vivo**. Si temen que algo falle por el internet, graben un video fluido narrado en vivo.
*   **Orador (Integrante 3 y 4 dividen los roles):**
    > **(Integrante 3 - Flujo Admin y Docente - 2 min):** "Ingresaremos al sistema como Administrador. Aquí podemos ver el resumen de calificaciones y generar boletas masivas en formato PDF (mostrar descarga rápida). Ahora, como Docente, mostramos cómo capturar notas de un grupo y comunicarnos directamente enviando un mensaje a los padres."
    >
    > **(Integrante 4 - Flujo Padre - 2.5 min):** "Ahora cambiaremos a la vista del Padre de familia. Al iniciar sesión, solo vemos la información de nuestros hijos por políticas de seguridad. Podemos revisar la boleta, descargarla, firmarla digitalmente (mostrar los 3 clics) y leer el mensaje que nos acaba de enviar el docente."

### 🟢 Diapositiva 5: Calidad, Pruebas y Seguridad (1 minuto)
*   **Contenido Visual:** Pantallazo de los 24/24 Tests Unitarios pasando en verde, iconos de seguridad (candado, encriptación).
*   **Orador (Integrante 2 o cualquiera que no haya hablado en el Demo):**
    > "No solo entregamos una interfaz bonita; detrás hay código validado. Desarrollamos decenas de pruebas automatizadas que aseguran que el sistema no colapse. Las contraseñas están fuertemente encriptadas, y el servidor genera los PDF asíncronamente sin afectar a otros usuarios conectados."

### 🟢 Diapositiva 6: Cierre y Entregables (1 minuto)
*   **Contenido Visual:** Foto del equipo, enlace al despliegue, agradecimientos.
*   **Orador (Integrante 1):**
    > "Entregamos hoy la plataforma funcional, junto con los manuales de usuario y documentación técnica de la red y el software. Agradecemos su tiempo y confianza. Pasamos a la ronda de preguntas."

---
*Fin de los 10 minutos. Siguen 5 minutos de Preguntas y Respuestas (Q&A) con el Socio Formador.*
---

## PARTE 2: Guía para tu Evaluación Individual (15 Minutos con Profesores)

Para la evaluación oral individual con tus profesores, **te van a interrogar sobre cómo tú, Santiago, aplicaste las subcompetencias**. Esta es tu estrategia:

### Cuando te pregunten sobre Software (STC0200, STC0203, STC0204):
*   **Qué decir:** "En el desarrollo, tomé el rol *Full-Stack*. Implementé un patrón de arquitectura limpia dividiendo el frontend (vistas responsivas en Ionic/Tailwind) de la API REST. Diseñé el modelo relacional de Supabase y las políticas RLS (Row-Level Security) para que un padre jamás pueda ver calificaciones que no le corresponden, demostrando dominio en diseño y persistencia de datos seguros."

### Cuando te pregunten sobre Pruebas de Calidad (STC0205):
*   **Qué decir:** "No dejamos la calidad a la suerte. Implementé y depuré las suites de *Jest* y *Karma*. Cuando noté que las descargas masivas de PDF podían tumbar el servidor (bloqueo del hilo), integramos control de concurrencia y lo validamos con pruebas."

### Cuando te pregunten sobre Redes e Infraestructura (STC0300, STC0301, STC0302):
*   **Qué decir:** "Para la infraestructura de la escuela, usé Packet Tracer para estructurar subredes corporativas eficientes. Configuré VLANs para segmentar a los administrativos de los alumnos y apliqué protocolos de enrutamiento y listas de control de acceso (ACLs) en los routers, protegiendo los datos desde la capa 3."

### Cuando te pregunten sobre Integridad y Toma de Decisiones (SEG0403, SICT0200):
*   **Qué decir:** "Tomamos muy en serio la ética profesional. Al manejar calificaciones y expedientes de menores, diseñé el sistema asumiendo siempre el principio de privilegios mínimos. Esto asegura la integridad absoluta frente a alteraciones y respeta la confidencialidad."

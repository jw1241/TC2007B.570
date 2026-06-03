**Especificación de requerimientos de software.**

1. Nombre del sistema de software.  
   Sistema de gestión de calificaciones “La Luz”.  
2. Problemática a resolver.  
   Actualmente, la gestión de las boletas se realiza en una hoja de cálculo dentro de Google Drive, donde todos los docentes colaboran al mismo tiempo. Esto genera problemas con la información porque el documento se edita por múltiples personas, no tiene un mecanismo automatizado para que los padres reciban y firmen de enterados, y tampoco hay un canal eficiente para resolver dudas sobre las calificaciones.  
     
     
   1. Técnica de levantamiento de requerimientos a utilizar.

		Entrevista, Etnografía y observación

3. Proceso de negocio:  
   1. AS IS (pasos textuales).  
      1\.     Los docentes de diferentes materias acceden simultáneamente a un archivo general de Excel alojado en Google Drive.

      2\.     Los docentes capturan manualmente las calificaciones de sus alumnos en la hoja compartida, corriendo el riesgo de sobrescribir datos de otros profesores.

      3\.     Al finalizar el periodo de evaluación, la administración descarga la sábana de calificaciones completa.

      4\.     El personal administrativo separa manualmente el archivo para generar un PDF individual por cada alumno.

      5\.     Se envía cada PDF de forma manual a los padres de familia a través de correo electrónico o Google Classroom.

      6\.     La escuela no tiene un mecanismo formal y unificado para recabar el acuse de recibo o firma de la boleta.

   2. TO BE (pasos textuales).

			1\.     Los docentes inician sesión en una plataforma web y consultan únicamente  
los grupos y columnas correspondientes a las materias que imparten.  
2\. 	Los docentes capturan las calificaciones de forma aislada y segura; el sistema calcula los promedios de forma automática por trimestre.

3\. 	El sistema genera automáticamente el formato de la boleta individual en PDF.

4\. 	El sistema envía una notificación automática a los padres de familia indicando que hay una nueva boleta o actualización disponible.

5\. 	Los padres acceden a la aplicación web/móvil, consultan la boleta, la descargan en PDF y presionan un botón para firmar digitalmente de recibido.

6\. 	En caso de dudas, el padre de familia envía una solicitud de cita o mensaje desde la plataforma al docente.

4. Stakeholders.  
* Profesores  
* Padres de familia  
* Administradores

5. Requerimientos funcionales (por stakeholder), descritos desde el punto de vista del usuario:

Nota: Inserta una columna para especificar la plataforma recomendada (Web o Móvil).

Stakeholder 1: Profesores (web)

| ID | Nombre del RF | Descripción |
| ----- | ----- | ----- |
| RF01 | Contestar dudas/preguntas | Los profesores podrán contestar las dudas, preguntas, y comentarios de los padres |
| RF02 | Consultar clases | Los profesores sólo podrán consultar las clases que enseñan |
| RF03 | Cambiar calificaciones  | Los profesores sólo podrán modificar calificaciones de las materias que tienen  |
| RF04 | Ver firmas y comentarios | Los profesores podrán firmar digitalmente |

Nota: Inserta las filas que necesites.

Stakeholder 2: Padres de familia (mobile)

| ID | Nombre del RF | Descripción |
| ----- | ----- | ----- |
| RF05 | Consultar calificaciones | Los padres podrán consultar calificaciones de los estudiantes |
| RF06 | Descargar boleta | Los padres podrán descargar la boleta en el formato de PDF  |
| RF07 | Recibir notificación  | Los padres recibirán las notificaciones cuando haya actualizaciones en la boleta |
| RF08 | Firmar digitalmente | Los padres firmarán digitalmente que recibieron la boleta con un botón.  |
| RF09 | Enviar dudas/preguntas | Los padres enviaran un mensaje a los profesores si hay dudas, preguntas, o comentarios.  |

Nota: Inserta las filas que necesites.

Stakeholder 3: Administradores (web)

| ID | Nombre del RF | Descripción |
| ----- | ----- | ----- |
| RF10 | CRUD Usuarios | Los administradores podrán gestionar todos los usuarios del sistema con acceso privilegiado completo |
| RF11 | Descarga de boletas | Los administradores  podrán descargar de forma masiva todas las boletas al finalizar el ciclo escolar para su archivo histórico |
| RF12 | Consultar las calificaciones calculadas y promedios automáticamente | Los administradores podrán consultar las calificaciones que el sistema calcula y promedia automáticamente. |
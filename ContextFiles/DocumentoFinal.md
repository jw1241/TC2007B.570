1.9. Requerimientos y Características del Sistema

1.9.1. Requerimientos Funcionales

**Stakeholder 1:** Profesores 

| ID | Nombre | Descripción | Prioridad |
| :---: | ----- | ----- | :---: |
| RF01 | Iniciar sesión  | Los profesores deberán poder iniciar sesión en la aplicación web con correo y contraseña | Alta |
| RF 02 | Contestar los padres | Los profesores deberán poder contestar las dudas, preguntas, y comentarios de los padres | Media |
| RF 03 | Consultar clases | Los profesores deberán consultar las listas de los grupos asignados | Media |
|  RF 04 | Modificar/consultar calificaciones | Los profesores deberán modificar/consultar calificaciones de las materias que imparten |  Alta |
| RF 05 | Registrar calificaciones | Los profesores deberán registrar calificaciones | Alta |
| RF06 | Verificar firmas | Los profesores deberán verificar que los padres han firmado digitalmente | Baja |

   
**Stakeholder 2:** Padres

| ID | Nombre | Descripción | Prioridad |
| :---: | ----- | ----- | :---: |
| RF 07 | Iniciar sesión | Los padres deberán iniciar sesión con correo y contraseña o registrarse una cuenta y establecer una contraseña si aún no lo han hecho | Alta |
| RF 08 | Descargar boleta | Los padres deberán descargar la boleta en el formato de PDF | Alta |
| RF 09 | Recibir notificaciones | Los padres deberán recibir las notificaciones cuando haya actualizaciones en la boleta | Media |
|  RF 10 | Firmar digitalmente |  Los padres deberán firmar digitalmente que recibieron la boleta con un botón | Baja |
| RF 11 | Enviar mensaje | Los padres deberán enviar un mensaje a los profesores si hay dudas, preguntas, o comentarios | Media |

**Stakeholder 3:** Administradores 

| ID | Nombre | Descripción | Prioridad |
| :---: | ----- | ----- | :---: |
| RF12 | Iniciar sesión  | Los administradores deberán iniciar sesión en la aplicación móvil con correo y contraseña (Móvil y Web) | Alta |
| RF13 | CRUD Usuarios | Los administradores deberán gestionar todos los usuarios del sistema con acceso privilegiado completo |  Media |
| RF 14 | Descarga boletas | Los administradores deberán descargar de forma masiva todas las boletas al finalizar el ciclo escolar para su archivo histórico | Alta |
|  RF 15 | Consultar las calificaciones calculadas y promedios automáticamente |  Los administradores deberán consultar las calificaciones que el sistema calcula y promedia automáticamente | Baja |
| RF16 | Realizar la carga de las listas | Los administradores deberán realizar la carga de las listas por grado y por grupo en el sistema | Alta |


1.9.3. Escenarios

| RF01, 07, 12: Iniciar sesión |  |
| :---- | ----- |
| **Alcance:** | Módulo de usabilidad de la aplicación |
| **Actor(es):** | Administradores  |
| **Stakeholders e intereses:** | Profesores, Padres y Administradores: Interesado en iniciar sesión exitosamente |
| **Precondiciones:** | El usuario debe haber tener una cuenta o crear una cuenta El usuario debe haber iniciado sesión exitosamente |
| **Resultado esperado:** | Los usuarios ya tienen una cuenta o pueden crear una para iniciar sesión exitosamente. |
| **Escenarios principales de éxito** **(Flujo base)** | **EP01\_InciaSesiónExitosa** El usuario selecciona ingresar la información de inicio de sesión y hace clic en iniciar sesión El usuario hace clic en registrarse y crear una nueva cuenta para iniciar sesión El sistema guarda la información del nuevo usuario para permitir intentos de inicio de sesión posteriores exitosos |
| **Escenarios de excepción fallidos** **(Flujo base)** | **EEX01\_CredencialIncorrecta** El usuario introdujo un correo electrónico y/o contraseña incorrectos El usuario introdujo un código de registro incorrecto El usuario introdujo la matrícula de estudiante incorrecta  |
| **Escenarios alternativos de éxito** **(Flujo base)** | **EA01\_IngrseCredencialCorrecta** El usuario cambia la entrada al correo electrónico y/o contraseña correctos El usuario introdujo el código de registro correcto El usuario introdujo la matrícula de estudiante correcta  |
| **Validación de datos:** | Datos de entrada: Nombre del campo Tipo de dato Validación Correo Integer/String Validar que el correo electrónico exista en la base de datos Contraseña  Integer/String Valida que la contraseña sea la correcta para el correo electrónico Estudiante Integer/String Validar que la matrícula del estudiante esté activo Código de registro Integer/String Validar que el código de registro coincida con la matrícula del estudiante y que también esté activo     Datos de salida: Nombre del campo Tipo de dato Validación Usuario String Mantener el registro del usuario que ingresa a la aplicación Estudiante Integer/String Mantener el registro del estudiante al que el usuario está intentando consultar       |
| **Prototipo:** |    Nota: Bosquejo a mano o impresión de pantalla del mockup.                |

| RF02: Contestar los padres |  |
| :---- | ----- |
| **Alcance:** | Módulo de comunicación |
| **Actor(es):** | Profesores  |
| **Stakeholders e intereses:** | Profesores: Contestar los mensajes de los padres |
| **Precondiciones:** | El usuario debe haber iniciado sesión exitosamente. El usuario debe haber tenido estudiantes de los padres que enviaron los mensajes. |
| **Resultado esperado:** | Los profesores pueden consultar y contestar los mensajes de los padres.  |
| **Escenarios principales de éxito** **(Flujo base)** | **EP01\_Consultar/Contestar** El usuario puede consultar los mensajes de los padres El usuario solo puede recibir y contestar mensajes de los padres de sus propios alumnos. El sistema envía y entrega el mensaje en consecuencia. |
| **Escenarios de excepción fallidos** **(Flujo base)** | **EEX01\_ConversacionNoExiste** El profesor intenta responder a una conversación que no existe en el sistema. **EEX02\_ProfesorNoAsignado** El profesor intenta responder a una conversación relacionada con un alumno que no pertenece a ninguno de sus grupos o materias asignadas. **EEX03\_MensajeVacio** El profesor intenta enviar una respuesta sin contenido.  |
| **Escenarios alternativos de éxito** **(Flujo base)** | **EA01\_RespuestaEnviada** El profesor redacta un mensaje válido y el sistema lo almacena correctamente. **EA02\_MensajeLeido** El padre de familia visualiza posteriormente la respuesta enviada por el profesor y el estado del mensaje cambia a "leído". **EA03\_ContenidoCorregido** El profesor modifica el contenido del mensaje para eliminar palabras prohibidas y logra enviarlo correctamente.  |
| **Validación de datos:** | Datos de entrada: Nombre del campo Tipo de dato Validación Conversación UUID Validar que la conversación exista en la tabla conversaciones Profesor  UUID Validar que exista en usuarios, tenga rol docente y esté activo. Alumno UUID Validar que el alumno pertenezca a un grupo asignado al docente. Mensaje String/Text No debe estar vacío y debe cumplir el límite de longitud definido. Palabras prohibidas String/Text Validar que el contenido no contenga palabras registradas en palabras\_prohibidas.     Datos de salida: Nombre del campo Tipo de dato Validación Mensaje String/Text Registrar el contenido enviado Remitente UUID Mantener registro del profesor que envió la respuesta. Conversación UUID Asociar el mensaje a la conversación correspondiente. Estado String Inicializar como "enviado". Fecha de envío Timestamp Registrar fecha y hora de creación del mensaje.       |
| **Prototipo:** |    Nota: Bosquejo a mano o impresión de pantalla del mockup.                |

| RF03: Consultar clases |  |
| :---- | ----- |
| **Alcance:** | Módulo académico de consulta de grupos y materias |
| **Actor(es):** | Profesor, Padres |
| **Stakeholders e intereses:** | Profesores: Consultar los grupos y materias asignados. Padres: Consultar las clases del estudiante. |
| **Precondiciones:** | El usuario ha iniciado sesión Existe un estudiante asociado |
| **Resultado esperado:** | El sistema muestra las clases correspondientes al estudiante o docente. |
| **Escenarios principales de éxito** **(Flujo base)** | **EP01\_ConsultaClasesExitosa** El usuario selecciona Consultar Clases. El sistema recupera los grupos y materias correspondientes. El sistema muestra la información. |
| **Escenarios de excepción fallidos** **(Flujo base)** | **EEX01\_AlumnoNoEncontrado** El estudiante no existe. **EEX02\_SinAsignaciones** No existen materias asignadas. |
| **Escenarios alternativos de éxito** **(Flujo base)** | **EA01\_ConsultaFiltrada** El usuario filtra por grado o materia. |
| **Validación de datos:** | Datos de entrada: Nombre del campo Tipo de dato Validación Alumno UUID Debe existir en alumnos Usuario UUID Debe estar autenticado     Datos de salida: Nombre del campo Tipo de dato Validación Grupo String Mostrar grupo asignado Materia String Mostrar materia correspondiente    |
| **Prototipo:** |    Nota: Bosquejo a mano o impresión de pantalla del mockup.                |

| RF04: Modificar/consultar calificaciones  |  |
| :---- | ----- |
| **Alcance:** | Módulo académico |
| **Actor(es):** | Profesor |
| **Stakeholders e intereses:** | Profesores: Consultar y modificar calificaciones Padres: Obtener información actualizada |
| **Precondiciones:** | Profesor autenticado Alumno existente |
| **Resultado esperado:** | La calificación se consulta o modifica correctamente |
| **Escenarios principales de éxito** **(Flujo base)** | **EP01\_ModificacionExitosa** El profesor selecciona una calificación Modifica la información El sistema guarda los cambios |
| **Escenarios de excepción fallidos** **(Flujo base)** | **EEX01\_CalificacionNoExiste** La calificación que se desea modificar aún no existe **EEX02\_ValorInvalido** La calificación ingresada tiene un formato incorrecto |
| **Escenarios alternativos de éxito** **(Flujo base)** | **EA01\_ConsultaExitosa** La calificación existe y se consultó con éxito |
| **Validación de datos:** | Datos de entrada: Nombre del campo Tipo de dato Validación Nota Numeric Entre 0 y 10 Alumno UUID Debe existir Materia UUID Debe existir     Datos de salida: Nombre del campo Tipo de dato Validación Nota actualizada Numeric Guardada correctamente Comentario Text Asociado a la nota  |
| **Prototipo:** |    Nota: Bosquejo a mano o impresión de pantalla del mockup.                |

| RF05: Registrar calificaciones |  |
| :---- | ----- |
| **Alcance:** | Registro de evaluaciones |
| **Actor(es):** | Profesor |
| **Stakeholders e intereses:** | Profesores: Registrar evaluaciones Padres: Visualizar resultados |
| **Precondiciones:** | Profesor autenticado Materia asignada |
| **Resultado esperado:** |  La calificación queda registrada. |
| **Escenarios principales de éxito** **(Flujo base)** | **EP01\_RegistroExitoso** La nota registrado y almacenar correctamente |
| **Escenarios de excepción fallidos** **(Flujo base)** | **EEX01\_NotaFueraDeRango** La nota está fuera de rango **EEX02\_AlumnoNoExiste** El alumno no existe en el sistema |
| **Escenarios alternativos de éxito** **(Flujo base)** | **EA01\_CorreccionDeNota** 4\. La nota fue corregida con éxito. |
| **Validación de datos:** | Datos de entrada: Nombre del campo Tipo de dato Validación Nota Numeric 0-10 Tarea String No vacía Comentario Text Opcional     Datos de salida: Nombre del campo Tipo de dato Validación Calificación Numeric Registrada Fecha Timestamp Guardada  |
| **Prototipo:** |    Nota: Bosquejo a mano o impresión de pantalla del mockup.                |

| RF06: Verificar firmas |  |
| :---- | ----- |
| **Alcance:** | Módulo de boletas |
| **Actor(es):** | Profesor, Administrador |
| **Stakeholders e intereses:** | Profesores: Verificar confirmación de padres Administradores: Seguimiento |
| **Precondiciones:** | Boleta publicada |
| **Resultado esperado:** | El sistema muestra estado de firma |
| **Escenarios principales de éxito** **(Flujo base)** | **EP01\_VerificacionExitosa** El padre firmó la boleta y también se mostró al lado del profesor |
| **Escenarios de excepción fallidos** **(Flujo base)** | **EEX01\_BoletaNoPublicada** La boleta aún no está publicada. |
| **Escenarios alternativos de éxito** **(Flujo base)** | **EA01\_FirmaPendiente** Esperando la firma de los padres.  |
|  **Validación de datos:** | Datos de entrada: Nombre del campo Tipo de dato Validación Alumno UUID Debe existir Periodo UUID Debe existir Datos de salida: Nombre del campo Tipo de dato Validación Estado Firma String Firmada/Pendiente Fecha Firma Timestamp Mostrar registro  |
| **Prototipo:** |    Nota: Bosquejo a mano o impresión de pantalla del mockup.                |

| RF07: Descargar boleta |  |
| :---- | ----- |
| **Alcance:** | Consulta académica |
| **Actor(es):** | Padres |
| **Stakeholders e intereses:** | Padres: Descargar boletas de sus hijos |
| **Precondiciones:** | Boleta publicada y lista para descargar |
| **Resultado esperado:** |  Descarga correcta de boleta |
| **Escenarios principales de éxito** **(Flujo base)** | **EP01\_DescargaExitosa** La boleta se descargó exitosamente |
| **Escenarios de excepción fallidos** **(Flujo base)** | **EEX01\_BoletaNoDisponible** La boleta aún no está disponible |
| **Escenarios alternativos de éxito** **(Flujo base)** | **EA01\_DescargaReintentada** Los padres vuelven a intentar descargar la boleta |
| **Validación de datos:** | Datos de entrada: Nombre del campo Tipo de dato Validación Alumno UUID Debe existir Periodo UUID Debe existir Datos de salida: Nombre del campo Tipo de dato Validación Boleta PDF Archivo Debe estar lista para descargar  |
| **Prototipo:** |    Nota: Bosquejo a mano o impresión de pantalla del mockup.                |

| RF08: Recibir notificaciones |  |
| :---- | ----- |
| **Alcance:** | Sistema de alertas |
| **Actor(es):** | Padres |
| **Stakeholders e intereses:** | Padres: Reciben notificaciones cuando la boleta de calificaciones esté lista y mensajes nuevos |
| **Precondiciones:** | El usuario recibe notificaciones |
| **Resultado esperado:** | El usuario recibe notificaciones |
| **Escenarios principales de éxito** **(Flujo base)** |  **EP01\_NotificacionRecibida** El usuario puede recibir notificaciones |
| **Escenarios de excepción fallidos** **(Flujo base)** | **EEX01\_ErrorEnvioNotificacion** La notificación no fue enviado y el usuario no la recibió |
| **Escenarios alternativos de éxito** **(Flujo base)** | **EA01\_ReenvioExitoso** La notificación se envía de nuevo |
| **Validación de datos:** | Datos de entrada: Nombre del campo Tipo de dato Validación Usuario UUID Debe existir Evento   Debe enviarse al usuario correcto   Datos de salida: Nombre del campo Tipo de dato Validación Notificación String Debe enviarse la notificación correcto   |
| **Prototipo:** |    Nota: Bosquejo a mano o impresión de pantalla del mockup.                |

| RF9: Firmar digitalmente |  |
| :---- | ----- |
| **Alcance:** | Confirmación de boletas |
| **Actor(es):** | Padre |
| **Stakeholders e intereses:** | Padre: Debe firmar las boletas |
| **Precondiciones:** | La boleta está disponible |
| **Resultado esperado:** | Firma registrada |
| **Escenarios principales de éxito** **(Flujo base)** | **EP01\_FirmaExitosa** La boleta está firmada con éxito  |
| **Escenarios de excepción fallidos** **(Flujo base)** | **EEX01\_FirmaDuplicada** La boleta ya está firmada |
| **Escenarios alternativos de éxito** **(Flujo base)** | **EA01\_FirmaReintentada** El usuario trata de firma de nuevo |
| **Validación de datos:** | Datos de entrada: Nombre del campo Tipo de dato Validación Padre UUID Debe existir Alumno UUID Debe existir Periodo UUID Debe existir Datos de salida: Nombre del campo Tipo de dato Validación Firma Timestamp Firma guardada  |
| **Prototipo:** |    Nota: Bosquejo a mano o impresión de pantalla del mockup.                |

| RF10: Enviar mensaje (padre) |  |
| :---- | ----- |
| **Alcance:** | Módulo de comunicación |
| **Actor(es):** | Padre |
| **Stakeholders e intereses:** | Padre: Debe enviar mensajes a los profesores |
| **Precondiciones:** | El usuario debe haber iniciado sesión exitosamente. |
| **Resultado esperado:** | Mensaje enviado al profesor |
| **Escenarios principales de éxito** **(Flujo base)** | **EP01\_MensajeEnviado** El mensaje está enviado con éxito |
| **Escenarios de excepción fallidos** **(Flujo base)** | **EEX01\_MensajeVacio** El contenido del mensaje está vacío **EEX02\_PalabraProhibida** El contenido del mensaje contiene palabras prohibidas  |
| **Escenarios alternativos de éxito** **(Flujo base)** | **EA01\_ContenidoCorregido** El contenido contiene palabras que no están prohibidas ni vacías |
| **Validación de datos:** | Datos de entrada: Nombre del campo Tipo de dato Validación Conversación UUID Debe existir Mensaje Text No vacío ni contiene palabras prohibidas     Datos de salida: Nombre del campo Tipo de dato Validación Estado String Enviado o no enviado Fecha Timestamp Hora enviada       |
| **Prototipo:** |    Nota: Bosquejo a mano o impresión de pantalla del mockup.                |

| RF11: CRUD Usuarios |  |
| :---- | ----- |
| **Alcance:** | Administración de usuarios |
| **Actor(es):** | Administrador |
| **Stakeholders e intereses:** | Administrador: Puede actualizar o añadir usuarios, grupos, materias |
| **Precondiciones:** | El usuario ha iniciado sesión Tiene el rol de administrador  |
| **Resultado esperado:** | Gestionar o actualizar usuarios, grupos, materias |
| **Escenarios principales de éxito** **(Flujo base)** | **EP01\_CrearUsuario** Crear un nuevo usuario que aún no esté en el sistema  **EP01\_ModificarUsuario** Modificar los datos de usuario que ya están en el sistema **EP03\_EliminarUsuario** Eliminar usuario que ya está en el sistema **EP04\_ConsultarUsuario** Consultar usuario que ya está en el sistema |
| **Escenarios de excepción fallidos** **(Flujo base)** | **EEX01\_CorreoDuplicado** El correo ya está en el sistema **EEX02\_UsuarioNoExiste** El usuario no existe en el sistema |
| **Escenarios alternativos de éxito** **(Flujo base)** | **EA01\_ReactivacionUsuario** El usuario no está activo en el sistema, reactívelo |
| **Validación de datos:** | Datos de entrada: Nombre del campo Tipo de dato Validación Nombre String Solo debe contiene letras y espacios Correo String Debe estar en formato de correo Rol Integer Debe ser un número entero entre 1 y 3     Datos de salida: Nombre del campo Tipo de dato Validación Usuario Registro Aún no existe en el sistema  |
| **Prototipo:** |    Nota: Bosquejo a mano o impresión de pantalla del mockup.                |

| RF12: Descargar boletas |  |
| :---- | ----- |
| **Alcance:** | Administración académica |
| **Actor(es):** | Administrador |
| **Stakeholders e intereses:** | Administrador: Debe poder descargar todas las boletas |
| **Precondiciones:** | Las boletas ya están disponible  |
| **Resultado esperado:** | Descarga masiva de boletas |
| **Escenarios principales de éxito** **(Flujo base)** | **EP01\_DescargaMasivaExitosa** Los boletas se descargaron correctamente |
| **Escenarios de excepción fallidos** **(Flujo base)** | **EEX01\_SinBoletasDisponibles** Las boletas aún no están disponible |
| **Escenarios alternativos de éxito** **(Flujo base)** | **EA01\_DescargaPorPeriodo** Puede descargar las boletas por periodo |
| **Validación de datos:** | Datos de entrada: Nombre del campo Tipo de dato Validación Periodo UUID Debe existir en los bases de datos      Datos de salida: Nombre del campo Tipo de dato Validación Boletas Archivo  Debe estar en formato PDF       |
| **Prototipo:** |    Nota: Bosquejo a mano o impresión de pantalla del mockup.                |

| RF13: Consultar las calificaciones calculadas y promedios automáticamente  |  |
| :---- | ----- |
| **Alcance:** | Cálculo académico |
| **Actor(es):** | Profesor, Padre |
| **Stakeholders e intereses:** | Profesor, Padre: El usuario debe consultar las calificaciones calculadas y promedios |
| **Precondiciones:** | Las métricas ya está disponible |
| **Resultado esperado:** | Visualización automática de promedios |
| **Escenarios principales de éxito** **(Flujo base)** | **EP01\_ConsultaPromediosExitosa** Consulta promedios con éxito |
| **Escenarios de excepción fallidos** **(Flujo base)** | **EEX01\_SinCalificacionesRegistradas** Las calificaciones aun no están registrados |
| **Escenarios alternativos de éxito** **(Flujo base)** | **EA01\_ConsultaPorMateria** Debe poder consultar las métricas por materia |
| **Validación de datos:** | Datos de entrada: Nombre del campo Tipo de dato Validación Alumno UUID Debe existir      Datos de salida: Nombre del campo Tipo de dato Validación Promedio Numeric Debe estar entre 1 y 10 Calificaciones Lista Debe haber calificaciones para todas las materias.       |
| **Prototipo:** |    Nota: Bosquejo a mano o impresión de pantalla del mockup.                |

| RF14: Realizar la carga de las listas |  |
| :---- | ----- |
| **Alcance:** | Administración escolar |
| **Actor(es):** | Administrador |
| **Stakeholders e intereses:** | Administradores: Cargar alumnos y grupos de manera masiva. Profesores: Disponer de listas actualizadas. |
| **Precondiciones:** | Administrador autenticado Archivo válido |
| **Resultado esperado:** | Los alumnos se registran correctamente |
| **Escenarios principales de éxito** **(Flujo base)** | **EP01\_CargaExitosa El administrador selecciona un archivo. El sistema valida la estructura. Los registros son almacenados.** |
| **Escenarios de excepción fallidos** **(Flujo base)** | **EEX01\_ArchivoInvalido** Archivo está invalido **EEX02\_DatosDuplicados** Los datos ya existen en el sistema **EEX03\_FormatoIncorrecto** Los datos no están en formato correcto  |
| **Escenarios alternativos de éxito** **(Flujo base)** | **EA01\_CargaParcialExitosa** Algunos registros se cargan correctamente El sistema genera reporte de errores |
| **Validación de datos:** | Datos de entrada: Nombre del campo Tipo de dato Validación Archivo CSV Formato válido Matrícula String Única Nombre Alumno String Obligatorio Grupo UUID Debe existir     Datos de salida: Nombre del campo Tipo de dato Validación Registros cargados Integer Total exitoso Registros rechazados Integer Total fallido Reporte de errores Archivo Generado automáticamente   |
| **Prototipo:** |    Nota: Bosquejo a mano o impresión de pantalla del mockup.                |

1.9.4. Requerimientos no funcionales
   

| ID | Categoría | Descripción | Prioridad |
| ----- | ----- | ----- | ----- |
| RNF01 | Seguridad | Todas las peticiones al servidor backend deben realizarse mediante protocolo HTTPS, y las contraseñas de los usuarios deben estar hasheadas en la base de datos | Alta |
| RNF02 | Rendimiento | La API debe ser capaz de procesar el cálculo de promedios trimestrales y devolver la generación del PDF de la boleta en un tiempo de respuesta máximo de 5 segundos bajo una carga concurrente de hasta 50 docentes guardando calificaciones al mismo tiempo | Alta |
| RNF03 | Usabilidad | La interfaz de la aplicación móvil de los padres debe permitir que el flujo completo de visualizar la boleta y emitir la firma digital no requiera más de 3 interacciones o toques partiendo desde la pantalla principal | Media |
| RNF04 | Disponibilidad | El sistema de gestión "La Luz" debe garantizar un nivel de disponibilidad del 99% de sus servicios web y base de datos, asegurando que no haya caídas durante las dos semanas pico de cierre de periodo de evaluación | Alta |
| RNF05 | Mantenibilidad | El código base del sistema debe seguir un patrón de arquitectura limpia separando rutas, controladores y modelos | Alta |
| RNF06 | Seguridad | Las sesiones autenticadas en la plataforma web (profesores y administradores) deben expirar automáticamente, invalidando su token, tras 15 minutos de inactividad | Alta |
| RNF07 | Usabilidad | La interfaz de la aplicación móvil de los padres debe renderizar correctamente todos sus componentes sin superposición de texto en pantallas con resoluciones mínimas de 720x1280 píxeles | Media |
| RNF08 | Usabilidad | La plataforma web orientada a la captura de calificaciones y administración general debe ser funcional y visualmente estable en las últimas dos versiones de los principales navegadores (Chrome, Edge, Firefox, Safari) | Media |

 
# **Sección 3\. Seguridad en aplicaciones** 

# La aplicación móvil que se entrega debe cumplir con la documentación y los principios fundamentales de ciberseguridad: confidencialidad, integridad, disponibilidad y autenticidad. A continuación, se detallan los requisitos técnicos que deben implementarse para asegurar el cumplimiento de estos principios.

3.1 Autenticación y Control de Acceso para CID de la información

### 3.1.1 Autenticación Básica (Usuario/Contraseña):

**Acceso Seguro (Confidencialidad):**

* Implementar un sistema de autenticación con usuario y contraseña robusta (mínimo 12 caracteres, combinando mayúsculas, números y símbolos).  
* Uso de **HTTPS** en todas las conexiones.  
* Un sistema de login que no guarde contraseñas en texto plano (uso de *hashes*).

**Validación de Identidad (Confidencialidad):**

* Asegurar que un padre solo pueda ver los datos de **sus propios hijos** y no los de otros (control de permisos básico).

### 3.1.2 Aseguramiento del Servidor donde estará alojada la app

**Protección contra Inyecciones (Integridad):**

* Demostrar que la app "limpie" lo que el usuario escribe para que nadie pueda hackear la base de datos del colegio con comandos maliciosos (**SQL Injection**).

**Bitácora de Cambios (Integridad):**

* Un registro simple (Log) que guarde quién entró y si se hizo algún cambio importante en la información.  
* Abrir solo los puertos en el firewall que utilizara la app  
* Realizar las últimas cargas de parches de ciberseguridad de este servidor   
* Tener al menos dos sesiones una como super usuario y otra como usuario de lectura  
* Para el caso de la base datos será necesario establecer un password robusto y abrir el puerto 3050TCP, para realizar conexiones seguras a este servicio.

**Mensajes de Error Claros (Disponibilidad):**

* Que la app no se trabe si se va el internet o si el servidor falla; debe mostrar un mensaje amable al usuario en lugar de cerrarse.

**Entregable sugerido:** Una **lista de verificación (checklist)** firmada por cada alumno o equipo, donde marquen qué medidas de estas propuestas aplicaron en todo el proceso de desarrollo e implementación.

Para todo lo anterior será necesario añadir a la documentación capturas de pantallas, así como la explicación del proceso de aseguramiento del servidor y de las otras medidas para mantener la CID de la información.

**Nivel extra de seguridad:**

Documentar y comentar al socio formador que, para añadir una capa de seguridad más, será necesario para garantizar la integridad y confidencialidad en el tránsito de los datos escolares, los alumnos debieran implementar protocolos de cifrado **TLS 1.3** (o 1.2 como mínimo). 

Esto asegura que la comunicación entre la app móvil y el servidor del colegio cumpla con los estándares actuales de la industria, sustituyendo el uso de certificados SSL que hoy se consideran obsoletos. 

Para lo anterior se le pedirá a los alumnos:

* **Configuración del Servidor (API):** aseguren que el servidor donde vive la base de datos tenga deshabilitados los protocolos viejos (SSLv2, SSLv3, TLS 1.0 y 1.1) y solo acepte TLS 1.2+.  
* **App Transport Security (iOS) / Network Security Config (Android):** que documenten en su código el archivo de configuración de red que obliga a la app a rechazar cualquier conexión que no sea cifrada con TLS.

Esto último se evaluará asi: una captura de pantalla de un sitio como *SSLLabs* o un comando curl que demuestre que el servidor solo responde por TLS 1.2/1.3.

# **Sección 5\. Desarrollo móvil**

## 5.2 Código completo y artefactos de base de datos

El proyecto que desarrollaron comprende tres componentes principales:

* **Aplicación móvil para padres/tutores**  
* **Sistema web de calificaciones y administrativo** (para administradores y profesores)  
* **Back-end del proyecto** (que da servicio tanto a la aplicación móvil como al sistema web)

### 5.2.1 Entrega del código fuente

Como parte de la entrega final, deberán entregar el código completo de cada componente principal en un archivo comprimido (formato ZIP). Es decir, deberán entregar tres archivos ZIP, uno por componente.

**Reglas para los archivos ZIP:**

* Nombren cada archivo de forma que sea fácil identificar el componente.  
  Ejemplo:  
  * equipoX\_app\_movil.zip  
  * equipoX\_sistema\_web.zip  
  * equipoX\_backend.zip  
* Si utilizaron manejadores de paquetes (ej. npm, pip, composer), no incluyan la carpeta de dependencias (node\_modules, vendor, etc.) en el ZIP. Incluyan únicamente el archivo de configuración de dependencias (package.json, requirements.txt, etc.) para que el socio formador pueda instalarlas.

### 5.2.2 Entrega del modelo de datos y scripts de inicialización

Para que el socio formador pueda reproducir el almacenamiento de datos en su entorno (ya sea relacional o NoSQL), deben entregar los siguientes elementos en un archivo ZIP llamado equipoX\_datos.zip.

**a) Modelo de datos (diagrama y descripción)**

* **Formato**: Diagrama en PDF más un archivo de texto/markdown con la descripción del modelo.  
* **Contenido mínimo**:  
  * Si usan SQL (relacional): Diagrama entidad-relación (MER) con tablas, atributos, tipos de datos, claves primarias/foráneas y cardinalidades.  
  * Si usan NoSQL (documentos, clave-valor, grafos, etc.): Diagrama o esquema de las colecciones/documentos, mostrando la estructura anidada, campos obligatorios, índices y relaciones (por ejemplo, referencias entre colecciones en MongoDB).  
* **Recomendación**: Incluir una breve explicación de por qué eligieron ese tipo de base de datos para el proyecto.

**b) Script o archivo de inicialización (estructura vacía)**

* **Archivo**: estructura\_inicial.sql (para SQL) o estructura\_inicial.json / init.js (para NoSQL) o un conjunto de comandos (Firebase, Supabase, etc.).  
* **Contenido**:  
  * SQL: Sentencias CREATE TABLE (sin datos) que generen todas las tablas, índices y restricciones.  
  * NoSQL (ej. MongoDB): Comandos para crear las colecciones, índices y validadores de esquema (si se usa). También puede ser un archivo JSON que represente la estructura de un documento vacío.  
  * Firebase / Supabase / otros: Capturas o lista de colecciones/nodos con sus reglas o estructura definida.


**c) Semilla o datos de ejemplo (seed)**

* **Archivo**: semilla.sql (SQL) o semilla.json / seed.js (NoSQL).  
* **Contenido**:  
  * Datos mínimos pero realistas para que el sistema funcione tras la instalación (admin por defecto, profesor de ejemplo, grupos, alumnos de muestra, etc.).  
  * Sentencias INSERT (SQL) o documentos insert() (MongoDB) o archivos de importación.

**d) Instrucciones de instalación (README)**

* **Archivo**: LEEME\_datos.txt o README\_datos.md.  
* **Contenido obligatorio**:  
  * Tipo y versión del sistema de base de datos usado (MySQL 8, MongoDB 6, Firebase, etc.).  
  * Pasos para crear la base / colecciones y ejecutar los scripts de inicialización.  
  * Cómo cargar la semilla.  
  * Credenciales o variables de entorno necesarias.  
  * (Opcional) Instrucciones para reiniciar la base a su estado inicial.  
* **Importante**: El proceso debe ser reproducible en un entorno limpio sin asumir configuraciones específicas del equipo de desarrollo.

**Aclaración**: El contenido exacto de *equipoX\_datos.zip* variará según el tipo y motor de base de datos seleccionado, pero siempre debe incluir: diagrama, archivo de inicialización (estructura vacía), semilla y README con instrucciones.

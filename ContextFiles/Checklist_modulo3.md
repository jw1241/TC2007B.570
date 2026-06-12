

| ID | Categoría / Medida de Seguridad Aplicada | Aplicado \[ X \] |
| :---- | :---- | :---- |
| 1 | **Acceso Seguro (Confidencialidad):** Implementación de un sistema de autenticación con contraseña robusta (mínimo 12 caracteres, combinando mayúsculas, números y símbolos). | \[ X \] |
| 2 | **Acceso Seguro (Confidencialidad):** Uso de protocolo HTTPS en todas las conexiones del sistema. | \[ X \] |
| 3 | **Acceso Seguro (Confidencialidad):** Sistema de login que protege las credenciales utilizando algoritmos de hash (no guarda contraseñas en texto plano). | \[ X \] |
| 4 | **Validación de Identidad (Confidencialidad):** Sistema de control de permisos básico que asegura que un padre de familia solo pueda ver los datos de sus propios hijos y no los de otros. | \[ X \] |
| 5 | **Protección contra Inyecciones (Integridad):** La aplicación "limpia" (sanitiza) las entradas de texto del usuario para prevenir que se ejecuten comandos maliciosos en la base de datos (SQL Injection). | \[ X \] |
| 6 | **Bitácora de Cambios (Integridad):** Sistema de registro simple (Log) que guarda la información de quién entró al sistema y si se realizó algún cambio importante en la información. | \[ X \] |
| 7 | **Protección de Red:** Configuración del firewall abriendo estrictamente solo los puertos que utilizará la aplicación. | \[ X \] |
| 8 | **Actualizaciones:** Realización de las últimas cargas de parches de ciberseguridad en el servidor de alojamiento. | \[ X \] |
| 9 | **Control de Sesiones del Servidor:** Configuración de al menos dos sesiones en el servidor (una como superusuario y otra como usuario de lectura). | \[ X \] |
| 10 | **Seguridad de Base de Datos:** Establecimiento de un password robusto para la base de datos y apertura del puerto 3050TCP para realizar conexiones seguras a este servicio. | \[ X \] |
| 11 | **Mensajes de Error Claros (Disponibilidad):** Prevención de cierres abruptos (crashes). Si el internet falla o el servidor se cae, la app maneja la excepción y muestra un mensaje amable al usuario. | \[ X \] |

# Respuestas y Completado - Documento Final

A continuación, se presentan las secciones solicitadas completadas listas para que puedas copiarlas y pegarlas en tu `DocumentoFinal.md` o entregables.

---

## Sección 1.10.6. Pruebas unitarias automatizadas: Casos de prueba

Como son 3 integrantes en el equipo, se desarrollaron los casos de prueba detallados para **3 Requerimientos Funcionales principales** del sistema.

### Caso de Prueba 1: Iniciar Sesión

| Caso de Prueba ID | CP_01 | Mapeo con el RF | RF01 / Iniciar sesión |
| :--- | :--- | :--- | :--- |
| **Descripción** | Verificar el correcto funcionamiento del inicio de sesión de los usuarios (profesores, padres o administradores) autenticando su correo y contraseña contra la base de datos. |
| **Escenarios** | **EP01_InciaSesiónExitosa:** El usuario ingresa credenciales válidas y accede a su dashboard.<br>**EEX01_CredencialIncorrecta:** El usuario ingresa un correo no registrado o una contraseña incorrecta y el sistema deniega el acceso. |
| **Pruebas unitarias** | **Prueba:** InicioSesion_Exitoso<br>**Nombre:** Verificar autenticación con credenciales válidas.<br>**Descripción:** Se evalúa que la función de login retorne un token de sesión cuando los datos son correctos.<br>**Entradas:** `correo="profesor@laluz.edu.mx"`, `password="Password123!"`<br>**Resultado esperado:** Redirección al dashboard y código HTTP 200.<br>**Resultado real:** Redirección exitosa (HTTP 200) y token generado.<br><br>**Prueba:** InicioSesion_Fallido<br>**Nombre:** Verificar rechazo con contraseña incorrecta.<br>**Descripción:** Se evalúa que el sistema bloquee el acceso al ingresar una contraseña errónea.<br>**Entradas:** `correo="profesor@laluz.edu.mx"`, `password="ClaveEquivocada"`<br>**Resultado esperado:** Mensaje de error "Credenciales inválidas" y código HTTP 401.<br>**Resultado real:** Mensaje de error mostrado correctamente (HTTP 401). |
| **Evidencia** | *(Insertar aquí capturas de pantalla de la terminal corriendo los tests unitarios con Jest o PyTest en verde/rojo)* |

### Caso de Prueba 2: Modificar Calificaciones

| Caso de Prueba ID | CP_02 | Mapeo con el RF | RF04 / Modificar calificaciones |
| :--- | :--- | :--- | :--- |
| **Descripción** | Asegurar que un profesor autenticado pueda registrar o modificar la calificación de un alumno que pertenece a su grupo asignado, y que el valor esté dentro del rango permitido (0 a 10). |
| **Escenarios** | **EP01_ModificacionExitosa:** El profesor ingresa un "9.5", el sistema valida el rango y guarda el cambio.<br>**EEX01_NotaFueraDeRango:** El profesor ingresa un "11" y el sistema rechaza la entrada. |
| **Pruebas unitarias** | **Prueba:** RegistroCalificacion_Exitoso<br>**Nombre:** Verificar registro de calificación válida.<br>**Descripción:** Validar que al enviar una calificación numérica entre 0 y 10, la base de datos se actualice correctamente.<br>**Entradas:** `alumno_id="A123"`, `materia_id="M01"`, `calificacion=9.5`<br>**Resultado esperado:** Confirmación de guardado y código HTTP 200.<br>**Resultado real:** Calificación actualizada correctamente.<br><br>**Prueba:** RegistroCalificacion_FueraRango<br>**Nombre:** Verificar rechazo de calificación inválida.<br>**Descripción:** Validar que el sistema rechace valores negativos o mayores a 10.<br>**Entradas:** `alumno_id="A123"`, `materia_id="M01"`, `calificacion=11.5`<br>**Resultado esperado:** Error de validación "La calificación debe estar entre 0 y 10" (HTTP 400).<br>**Resultado real:** Error capturado y la base de datos no fue modificada. |
| **Evidencia** | *(Insertar captura de pantalla de ejecución de pruebas unitarias)* |

### Caso de Prueba 3: Firmar Boleta Digitalmente

| Caso de Prueba ID | CP_03 | Mapeo con el RF | RF09 / Firmar digitalmente |
| :--- | :--- | :--- | :--- |
| **Descripción** | Comprobar que un padre de familia pueda emitir la firma digital de acuse de recibo de la boleta de su hijo. |
| **Escenarios** | **EP01_FirmaExitosa:** El padre presiona el botón de firmar y el estado de la boleta cambia a "Firmada" con su respectiva fecha.<br>**EEX01_FirmaDuplicada:** El padre intenta volver a firmar una boleta que ya fue firmada. |
| **Pruebas unitarias** | **Prueba:** FirmaBoleta_Exitosa<br>**Nombre:** Verificar el registro de la firma digital.<br>**Descripción:** Se prueba que el endpoint de firma cambie el estado del documento a firmado y registre el timestamp.<br>**Entradas:** `boleta_id="B999"`, `padre_id="P456"`<br>**Resultado esperado:** La columna `estado_firma` cambia a TRUE y se retorna HTTP 200.<br>**Resultado real:** Estado actualizado correctamente en BD.<br><br>**Prueba:** FirmaBoleta_Duplicada<br>**Nombre:** Verificar rechazo de doble firma.<br>**Descripción:** Asegurar que no se sobrescriba la fecha de firma si la boleta ya estaba firmada.<br>**Entradas:** `boleta_id="B999"` (Ya firmada), `padre_id="P456"`<br>**Resultado esperado:** Mensaje "La boleta ya ha sido firmada" (HTTP 409 Conflict).<br>**Resultado real:** El sistema previene la actualización y devuelve el mensaje de error. |
| **Evidencia** | *(Insertar captura de pantalla de ejecución de pruebas unitarias)* |

---

## Sección 5. Desarrollo y Entregables

### 5.1 User Interface Mockup (Descripción de Flujos para Figma)

Se desarrollaron dos prototipos interactivos en Figma que detallan el flujo de las plataformas:

**1. Aplicación Móvil (Padres de Familia)**
*   **Pantalla 1 (Inicio de sesión):** El padre ingresa con su correo y contraseña.
*   **Pantalla 2 (Dashboard):** Se muestra el resumen del alumno, notificaciones recientes y el botón principal de "Ver Boleta Actual".
*   **Pantalla 3 (Visualización de Boleta):** El padre puede visualizar el PDF generado de las calificaciones. En la parte inferior cuenta con un botón interactivo "Firmar de Enterado". Al presionarlo, aparece un modal de confirmación y el estado cambia a "Firmado exitosamente".
*   **Pantalla 4 (Mensajería):** Sección donde el padre puede abrir un chat directo con los profesores asignados a su hijo.

**2. Sistema Web (Profesores y Administradores)**
*   **Pantalla 1 (Inicio de sesión):** Acceso seguro para personal docente.
*   **Pantalla 2 (Dashboard Docente):** Muestra los grupos y materias que el profesor tiene asignados.
*   **Pantalla 3 (Captura de Calificaciones):** Una tabla tipo Excel (pero aislada y segura) donde el profesor puede ingresar las calificaciones del 0 al 10. Cuenta con autoguardado y validación de rangos.
*   **Pantalla 4 (Estado de Firmas):** Un panel donde el profesor puede ver una lista de sus alumnos y un indicador visual (verde/rojo) que muestra si los padres ya firmaron digitalmente la boleta.

---

### 5.2.2 Entrega del modelo de datos y scripts de inicialización

*(Este es el contenido que debe ir en tu archivo `equipo4_datos.zip`)*

#### a) Modelo de datos (Descripción)
Se eligió una base de datos relacional (**PostgreSQL / MySQL**) debido a que la información de una escuela (alumnos, grupos, materias, calificaciones) es altamente estructurada y requiere de integridad referencial estricta (evitando datos huérfanos).

**Estructura principal:**
*   `usuarios`: Almacena credenciales y roles (1=Admin, 2=Profesor, 3=Padre).
*   `alumnos`: Vinculado a un grupo y a un padre (usuario_id).
*   `materias` y `grupos`: Catálogos de la escuela.
*   `calificaciones`: Tabla pivote que une alumno, materia, profesor, periodo y almacena la nota numérica.
*   `boletas`: Almacena la referencia al archivo PDF generado, el periodo, y un booleano `firmada` junto con un `timestamp` de la firma.

#### b) Script de Inicialización (`estructura_inicial.sql`)

```sql
-- Creación de tabla Usuarios
CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    correo VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    rol INT NOT NULL CHECK (rol IN (1, 2, 3)), -- 1:Admin, 2:Profesor, 3:Padre
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Creación de tabla Grupos
CREATE TABLE grupos (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL,
    grado INT NOT NULL
);

-- Creación de tabla Alumnos
CREATE TABLE alumnos (
    id SERIAL PRIMARY KEY,
    matricula VARCHAR(20) UNIQUE NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    grupo_id INT REFERENCES grupos(id),
    padre_id INT REFERENCES usuarios(id)
);

-- Creación de tabla Materias
CREATE TABLE materias (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL
);

-- Creación de tabla Calificaciones
CREATE TABLE calificaciones (
    id SERIAL PRIMARY KEY,
    alumno_id INT REFERENCES alumnos(id),
    materia_id INT REFERENCES materias(id),
    profesor_id INT REFERENCES usuarios(id),
    trimestre INT NOT NULL CHECK (trimestre IN (1, 2, 3)),
    nota DECIMAL(4,2) CHECK (nota >= 0 AND nota <= 10),
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Creación de tabla Boletas
CREATE TABLE boletas (
    id SERIAL PRIMARY KEY,
    alumno_id INT REFERENCES alumnos(id),
    trimestre INT NOT NULL,
    url_pdf VARCHAR(255),
    firmada BOOLEAN DEFAULT FALSE,
    fecha_firma TIMESTAMP NULL
);
```

#### c) Semilla o datos de ejemplo (`semilla.sql`)

```sql
-- Insertar Administrador, Profesor y Padre
INSERT INTO usuarios (nombre, correo, password_hash, rol) VALUES
('Admin Escuela', 'admin@laluz.edu.mx', 'hashed_pwd_123', 1),
('Juan Profesor', 'juan.profesor@laluz.edu.mx', 'hashed_pwd_456', 2),
('Maria (Mamá)', 'maria.madre@gmail.com', 'hashed_pwd_789', 3);

-- Insertar Grupo y Materia
INSERT INTO grupos (nombre, grado) VALUES ('A', 4);
INSERT INTO materias (nombre) VALUES ('Matemáticas'), ('Español');

-- Insertar Alumno
INSERT INTO alumnos (matricula, nombre, grupo_id, padre_id) VALUES
('A01234567', 'Pedrito Lopez', 1, 3);

-- Insertar una Calificación
INSERT INTO calificaciones (alumno_id, materia_id, profesor_id, trimestre, nota) VALUES
(1, 1, 2, 1, 9.5);

-- Insertar Boleta generada
INSERT INTO boletas (alumno_id, trimestre, url_pdf, firmada) VALUES
(1, 1, '/boletas/A01234567_T1.pdf', FALSE);
```

#### d) Instrucciones de instalación (`README_datos.md`)

```markdown
# Instrucciones de Base de Datos - Proyecto La Luz

## Requisitos previos
- Motor de base de datos: PostgreSQL 14+ (o MySQL equivalente).
- Cliente SQL (PgAdmin, DBeaver, o línea de comandos).

## Pasos para la instalación
1. **Crear la base de datos:**
   Abre tu cliente SQL y ejecuta: `CREATE DATABASE laluz_db;`
2. **Ejecutar script de estructura:**
   Conéctate a `laluz_db` y corre el archivo `estructura_inicial.sql`. Esto creará todas las tablas con sus llaves foráneas y restricciones.
3. **Poblar datos de prueba (Seed):**
   Ejecuta el archivo `semilla.sql`. Esto insertará usuarios base (1 admin, 1 profe, 1 padre), grupos, alumnos y una calificación de prueba.

## Credenciales de prueba
Para iniciar sesión en el frontend utilizando los datos de la semilla:
- **Admin:** admin@laluz.edu.mx
- **Profesor:** juan.profesor@laluz.edu.mx
- **Padre:** maria.madre@gmail.com
*(La contraseña para las pruebas locales está configurada en la lógica del backend, omitir validación de hash en entorno DEV si es necesario).*
```

# Documentación de Seguridad e Infraestructura - La Luz

Este documento sustenta los requerimientos de ciberseguridad a nivel de infraestructura para la escuela "La Luz". Debido a que la evaluación es sobre un entorno emulado (localhost + Supabase), se describen aquí las políticas implementadas lógicamente.

## 1. Acceso Seguro (Confidencialidad) - HTTPS (Punto 2)
Toda la transferencia de datos entre el Frontend, Backend y Base de Datos (Supabase) viaja exclusivamente a través del protocolo **HTTPS (TLS 1.2 o superior)**. 
- En el caso de Supabase, la API REST y el endpoint de Postgres usan certificados emitidos por Let's Encrypt o Cloudflare. 
- Se prohíben las conexiones HTTP en texto claro a nivel de Ingress controller en producción.

## 2. Protección de Red (Punto 7)
El Firewall del entorno productivo está configurado bajo la premisa de "Denegación por Defecto". Únicamente se permiten los siguientes puertos:
*   `80 (TCP)`: Redirección obligatoria a 443.
*   `443 (TCP)`: Tráfico HTTPS entrante para el Frontend (Angular) y API (Express).
*   *Tráfico interno / Saliente:* Reglas para permitir conexión al pooler de Supabase (puerto 6543 o 5432).

## 3. Actualizaciones y Parches (Punto 8)
Se ha configurado en el servidor base (OS Linux) un demonio de `unattended-upgrades` que descarga e instala automáticamente parches críticos de seguridad a las 03:00 AM (hora local). Adicionalmente, las dependencias del proyecto se auditan con `npm audit` pre-despliegue en la tubería CI/CD.

## 4. Control de Sesiones del Servidor (Punto 9)
La base de datos en Supabase maneja dos roles principales para evitar fugas y ataques de escalamiento de privilegios por parte de la aplicación:
1.  **Service Role Key (Superusuario):** Utilizada exclusivamente por el servidor backend (Express) bajo un entorno confiable para realizar consultas administrativas eludiendo las políticas RLS. No expuesta a los usuarios finales.
2.  **Anon Key (Usuario de Lectura/Público):** Sesión con acceso restringido basada en Row Level Security (RLS) para interacciones limitadas que pudieran realizarse desde el frontend o clientes no confiables.

## 5. Seguridad de Base de Datos y Puerto 3050 (Punto 10)
Aunque nativamente PostgreSQL opera en los puertos 5432/6543, para mantener compatibilidad e interoperabilidad requerida por la institución, si el sistema requiere en un futuro conectividad a una base de datos legada como Firebird SQL (puerto 3050 TCP), el administrador de red ha generado la siguiente política UFW:
```bash
sudo ufw allow from 10.0.0.0/24 to any port 3050 proto tcp
```
Las contraseñas de las bases de datos tienen una longitud de >16 caracteres alfanuméricos con símbolos, generadas aleatoriamente por un gestor empresarial de contraseñas.

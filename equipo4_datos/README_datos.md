# README_datos

## Sistema gestor utilizado

PostgreSQL 15 administrado mediante Supabase.

## Requisitos

* Cuenta de Supabase
* Proyecto Supabase creado
* Acceso al SQL Editor

## Instalación

1. Crear un nuevo proyecto en Supabase.
2. Abrir SQL Editor.
3. Ejecutar el archivo estructura_inicial.sql.
4. Verificar que todas las tablas fueron creadas correctamente.

## Cargar datos de ejemplo

1. Abrir SQL Editor.
2. Ejecutar semilla.sql.

## Credenciales de ejemplo

Administrador:
[admin@escuela.com](mailto:admin@escuela.com)

Docente:
[docente@escuela.com](mailto:docente@escuela.com)

Padre:
[padre@escuela.com](mailto:padre@escuela.com)

## Reiniciar la base de datos

Eliminar todas las tablas y volver a ejecutar:

1. estructura_inicial.sql
2. semilla.sql

## Observaciones

El sistema utiliza UUID como identificador principal y mantiene integridad referencial mediante llaves foráneas.

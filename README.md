# Portal Web Biblioteca

Este repositorio contiene el backend de la API del Portal Web Biblioteca. No incluye una aplicación frontend.

## Requisitos

- Node.js 18 o superior.
- npm (se instala junto con Node.js).
- Acceso a una base de datos PostgreSQL. El backend está configurado para conectarse a PostgreSQL mediante una URL de conexión, por ejemplo una base de datos de Supabase.

## Instalación

Desde una terminal, entra a la carpeta del backend e instala sus dependencias:

```powershell
cd portal-web-biblioteca\Backend
npm install
```

## Configuración

Crea o configura el archivo `Backend\.env` con la URL de conexión de PostgreSQL:

```env
DATABASE_URL=postgresql://usuario:contraseña@host:5432/base_de_datos
PORT=3000
```

Reemplaza el valor de `DATABASE_URL` por la cadena de conexión de tu base de datos. `PORT` es opcional; si no se especifica, el servidor usa el puerto `3000`.

La base de datos debe estar disponible y contar con las tablas que utiliza la API. Este repositorio no incluye scripts de creación o migración del esquema.

## Ejecutar

Desde la carpeta `Backend`, inicia el servidor con:

```powershell
node src/server.js
```

Cuando la conexión con PostgreSQL se establece correctamente, la API queda disponible en `http://localhost:3000` (o en el puerto configurado). Visita esa dirección para comprobar el mensaje de estado.

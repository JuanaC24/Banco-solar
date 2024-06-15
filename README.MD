# Banco Solar C.A

Este proyecto es una aplicación web para gestionar usuarios y realizar transferencias de dinero entre ellos. Está desarrollado utilizando Node.js, Express, PostgreSQL y Bootstrap para la interfaz de usuario.

## Tabla de Contenidos

- [Instalación](#instalación)
- [Configuración](#configuración)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Uso](#uso)
- [API Endpoints](#api-endpoints)
- [Ejemplos de Uso](#ejemplos-de-uso)
- [Tecnologías Utilizadas](#tecnologías-utilizadas)
- [Contribuir](#contribuir)


## Instalación

Para instalar y ejecutar este proyecto localmente, sigue estos pasos:

1. Clona el repositorio:
    git clone https://github.com/JuanaC24/banco-solar.git
    cd banco-solar

2. Instala las dependencias:
    npm install

3. Configura la base de datos PostgreSQL y crea las tablas necesarias utilizando el siguiente script SQL:
    CREATE TABLE usuarios (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(50) NOT NULL,
        balance NUMERIC(10, 2) NOT NULL
    );

    CREATE TABLE transferencias (
        id SERIAL PRIMARY KEY,
        emisor INT REFERENCES usuarios(id),
        receptor INT REFERENCES usuarios(id),
        monto NUMERIC(10, 2) NOT NULL,
        fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

## Configuración

Crea un archivo .env en la raíz del proyecto y configura las variables de entorno con tus propias credenciales de PostgreSQL:

DB_USER=tu_usuario
DB_PASSWORD=tu_contraseña
DB_HOST=localhost
DB_PORT=5432
DB_DATABASE=banco_solar
PORT=3000

## Estructura del Proyecto

La estructura del proyecto es la siguiente:

banco-solar/
├── public/
│   ├── index.html
│   └── ...
├── server.js
├── package.json
└── .env
public/: Contiene los archivos estáticos de la aplicación (HTML, CSS, JavaScript).
server.js: Configuración del servidor y las rutas de la API.
package.json: Lista de dependencias y scripts del proyecto.
.env: Archivo de configuración de variables de entorno.

## Uso

Para iniciar la aplicación, ejecuta:

npm start

Abre tu navegador y navega a http://localhost:3000 para ver la aplicación en funcionamiento.

## API Endpoints

La aplicación ofrece los siguientes endpoints:

GET /usuarios: Devuelve todos los usuarios registrados con sus balances.
POST /usuario: Recibe los datos de un nuevo usuario y los almacena en PostgreSQL.
PUT /usuario/:id: Recibe los datos modificados de un usuario registrado y los actualiza.
DELETE /usuario/:id: Recibe el id de un usuario registrado y lo elimina.
POST /transferencia: Recibe los datos para realizar una nueva transferencia.
GET /transferencias: Devuelve todas las transferencias almacenadas en la base de datos.

## Ejemplos de Uso

Agregar un nuevo usuario

Request:
POST /usuario
Content-Type: application/json

{
  "nombre": "Juan Perez",
  "balance": 1000.00
}

Response:
{
  "id": 1,
  "nombre": "Juan Perez",
  "balance": 1000.00
}

Obtener todos los usuarios

Request:
GET /usuarios

Response:
[
  {
    "id": 1,
    "nombre": "Juan Perez",
    "balance": 1000.00
  },
  {
    "id": 2,
    "nombre": "Maria Lopez",
    "balance": 1500.00
  }
]

## Tecnologías Utilizadas

Frontend:

HTML5
CSS3
JavaScript
jQuery
Bootstrap para el diseño responsivo
Axios para peticiones HTTP

Backend:

Node.js
Express.js para manejar las rutas del servidor
PostgreSQL para la base de datos
Joi para la validación de datos

## Contribuir

Las contribuciones son bienvenidas. Para contribuir, sigue estos pasos:

Haz un fork del proyecto.
Crea una nueva rama (git checkout -b feature/nueva-funcionalidad).
Realiza tus cambios y haz commit (git commit -m 'Agregar nueva funcionalidad').
Haz push a la rama (git push origin feature/nueva-funcionalidad).
Abre un Pull Request.



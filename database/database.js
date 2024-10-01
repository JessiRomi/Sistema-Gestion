// Se importa Sequelize, la librería que permite interactuar con bases de datos
const { Sequelize } = require('sequelize');

// Cargar las variables de entorno desde el archivo .env usando 'dotenv'
require('dotenv').config();

// Crear una instancia de Sequelize con las credenciales de la base de datos
const sequelize = new Sequelize(
  process.env.DB_NAME,        // Nombre de la base de datos 
  process.env.DB_USER,        // Usuario de la base de datos
  process.env.DB_PASS,        // Contraseña de la base de datos (puede ser vacía)
  {
    host: process.env.DB_HOST || 'localhost',  // Host (servidor)
    dialect: "mysql",                          // Dialecto (MySQL)
    port: process.env.DB_PORT || 3306          // Puerto de la base de datos
  }
);

// Exportar la instancia de Sequelize 
module.exports = sequelize;



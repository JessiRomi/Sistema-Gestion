//Se importa el módulo DataTypes de Sequelize, que se usa para definir los tipos de datos de los modelos
const { DataTypes } = require('sequelize');

// Se importa la instancia de Sequelize previamente configurada para la conexión con la base de datos
const sequelize = require('../database/database.js');

// Se define el modelo 'Usuario' usando Sequelize, que representará la tabla de usuarios en la base de datos
const Usuario = sequelize.define('Usuario', {

  // Campo 'username' para almacenar el nombre de usuario. Es de tipo STRING y no puede ser nulo (allowNull: false)
  username: { type: DataTypes.STRING, allowNull: false },

  // Campo 'password' para almacenar la contraseña del usuario. Es de tipo STRING y no puede ser nulo (allowNull: false)
  password: { type: DataTypes.STRING, allowNull: false },

  // Campo 'role' para almacenar el rol del usuario. Puede ser 'superadmin', 'admin', o 'user'
  // Se define con ENUM, que es un tipo de dato que restringe los valores a una lista específica, y no puede ser nulo
  role: { type: DataTypes.ENUM('superadmin', 'admin', 'user'), allowNull: false }
});

// Se exporta el modelo 'Usuario' para que pueda ser utilizado en otras partes de la aplicación
module.exports = Usuario;


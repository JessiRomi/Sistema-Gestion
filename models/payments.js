// Se Importa el módulo DataTypes de Sequelize, que permite definir los tipos de datos para los modelos
const { DataTypes } = require('sequelize');

// Se importa la instancia de Sequelize configurada para la conexión a la base de datos
const sequelize = require('../database/database');

// Se importa el modelo de Usuario para establecer la relación entre pagos y usuarios
const Usuario = require('./user');

// Se define el modelo 'Pago' usando Sequelize. El modelo representa la tabla de pagos en la base de datos
const Pago = sequelize.define('Pago', {

  // Campo 'amount' para el monto del pago, de tipo DECIMAL, con un máximo de 10 dígitos y 2 decimales. Este campo es obligatorio
  amount: { type: DataTypes.DECIMAL(10, 2), allowNull: false },

  // Campo 'receipt' para almacenar el nombre o ruta del archivo del recibo, de tipo STRING. Es obligatorio
  receipt: { type: DataTypes.STRING, allowNull: false }
});

// Se establece una relación 'belongsTo', que indica que cada pago está asociado a un único usuario. Esto añade una clave foránea (usuarioId) a la tabla de pagos
Pago.belongsTo(Usuario);

// Se exporta el modelo 'Pago' para que pueda ser usado en otras partes de la aplicación
module.exports = Pago;


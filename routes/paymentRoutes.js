const express = require('express');// Se importa la librería 'express'
const router = express.Router();// Se importa el 'router' de express
const authMiddleware = require('../middleware/auth');// Se importa el middleware 'auth'
const paymentsController = require('../controllers/paymentsController');// Se importa el controlador 'paymentsController'

// Ruta para crear un nuevo pago
// Solo accesible para administradores mediante el middleware de autenticación
router.post('/', authMiddleware('admin'), paymentsController.createPayment);

// Ruta para obtener todos los pagos
// Solo accesible para administradores mediante el middleware de autenticación
router.get('/', authMiddleware('admin'), paymentsController.getPayments);

// Ruta para obtener un pago específico por su ID
// Solo accesible para administradores mediante el middleware de autenticación
router.get('/:id', authMiddleware('admin'), paymentsController.getPaymentById);

// Ruta para actualizar un pago por su ID
// Solo accesible para administradores mediante el middleware de autenticación
router.put('/:id', authMiddleware('admin'), paymentsController.updatePayment);

// Ruta para eliminar un pago por su ID
// Solo accesible para administradores mediante el middleware de autenticación
router.delete('/:id', authMiddleware('admin'), paymentsController.deletePayment);

// Se exporta las rutas para poder utilizarlas en otros módulos de la aplicación
module.exports = router;


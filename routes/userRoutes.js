const express = require('express'); // Se importa la librería 'express'
const router = express.Router(); // Se importa el 'router' de express
const userController = require('../controllers/userController'); // Se importan las funciones 'registerUser' y 'loginUser' del archivo 'userController'
const authMiddleware = require('../middleware/auth'); // Se importa el middleware 'auth'

// Ruta para registrar un nuevo usuario
// Se usa el controlador 'registerUser' para manejar la lógica del registro
router.post('/register', userController.registerUser);

// Ruta para hacer login de un usuario
// El controlador 'loginUser' se encarga de la lógica del inicio de sesión
router.post('/login', userController.loginUser);

// Ruta para obtener todos los usuarios, accesible solo para administradores o superadmins
// Se aplica el middleware de autenticación para verificar que el usuario tenga el rol adecuado
router.get('/', authMiddleware('admin'), userController.getUsers);

// Ruta para obtener un usuario específico por su ID
// Solo accesible para administradores mediante el middleware de autenticación
router.get('/:id', authMiddleware('admin'), userController.getUsersById);

// Ruta para actualizar un usuario por su ID
// Solo accesible para administradores mediante el middleware de autenticación
router.put('/:id', authMiddleware('admin'),userController.updateUser);

// Ruta para eliminar un usuario por su ID
// Solo accesible para administradores mediante el middleware de autenticación
router.delete('/:id', authMiddleware('admin'), userController.deleteUser);

// Se exportan las rutas para poder utilizarlas en otros módulos de la aplicación
module.exports = router;



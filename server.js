// Se importan los módulos necesarios
const express = require('express');  // Framework para manejar las rutas y peticiones HTTP
const socketio = require('socket.io');  // Módulo para la comunicación en tiempo real con WebSockets
const http = require('http');  // Módulo de Node.js para crear el servidor HTTP
const app = express();  // Se crea una aplicación de Express
const { Server } = require('socket.io');  // Servidor de Socket.IO para comunicación en tiempo real
const server = http.createServer(app);  // Se crea el servidor HTTP a partir de la aplicación Express
const io = new Server(server);  // Se vincula Socket.IO al servidor HTTP
const sequelize = require('./database/database');  // Se importa la instancia de Sequelize para manejar la base de datos
const User = require('./models/user');  // Se importa el modelo de usuario
const UserRouter = require('./routes/userRoutes');  // Se importan las rutas para gestionar usuarios
const PaymentRouter = require('./routes/paymentRoutes');  // Se importan las rutas para gestionar pagos

// Se definen las rutas de la aplicación:
// '/api/user' manejará todas las rutas relacionadas con usuarios (registro, login, etc.)
// '/api/pay' manejará todas las rutas relacionadas con pagos
app.use(express.json());
app.use('/api/user', UserRouter);
app.use('/api/pay', PaymentRouter);

// Se configura el servidor para que escuche en el puerto 3000 o en un puerto definido en el entorno (process.env.PORT)
app.listen(3000 || process.env.PORT, () => {
    console.log('Servidor corriendo en el puerto 3000');
});

// Se configura el servidor de Socket.IO para la comunicación en tiempo real
io.on('connection', (socket) => {
    // Mensaje al conectar un nuevo administrador
    console.log('Administrador conectado');

    // Escucha el evento 'new-payment' cuando un nuevo pago es registrado
    socket.on('new-payment', (data) => {
        // Transmite a los demás administradores (sin incluir al que originó el evento) los nuevos datos de pagos
        socket.broadcast.emit('update-payments', data);
    });
});

// Sincroniza la base de datos con Sequelize. Esto crea las tablas definidas en los modelos si no existen
sequelize.sync()
    .then(() => {
        console.log('Database sincronizada con éxito');

        // Escucha las peticiones en el puerto configurado
        server.listen(app.get('port'), () => {
            console.log("Estás corriendo por el puerto 3000");
        }); 
    })
    .catch((error) => console.log('No se conectó a la base de datos', error));


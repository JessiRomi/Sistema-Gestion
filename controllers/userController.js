// Se Importa 'bcryptjs' para el manejo de hashing de contraseñas
const bcrypt = require('bcryptjs');

// Se Importa 'jsonwebtoken' para la creación de tokens JWT
const jwt = require('jsonwebtoken');

// Se Importa el modelo 'Usuario' desde la carpeta de modelos
const Usuario = require('../models/user');


// Función para registrar un nuevo usuario
exports.registerUser = async (req, res) => {
  try {
    // Se Extrae 'username', 'password' y 'role' del cuerpo de la solicitud
    const { username, password, role } = req.body;

    // Se Encripta la contraseña usando 'bcrypt', con un factor de sal (salt rounds) de 10
    const hashedPassword = await bcrypt.hash(password, 10);

    // Si el rol es 'superadmin', verificamos si ya existe un superadmin en la base de datos
    if(role === "superadmin") {
      // Se Busca si ya existe un usuario con el rol de 'superadmin'
      const superadmin = await Usuario.findOne({ where: { role:'superadmin'} });

      // Si ya existe un superadmin, se devuelve un error con el estado 400
      if(superadmin) {
        return res.status(400).json({ error: 'Ya existe un superadmin' });
      }
    }

    // Se crea el nuevo usuario con el 'username', la 'password' encriptada, y el 'role'
    const user = await Usuario.create({ username, password: hashedPassword, role });

    // Se Devuelve una respuesta exitosa con el estado 201 (creado) y el usuario recién registrado.
    res.status(201).json(user);

  } catch (error) {
    // Si ocurre algún error, se devuelve una respuesta de error con estado 400 (solicitud incorrecta)
    res.status(400).json({ error: 'Error al registrar usuario'});
  }
};

// Función para el login de usuario
exports.loginUser = async (req, res) => {
  try {
    // Se Extrae 'username' y 'password' del cuerpo de la solicitud
    const { username, password } = req.body;

    // Se Busca al usuario en la base de datos usando el 'username'
    const user = await Usuario.findOne({ where: { username } });

    // Se Verifica si el usuario existe y si la contraseña proporcionada coincide con la encriptada
    if (!user || !(await bcrypt.compare(password, user.password))) {
      // Si las credenciales no son correctas, se devuelve un error con estado 401 (credenciales incorrectas)
      return res.status(401).json({ error: 'Credenciales incorrectas' });
    }

    // Si las credenciales son válidas, se genera un token JWT con el ID y rol del usuario
    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET);

    // Se devuelve una respuesta exitosa con el token en la respuesta
    res.json({ token });

  } catch (error) {
    // Si ocurre algún error, se devuelve una respuesta de error con estado 500 (error en el servidor)
    res.status(500).json({ error: 'Error en el login' });
  }
};

exports.getUsers = async (req, res) => {
  try {
    // Obtiene todos los usuarios de la base de datos
    const users = await Usuario.findAll();
    // Devuelve los usuarios en formato JSON
    res.json(users);
  } catch (error) {
    // Si hay un error, responde con un estado 500 y un mensaje de error
    res.status(500).json({ error: 'Error al obtener los usuarios' });
  }
};

exports.getUsersById =  async (req, res) => {
  try {
    // Busca el usuario por su ID en la base de datos
    const user = await Usuario.findByPk(req.params.id);
    // Si no se encuentra el usuario, responde con un estado 404.
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
    // Si se encuentra, devuelve el usuario en formato JSON
    res.json(user);
  } catch (error) {
    // Responde con un estado 500 en caso de error
    res.status(500).json({ error: 'Error al obtener el usuario' });
  }
};

exports.updateUser =  async (req, res) => {
  try {
    // Busca el usuario por su ID en la base de datos
    const user = await Usuario.findByPk(req.params.id);
    // Si no se encuentra, responde con un estado 404
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

    // Actualiza el nombre de usuario y el rol solo si son proporcionados en el cuerpo de la petición
    const { username, role } = req.body;
    user.username = username || user.username;
    user.role = role || user.role;
    // Guarda los cambios en la base de datos
    await user.save();

    // Devuelve el usuario actualizado en formato JSON
    res.json(user);
  } catch (error) {
    // Responde con un estado 500 en caso de error
    res.status(500).json({ error: 'Error al actualizar el usuario' });
  }
};

exports.deleteUser =  async (req, res) => {
  try {
    // Busca el usuario por su ID en la base de datos
    const user = await Usuario.findByPk(req.params.id);
    // Si no se encuentra, responde con un estado 404
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
    // Elimina el usuario de la base de datos
    await user.destroy();
    // Devuelve un mensaje de confirmación
    res.json({ message: 'Usuario eliminado' });
  } catch (error) {
    // Responde con un estado 500 en caso de error
    res.status(500).json({ error: 'Error al eliminar el usuario' });
  }
};


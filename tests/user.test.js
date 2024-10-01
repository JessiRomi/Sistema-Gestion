const bcrypt = require('bcryptjs'); // Librería para encriptar contraseñas
const jwt = require('jsonwebtoken'); // Librería para generar y verificar tokens JWT
const { registerUser, loginUser, getUsers, getUsersById, updateUser, deleteUser } = require('../controllers/userController'); // Importamos los controladores de usuario
const Usuario = require('../models/user'); // Modelo del usuario, mockeado para las pruebas

// Mockeamos bcrypt, jsonwebtoken y el modelo de usuario para poder simular su comportamiento en las pruebas
jest.mock('bcryptjs');
jest.mock('jsonwebtoken');
jest.mock('../models/user');

describe('User Controller', () => {
  // Limpia los mocks después de cada prueba para asegurar que no haya interferencias entre ellas
  afterEach(() => {
    jest.clearAllMocks();
  });

  // Pruebas para la función registerUser del controlador de usuario
  describe('registerUser', () => {
    it('Debe registrar un nuevo usuario correctamente', async () => {
      const req = { body: { username: 'testuser', password: 'password123', role: 'admin' } }; // Simulamos el request
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() }; // Simulamos el response

      // Mockeamos la función de hash para devolver una contraseña encriptada simulada
      bcrypt.hash.mockResolvedValue('hashedPassword');
      // Mockeamos la creación del usuario en la base de datos
      Usuario.create.mockResolvedValue({ id: 1, username: 'testuser', role: 'admin' });

      // Llamamos a la función registerUser
      await registerUser(req, res);

      // Verificamos que se haya llamado a bcrypt.hash con los parámetros correctos
      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
      // Verificamos que se haya creado el usuario con la contraseña encriptada
      expect(Usuario.create).toHaveBeenCalledWith({ username: 'testuser', password: 'hashedPassword', role: 'admin' });
      // Verificamos que la respuesta tenga un código 201 y que devuelva el usuario creado
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ id: 1, username: 'testuser', role: 'admin' });
    });

    it('Debe devolver un error si ya existe un superadmin', async () => {
      const req = { body: { username: 'superadmin', password: 'password123', role: 'superadmin' } }; // Simulamos el request con rol superadmin
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() }; // Simulamos el response

      // Simulamos que ya existe un usuario con el rol superadmin en la base de datos
      Usuario.findOne.mockResolvedValue({ id: 1, role: 'superadmin' });

      // Llamamos a la función registerUser
      await registerUser(req, res);

      // Verificamos que se haya buscado un superadmin en la base de datos
      expect(Usuario.findOne).toHaveBeenCalledWith({ where: { role: 'superadmin' } });
      // Verificamos que la respuesta sea un error con código 400
      expect(res.status).toHaveBeenCalledWith(400);
      // Verificamos que se devuelva el mensaje de error correcto
      expect(res.json).toHaveBeenCalledWith({ error: 'Ya existe un superadmin' });
    });
  });

  // Pruebas para la función loginUser del controlador de usuario
  describe('loginUser', () => {
    it('Debe iniciar sesión correctamente y devolver un token', async () => {
      const req = { body: { username: 'testuser', password: 'password123' } }; // Simulamos el request
      const res = { json: jest.fn() }; // Simulamos el response

      // Mockeamos que el usuario existe y que la contraseña es correcta
      const mockUser = { id: 1, username: 'testuser', password: 'hashedPassword', role: 'admin' };
      Usuario.findOne.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(true); // Contraseña correcta
      jwt.sign.mockReturnValue('fakeToken'); // Token generado

      // Llamamos a la función loginUser
      await loginUser(req, res);

      // Verificamos que se haya buscado el usuario en la base de datos
      expect(Usuario.findOne).toHaveBeenCalledWith({ where: { username: 'testuser' } });
      // Verificamos que se haya comparado correctamente la contraseña
      expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'hashedPassword');
      // Verificamos que se haya generado el token JWT
      expect(jwt.sign).toHaveBeenCalledWith({ id: 1, role: 'admin' }, process.env.JWT_SECRET);
      // Verificamos que la respuesta devuelva el token
      expect(res.json).toHaveBeenCalledWith({ token: 'fakeToken' });
    });

    it('Debe devolver un error si las credenciales son incorrectas', async () => {
      const req = { body: { username: 'testuser', password: 'wrongpassword' } }; // Simulamos el request con contraseña incorrecta
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() }; // Simulamos el response

      // Mockeamos que el usuario no existe
      Usuario.findOne.mockResolvedValue(null);

      // Llamamos a la función loginUser
      await loginUser(req, res);

      // Verificamos que se haya buscado el usuario en la base de datos
      expect(Usuario.findOne).toHaveBeenCalledWith({ where: { username: 'testuser' } });
      // Verificamos que la respuesta sea un error con código 401
      expect(res.status).toHaveBeenCalledWith(401);
      // Verificamos que se devuelva el mensaje de error correcto
      expect(res.json).toHaveBeenCalledWith({ error: 'Credenciales incorrectas' });
    });
  });

  // Pruebas para la función getUsers del controlador de usuario
  describe('getUsers', () => {
    it('Debe obtener todos los usuarios correctamente', async () => {
      const req = {}; // No se necesita request para obtener todos los usuarios
      const res = { json: jest.fn() }; // Simulamos el response

      // Mockeamos la lista de usuarios devuelta
      const mockUsers = [{ id: 1, username: 'user1' }, { id: 2, username: 'user2' }];
      Usuario.findAll.mockResolvedValue(mockUsers);

      // Llamamos a la función getUsers
      await getUsers(req, res);

      // Verificamos que se haya llamado a findAll para obtener los usuarios
      expect(Usuario.findAll).toHaveBeenCalled();
      // Verificamos que la respuesta devuelva la lista de usuarios
      expect(res.json).toHaveBeenCalledWith(mockUsers);
    });
  });

  // Pruebas para la función getUsersById del controlador de usuario
  describe('getUsersById', () => {
    it('Debe devolver un usuario específico por ID', async () => {
      const req = { params: { id: 1 } }; // Simulamos el request con ID del usuario
      const res = { json: jest.fn(), status: jest.fn().mockReturnThis() }; // Simulamos el response

      // Mockeamos el usuario devuelto
      const mockUser = { id: 1, username: 'user1' };
      Usuario.findByPk.mockResolvedValue(mockUser);

      // Llamamos a la función getUsersById
      await getUsersById(req, res);

      // Verificamos que se haya buscado el usuario por ID
      expect(Usuario.findByPk).toHaveBeenCalledWith(1);
      // Verificamos que la respuesta devuelva el usuario encontrado
      expect(res.json).toHaveBeenCalledWith(mockUser);
    });

    it('Debe devolver un error si el usuario no existe', async () => {
      const req = { params: { id: 1 } }; // Simulamos el request con ID no encontrado
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() }; // Simulamos el response

      // Mockeamos que el usuario no existe
      Usuario.findByPk.mockResolvedValue(null);

      // Llamamos a la función getUsersById
      await getUsersById(req, res);

      // Verificamos que la respuesta sea un error con código 404
      expect(res.status).toHaveBeenCalledWith(404);
      // Verificamos que se devuelva el mensaje de error correcto
      expect(res.json).toHaveBeenCalledWith({ error: 'Usuario no encontrado' });
    });
  });

  // Pruebas para la función updateUser del controlador de usuario
  describe('updateUser', () => {
    it('Debe actualizar un usuario correctamente', async () => {
      const req = { params: { id: 1 }, body: { username: 'updatedUser' } }; // Simulamos el request con datos a actualizar
      const res = { json: jest.fn() }; // Simulamos el response

      // Mockeamos el usuario encontrado y simulamos el método save
      const mockUser = { id: 1, username: 'user1', save: jest.fn() };
      Usuario.findByPk.mockResolvedValue(mockUser);

      // Llamamos a la función updateUser
      await updateUser(req, res);

      // Verificamos que se haya buscado el usuario por ID
      expect(Usuario.findByPk).toHaveBeenCalledWith(1);
      // Verificamos que se haya actualizado el usuario correctamente
      expect(mockUser.username).toBe('updatedUser');
      expect(mockUser.save).toHaveBeenCalled();
      // Verificamos que la respuesta devuelva el usuario actualizado
      expect(res.json).toHaveBeenCalledWith(mockUser);
    });

    it('Debe devolver un error si el usuario no existe', async () => {
      const req = { params: { id: 1 } }; // Simulamos el request con ID no encontrado
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() }; // Simulamos el response

      // Mockeamos que el usuario no existe
      Usuario.findByPk.mockResolvedValue(null);

      // Llamamos a la función updateUser
      await updateUser(req, res);

      // Verificamos que la respuesta sea un error con código 404
      expect(res.status).toHaveBeenCalledWith(404);
      // Verificamos que se devuelva el mensaje de error correcto
      expect(res.json).toHaveBeenCalledWith({ error: 'Usuario no encontrado' });
    });
  });

  // Pruebas para la función deleteUser del controlador de usuario
  describe('deleteUser', () => {
    it('Debe eliminar un usuario correctamente', async () => {
      const req = { params: { id: 1 } }; // Simulamos el request con ID del usuario
      const res = { json: jest.fn() }; // Simulamos el response

      // Mockeamos el usuario encontrado y simulamos el método destroy
      const mockUser = { id: 1, destroy: jest.fn() };
      Usuario.findByPk.mockResolvedValue(mockUser);

      // Llamamos a la función deleteUser
      await deleteUser(req, res);

      // Verificamos que se haya buscado el usuario por ID
      expect(Usuario.findByPk).toHaveBeenCalledWith(1);
      // Verificamos que se haya llamado al método destroy para eliminar el usuario
      expect(mockUser.destroy).toHaveBeenCalled();
      // Verificamos que la respuesta devuelva un mensaje de éxito
      expect(res.json).toHaveBeenCalledWith({ message: 'Usuario eliminado' });
    });

    it('Debe devolver un error si el usuario no existe', async () => {
      const req = { params: { id: 1 } }; // Simulamos el request con ID no encontrado
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() }; // Simulamos el response

      // Mockeamos que el usuario no existe
      Usuario.findByPk.mockResolvedValue(null);

      // Llamamos a la función deleteUser
      await deleteUser(req, res);

      // Verificamos que la respuesta sea un error con código 404
      expect(res.status).toHaveBeenCalledWith(404);
      // Verificamos que se devuelva el mensaje de error correcto
      expect(res.json).toHaveBeenCalledWith({ error: 'Usuario no encontrado' });
    });
  });
});






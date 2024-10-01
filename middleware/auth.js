// Se importa la librería jsonwebtoken, que permite trabajar con tokens JWT para la autenticación
const jwt = require('jsonwebtoken');

// Middleware de autenticación, acepta un parámetro `role` para verificar el rol del usuario
const authMiddleware = (role) => (req, res, next) => {
  
  // Se extrae el token JWT de la cabecera 'Authorization', quitando el prefijo 'Bearer '
  const token = req.header('Authorization').replace('Bearer ', '');

  try {
    // Se verifica el token usando el secreto definido en las variables de entorno
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Si se especifica un rol y el rol decodificado del token no coincide, se devuelve un error 403
    if (role && decoded.role !== role) {
      return res.status(403).json({ error: 'No autorizado' });
    }

    // Si el token es válido y el rol es correcto, se asigna la información decodificada (usuario) al objeto `req`
    req.user = decoded;

    // Otra función del ciclo de middleware
    next();
  } catch (error) {
    // Si el token es inválido o hay un error en la verificación, se devuelve un error 401
    res.status(401).json({ error: 'Token inválido' });
  }
};

// Se exporta el middleware para poder usarlo en otras rutas o controladores
module.exports = authMiddleware;

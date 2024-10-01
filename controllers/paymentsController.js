// Se importa la librería 'multer' que permite manejar la carga de archivos en las solicitudes HTTP
const multer = require('multer');

// Se importa el módulo 'path' que permite trabajar con rutas de archivos y sus extensiones
const path = require('path');
const Pago = require('../models/payments');


// Configuración de almacenamiento para multer
const storage = multer.diskStorage({
  // Directorio de destino para los archivos cargados. En este caso, los archivos se guardan en la carpeta 'uploads'
  destination: './uploads',

  // Se define el nombre final del archivo
  // Se Usa la marca de tiempo actual (Date.now()) concatenada con el nombre original del archivo para evitar duplicados
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);  // El callback asigna el nombre final al archivo
  }
});

// Filtro de archivos para asegurar que solo se acepten archivos PDF
const fileFilter = (req, file, cb) => {
  // Se define el tipo de archivo permitido: en este caso, solo archivos con extensión 'pdf'
  const filetypes = /pdf/;

  // Se verifica si la extensión del archivo es PDF
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

  // Se Verifica si el tipo MIME del archivo es de tipo PDF
  const mimetype = filetypes.test(file.mimetype);

  // Si tanto la extensión como el tipo MIME coinciden con PDF, se permite la carga
  if (mimetype && extname) return cb(null, true);

  // Si no es un archivo PDF, se devuelve un error personalizado
  cb('Error: Solo archivos PDF');
};

// Se Configura multer con el almacenamiento definido y el filtro de archivos para permitir un solo archivo ('receipt')
exports.upload = multer({ 
  storage,  // Almacenamiento configurado previamente
  fileFilter  // Filtro para asegurar que solo se carguen archivos PDF
}).single('receipt');  // Permite la carga de un único archivo con el campo de nombre 'receipt'

exports.createPayment = async (req, res) => {
  try {
    // Obtiene los detalles del pago desde el cuerpo de la solicitud
    const { amount, receipt, userId } = req.body;
    // Crea un nuevo pago en la base de datos, asociándolo con un usuario
    const payment = await Pago.create({ amount, receipt, UsuarioId: userId });
    // Responde con el pago creado y un estado 201 (Creado)
    res.status(201).json(payment);
  } catch (error) {
    // Si hay un error, responde con un estado 400 y un mensaje de error
    res.status(400).json({ error: 'Error al crear el pago' });
  }
};

exports.getPayments = async (req, res) => {
  try {
    // Obtiene todos los pagos de la base de datos
    const payments = await Pago.findAll();
    // Devuelve los pagos en formato JSON
    res.json(payments);
  } catch (error) {
    // Responde con un estado 500 y un mensaje de error si ocurre algún problema
    res.status(500).json({ error: 'Error al obtener los pagos' });
  }
};

exports.getPaymentById = async (req, res) => {
  try {
    // Busca el pago por su ID en la base de datos
    const payment = await Pago.findByPk(req.params.id);
    // Si no se encuentra el pago, responde con un estado 404
    if (!payment) return res.status(404).json({ error: 'Pago no encontrado' });
    // Si se encuentra, devuelve el pago en formato JSON
    res.json(payment);
  } catch (error) {
    // Responde con un estado 500 en caso de error
    res.status(500).json({ error: 'Error al obtener el pago' });
  }
};

exports.updatePayment = async (req, res) => {
  try {
    // Busca el pago por su ID en la base de datos
    const payment = await Pago.findByPk(req.params.id);
    // Si no se encuentra el pago, responde con un estado 404
    if (!payment) return res.status(404).json({ error: 'Pago no encontrado' });

    // Actualiza el monto y el recibo del pago solo si son proporcionados en la solicitud
    const { amount, receipt } = req.body;
    payment.amount = amount || payment.amount;
    payment.receipt = receipt || payment.receipt;
    // Guarda los cambios en la base de datos
    await payment.save();

    // Devuelve el pago actualizado en formato JSON
    res.json(payment);
  } catch (error) {
    // Responde con un estado 500 en caso de error
    res.status(500).json({ error: 'Error al actualizar el pago' });
  }
};

exports.deletePayment =async (req, res) => {
  try {
    // Busca el pago por su ID en la base de datos
    const payment = await Pago.findByPk(req.params.id);
    // Si no se encuentra, responde con un estado 404
    if (!payment) return res.status(404).json({ error: 'Pago no encontrado' });
    // Elimina el pago de la base de datos
    await payment.destroy();
    // Devuelve un mensaje de confirmación
    res.json({ message: 'Pago eliminado' });
  } catch (error) {
    // Responde con un estado 500 en caso de error
    res.status(500).json({ error: 'Error al eliminar el pago' });
  }
};



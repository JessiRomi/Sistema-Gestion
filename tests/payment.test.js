// Se importa el controlador de pagos, que contiene las funciones para manejar las solicitudes HTTP
const paymentsController = require('../controllers/paymentsController');

// Se importa el modelo 'Pago', que representa la tabla de pagos en la base de datos
const Pago = require('../models/payments');

// Se usa 'jest.mock' para hacer un mock del modelo 'Pago'. Esto permite simular su comportamiento durante las pruebas sin interactuar con una base de datos real
jest.mock('../models/payments');

describe('Payments Controller', () => {
  // Limpia los mocks después de cada prueba para evitar interferencias entre las pruebas
  afterEach(() => {
    jest.clearAllMocks();  
  });

  // Prueba unitaria para verificar si la creación de un pago funciona correctamente
  test('Debe crear un pago correctamente', async () => {
    // Simula una solicitud (req) con los datos del pago
    const req = { body: { amount: 100, receipt: 'receipt.pdf', userId: 1 } };
    // Simula una respuesta (res) con los métodos 'status' y 'json' para devolver el resultado
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    // Se simula el comportamiento del modelo 'Pago.create', devolviendo un objeto que representa el pago creado
    Pago.create.mockResolvedValue({ id: 1, ...req.body });

    // Llama a la función del controlador 'createPayment' y le pasa los objetos 'req' y 'res'
    await paymentsController.createPayment(req, res);

    // Verifica que se haya llamado a 'res.status' con el estado 201 (creado)
    expect(res.status).toHaveBeenCalledWith(201);
    // Verifica que 'res.json' haya sido llamado con los datos del pago creado
    expect(res.json).toHaveBeenCalledWith({ id: 1, ...req.body });
  });

  // Prueba unitaria para verificar si la obtención de todos los pagos funciona correctamente
  test('Debe obtener todos los pagos correctamente', async () => {
    // Simula una solicitud sin parámetros específicos
    const req = {};
    // Simula una respuesta con el método 'json' para devolver el resultado
    const res = { json: jest.fn() };

    // Datos simulados para representar una lista de pagos obtenidos de la base de datos
    const mockPayments = [{ id: 1, amount: 100, receipt: 'receipt.pdf', userId: 1 }];
    // Se simula el comportamiento del modelo 'Pago.findAll', devolviendo los pagos simulados
    Pago.findAll.mockResolvedValue(mockPayments);

    // Llama a la función del controlador 'getPayments' y le pasa los objetos 'req' y 'res'
    await paymentsController.getPayments(req, res);

    // Verifica que 'res.json' haya sido llamado con la lista de pagos
    expect(res.json).toHaveBeenCalledWith(mockPayments);
  });

  // Prueba unitaria para verificar si la función devuelve un error 404 cuando no se encuentra un pago por su ID
  test('Debe devolver 404 si el pago no se encuentra', async () => {
    // Simula una solicitud con un parámetro de ID
    const req = { params: { id: 1 } };
    // Simula una respuesta con los métodos 'status' y 'json'
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    // Se simula que 'Pago.findByPk' devuelve null, lo que significa que no se encontró el pago
    Pago.findByPk.mockResolvedValue(null);

    // Llama a la función del controlador 'getPaymentById' y le pasa los objetos 'req' y 'res'
    await paymentsController.getPaymentById(req, res);

    // Verifica que 'res.status' haya sido llamado con el estado 404 (no encontrado)
    expect(res.status).toHaveBeenCalledWith(404);
    // Verifica que 'res.json' haya sido llamado con un mensaje de error
    expect(res.json).toHaveBeenCalledWith({ error: 'Pago no encontrado' });
  });

  // Prueba unitaria para verificar si la actualización de un pago funciona correctamente
  test('Debe actualizar un pago correctamente', async () => {
    // Simula una solicitud con un parámetro de ID y un cuerpo de solicitud con los nuevos datos
    const req = { params: { id: 1 }, body: { amount: 200 } };
    // Simula una respuesta con el método 'json'
    const res = { json: jest.fn() };

    // Simula un pago existente y una función 'save' que se llamará para guardar los cambios
    const mockPayment = { id: 1, amount: 100, receipt: 'receipt.pdf', save: jest.fn() };
    // Se simula que 'Pago.findByPk' devuelve el pago simulado
    Pago.findByPk.mockResolvedValue(mockPayment);

    // Llama a la función del controlador 'updatePayment' y le pasa los objetos 'req' y 'res'
    await paymentsController.updatePayment(req, res);

    // Verifica que se haya llamado a 'save' para guardar los cambios en el pago
    expect(mockPayment.save).toHaveBeenCalled();
    // Verifica que 'res.json' haya sido llamado con el pago actualizado
    expect(res.json).toHaveBeenCalledWith(mockPayment);
  });

  // Prueba unitaria para verificar si la eliminación de un pago funciona correctamente
  test('Debe eliminar un pago correctamente', async () => {
    // Simula una solicitud con un parámetro de ID
    const req = { params: { id: 1 } };
    // Simula una respuesta con el método 'json'
    const res = { json: jest.fn() };

    // Simula un pago existente y una función 'destroy' que se llamará para eliminar el pago
    const mockPayment = { id: 1, destroy: jest.fn() };
    // Se simula que 'Pago.findByPk' devuelve el pago simulado
    Pago.findByPk.mockResolvedValue(mockPayment);

    // Llama a la función del controlador 'deletePayment' y le pasa los objetos 'req' y 'res'
    await paymentsController.deletePayment(req, res);

    // Verifica que se haya llamado a 'destroy' para eliminar el pago
    expect(mockPayment.destroy).toHaveBeenCalled();
    // Verifica que 'res.json' haya sido llamado con un mensaje de confirmación
    expect(res.json).toHaveBeenCalledWith({ message: 'Pago eliminado' });
  });
});

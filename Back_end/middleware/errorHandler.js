const winston = require('winston');

// Configuración de Winston para el logger
const logger = winston.createLogger({
  level: 'error',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.Console()
  ]
});

// Middleware Global de Errores (Checklist Punto 11)
const globalErrorHandler = (err, req, res, next) => {
  // Loggear el error detallado internamente
  logger.error({
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method
  });

  // Retornar respuesta genérica al cliente para no filtrar información sensible (prevención de fugas)
  res.status(err.status || 500).json({
    success: false,
    message: "Ha ocurrido un error interno en el servidor. Por favor, inténtelo más tarde."
  });
};

module.exports = { globalErrorHandler, logger };

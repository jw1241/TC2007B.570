const errorHandler = (err, req, res, next) => {
  // Log the real error internally
  console.error(`[ERROR] ${new Date().toISOString()} - ${err.stack || err.message}`);

  // Default to 500 server error
  const statusCode = err.statusCode || 500;
  
  // Do not leak stack traces or raw database error details to the client
  const response = {
    error: {
      message: statusCode === 500 ? "Error interno del servidor. Por favor, contacta a soporte." : err.message,
    }
  };

  // For validation errors (Joi, etc.), we can safely expose the message
  if (err.isJoi || statusCode === 400) {
    response.error.message = err.message;
    if (err.details) response.error.details = err.details;
  }

  res.status(statusCode).json(response);
};

module.exports = errorHandler;

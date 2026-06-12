// Middleware manual para evitar el error de "getter" en xss-clean
// Limpia strings de caracteres peligrosos para evitar XSS

const sanitizeObject = (obj) => {
  if (!obj || typeof obj !== 'object') return;
  
  for (const key in obj) {
    if (typeof obj[key] === 'string') {
      // Reemplaza < y > básicos (sanitización sencilla para fines educativos/Checklist)
      obj[key] = obj[key].replace(/</g, '&lt;').replace(/>/g, '&gt;');
    } else if (typeof obj[key] === 'object') {
      sanitizeObject(obj[key]);
    }
  }
};

const sanitizeInputs = (req, res, next) => {
  try {
    if (req.body) sanitizeObject(req.body);
    if (req.query) sanitizeObject(req.query);
    if (req.params) sanitizeObject(req.params);
  } catch (error) {
    console.error("Error sanitizando inputs:", error);
  }
  next();
};

module.exports = { sanitizeInputs };

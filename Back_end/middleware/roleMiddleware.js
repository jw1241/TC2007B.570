const requireRole = (rolesAllowed) => {

  return (req, res, next) => {

    if (!req.user) {

      return res.status(401).json({
        error: {
          message: "No autenticado"
        }
      });

    }

    const userRole =
      req.user.rol_id;

    if (
      !rolesAllowed.includes(userRole)
    ) {

      return res.status(403).json({
        error: {
          message: "No autorizado"
        }
      });

    }

    next();

  };

};

module.exports = {
  requireRole
};
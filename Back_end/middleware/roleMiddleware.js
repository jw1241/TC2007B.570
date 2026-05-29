const requireRole = (rolesAllowed) => {

  return (req, res, next) => {

    const userRole =
      req.user.profile.rol_id;

    if (
      !rolesAllowed.includes(userRole)
    ) {

      return res.status(403).json({
        error: {
          message: "Forbidden"
        }
      });

    }

    next();

  };

};

module.exports = {
  requireRole
};
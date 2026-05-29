// ONLY ADMIN + DOCENTE
router.get(
  "/",
  authMiddleware,
  requireRole([ROLES.ADMIN, ROLES.DOCENTE]),
  async (req, res, next) => {

    try {

      const { data, error } =
        await req.supabase
          .from("alumnos")
          .select("*");

      if (error) {
        throw error;
      }

      res.json(data);

    } catch (err) {

      next(err);

    }

  }
);

// PADRES: only their children
router.get(
  "/mis-hijos",
  authMiddleware,
  requireRole([ROLES.PADRE]),
  async (req, res, next) => {

    try {

      const { data, error } =
        await req.supabase
          .from("parentescos")
          .select("alumno_id, alumnos(*)")
          .eq("padre_id", req.user.id);

      if (error) {
        throw error;
      }

      res.json(data);

    } catch (err) {

      next(err);

    }

  }
);

router.get(
  "/:alumnoId",
  authMiddleware,
  requireRole([
    ROLES.ADMIN,
    ROLES.DOCENTE,
    ROLES.PADRE
  ]),
  async (req, res, next) => {

    try {

      const schema = Joi.object({
        alumnoId: Joi.number()
          .integer()
          .positive()
          .required()
      });

      const { error, value } =
        schema.validate(req.params);

      if (error) {
        return res.status(400).json({
          error: {
            message: "Alumno inválido"
          }
        });
      }

      const { alumnoId } = value;

      // PADRE ownership verification
      if (req.user.rol_id === ROLES.PADRE) {

        const {
          data: parentesco,
          error: parentescoError
        } = await req.supabase
          .from("parentescos")
          .select("*")
          .eq("padre_id", req.user.id)
          .eq("alumno_id", alumnoId)
          .single();

        if (parentescoError || !parentesco) {

          return res.status(403).json({
            error: {
              message: "No autorizado"
            }
          });

        }

      }

      const {
        data,
        error: calificacionesError
      } = await req.supabase
        .from("calificaciones")
        .select("*")
        .eq("alumno_id", alumnoId);

      if (calificacionesError) {
        throw calificacionesError;
      }

      res.json(data);

    } catch (err) {

      next(err);

    }

  }
);
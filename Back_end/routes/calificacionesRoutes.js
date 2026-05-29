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

      // PADRES can only access their children
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
        error: gradesError
      } = await req.supabase
        .from("calificaciones")
        .select("*")
        .eq("alumno_id", alumnoId);

      if (gradesError) {
        throw gradesError;
      }

      res.json(data);

    } catch (err) {

      next(err);

    }

  }
);
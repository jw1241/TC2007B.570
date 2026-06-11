const { getSummary } = require("../../controllers/calificacionesController");
const ROLES = require("../../constants/roles");

describe("Calificaciones Controller Unit Tests", () => {
  let req, res, next;

  beforeEach(() => {
    jest.clearAllMocks();

    req = {
      params: {},
      user: {},
      supabase: {
        from: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        in: jest.fn().mockReturnThis(),
        maybeSingle: jest.fn()
      }
    };

    res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis()
    };

    next = jest.fn();
  });

  describe("getSummary()", () => {
    it("debería retornar 400 si el alumnoId no es un UUID válido", async () => {
      req.params.alumnoId = "123"; // No es UUID

      await getSummary(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.objectContaining({ message: "Alumno inválido" })
        })
      );
    });

    it("debería retornar 404 si el alumno no existe", async () => {
      req.params.alumnoId = "123e4567-e89b-12d3-a456-426614174000"; // UUID válido
      
      req.supabase.maybeSingle.mockResolvedValueOnce({
        data: null,
        error: null
      });

      await getSummary(req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.objectContaining({ message: "Alumno no encontrado" })
        })
      );
    });

    it("debería retornar 403 si el usuario es PADRE pero no tiene parentesco con el alumno", async () => {
      req.params.alumnoId = "123e4567-e89b-12d3-a456-426614174000";
      req.user = { id: "padre-123", rol_id: ROLES.PADRE };

      // Mock de alumno encontrado
      req.supabase.maybeSingle.mockResolvedValueOnce({
        data: { id: req.params.alumnoId, grupo_id: "grupo-1" },
        error: null
      });

      // Mock de parentesco no encontrado
      req.supabase.maybeSingle.mockResolvedValueOnce({
        data: null,
        error: null
      });

      await getSummary(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.objectContaining({ message: "No autorizado" })
        })
      );
    });

    it("debería retornar el resumen de calificaciones si es Administrador", async () => {
      req.params.alumnoId = "123e4567-e89b-12d3-a456-426614174000";
      req.user = { id: "admin-123", rol_id: ROLES.ADMIN };

      // Creamos una función mock que retorne una cadena configurable para cada tabla
      req.supabase.from = jest.fn((table) => {
        if (table === "alumnos") {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            maybeSingle: jest.fn().mockResolvedValue({
              data: { id: req.params.alumnoId, grupo_id: "grupo-1" },
              error: null
            })
          };
        }
        if (table === "parentescos") {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockResolvedValue({
              data: [],
              error: null
            })
          };
        }
        if (table === "calificaciones") {
          // El controller guarda gradesQuery que es el resultado de eq
          // y luego lo 'awaitea'
          const gradesQueryMock = Promise.resolve({
            data: [],
            error: null
          });
          // Por si se encadena algo más
          gradesQueryMock.in = jest.fn().mockResolvedValue({
            data: [],
            error: null
          });

          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnValue(gradesQueryMock)
          };
        }
        if (table === "materias") {
          return {
            select: jest.fn().mockResolvedValue({
              data: [{ id: "mat-1", nombre_materia: "Matemáticas" }],
              error: null
            })
          };
        }
      });

      await getSummary(req, res, next);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          resumen: expect.any(Object),
          materias: expect.any(Array)
        })
      );
    });
  });
});

const boletasController = require("../../controllers/boletasController");
const { supabaseAdmin } = require("../../config/supabaseClient");
const PDFDocument = require("pdfkit");

const mockSupabaseChain = {
  select: jest.fn(),
  eq: jest.fn(),
  single: jest.fn(),
  order: jest.fn()
};

mockSupabaseChain.select.mockReturnValue(mockSupabaseChain);
mockSupabaseChain.eq.mockReturnValue(mockSupabaseChain);
mockSupabaseChain.order.mockReturnValue(mockSupabaseChain);

jest.mock("../../config/supabaseClient", () => ({
  supabaseAdmin: {
    from: jest.fn(() => mockSupabaseChain)
  }
}));

jest.mock("pdfkit", () => {
  return jest.fn().mockImplementation(() => ({
    pipe: jest.fn(),
    fontSize: jest.fn().mockReturnThis(),
    text: jest.fn().mockReturnThis(),
    moveDown: jest.fn().mockReturnThis(),
    font: jest.fn().mockReturnThis(),
    moveTo: jest.fn().mockReturnThis(),
    lineTo: jest.fn().mockReturnThis(),
    stroke: jest.fn().mockReturnThis(),
    addPage: jest.fn().mockReturnThis(),
    end: jest.fn(),
    y: 100
  }));
});

describe("Boletas Controller Unit Tests", () => {
  let req, res, next;

  beforeEach(() => {
    jest.clearAllMocks();

    req = {
      params: {},
      user: {}
    };

    res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
      setHeader: jest.fn()
    };

    next = jest.fn();
  });

  describe("generarBoletaIndividual()", () => {
    it("debería retornar 400 si el alumno_id es inválido", async () => {
      req.params = {}; // Faltaría el alumno_id

      await boletasController.generarBoletaIndividual(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.any(Object)
        })
      );
    });

    it("debería retornar 404 si el alumno no se encuentra en la base de datos", async () => {
      req.params = { alumno_id: "fake-uuid" };

      mockSupabaseChain.single.mockResolvedValueOnce({
        data: null,
        error: { message: "No rows found" }
      });

      await boletasController.generarBoletaIndividual(req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.objectContaining({ message: "Alumno no encontrado." })
        })
      );
    });

    it("debería generar el PDF correctamente si el alumno existe", async () => {
      req.params = { alumno_id: "real-uuid" };

      // Configurar la secuencia para `eq` y `order`
      // 1ra llamada: en `alumnos`, retorna la cadena para poder llamar a `.single()`
      mockSupabaseChain.eq.mockReturnValueOnce(mockSupabaseChain);
      mockSupabaseChain.eq.mockReturnValueOnce(mockSupabaseChain); // para calificaciones

      // en calificaciones se llama a order al final
      mockSupabaseChain.order.mockResolvedValueOnce({
        data: [
          { trimestre: 1, calificacion: 10, materias: { nombre: "Matemáticas" } }
        ],
        error: null
      });

      // Mockear la respuesta de `single` (usado en la 1ra llamada)
      mockSupabaseChain.single.mockResolvedValueOnce({
        data: {
          nombre: "Juan",
          apellidos: "Perez",
          matricula: "12345",
          grupos: { grado: 1, seccion: "A" }
        },
        error: null
      });

      await boletasController.generarBoletaIndividual(req, res, next);

      expect(res.setHeader).toHaveBeenCalledWith("Content-Type", "application/pdf");
      expect(res.setHeader).toHaveBeenCalledWith("Content-Disposition", "attachment; filename=Boleta_12345.pdf");
      expect(PDFDocument).toHaveBeenCalledTimes(1);
    });
  });

  describe("generarBoletasMasivas()", () => {
    it("debería retornar 403 si el rol no es administrador (1)", async () => {
      req.user = { rol_id: 2 }; // Docente

      await boletasController.generarBoletasMasivas(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.objectContaining({ message: expect.stringContaining("Acceso denegado") })
        })
      );
    });

    it("debería retornar 404 si no hay alumnos registrados", async () => {
      req.user = { rol_id: 1 }; // Admin

      mockSupabaseChain.select.mockResolvedValueOnce({
        data: [],
        error: null
      });

      await boletasController.generarBoletasMasivas(req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.objectContaining({ message: "No hay alumnos registrados." })
        })
      );
    });

    it("debería generar PDFs masivos correctamente si el rol es admin y hay alumnos", async () => {
      req.user = { rol_id: 1 }; // Admin

      // Mockear respuesta alumnos
      mockSupabaseChain.select.mockResolvedValueOnce({
        data: [
          { id: "a1", nombre: "A", apellidos: "B", matricula: "M1", grupos: {} },
          { id: "a2", nombre: "C", apellidos: "D", matricula: "M2", grupos: {} }
        ],
        error: null
      });

      // Mockear respuesta calificaciones (que ahora usa order)
      mockSupabaseChain.select.mockReturnValueOnce(mockSupabaseChain);
      mockSupabaseChain.order.mockResolvedValueOnce({
        data: [
          { alumno_id: "a1", trimestre: 1, calificacion: 9, materias: { nombre: "Mates" } }
        ],
        error: null
      });

      await boletasController.generarBoletasMasivas(req, res, next);

      expect(res.setHeader).toHaveBeenCalledWith("Content-Type", "application/pdf");
      expect(res.setHeader).toHaveBeenCalledWith("Content-Disposition", "attachment; filename=Boletas_Masivas.pdf");
      // Verifica que el Event loop yielding se ejecutó y PDF document fue instanciado
      expect(PDFDocument).toHaveBeenCalledTimes(1);
    });
  });
});

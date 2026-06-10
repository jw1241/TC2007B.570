const mensajesController = require("../../controllers/mensajesController");
const ROLES = require("../../constants/roles");

const mockSupabaseChain = {
  select: jest.fn(),
  eq: jest.fn(),
  in: jest.fn(),
  maybeSingle: jest.fn(),
  single: jest.fn(),
  insert: jest.fn(),
  order: jest.fn(),
  is: jest.fn()
};

const resetMocks = () => {
  mockSupabaseChain.select.mockReturnValue(mockSupabaseChain);
  mockSupabaseChain.eq.mockReturnValue(mockSupabaseChain);
  mockSupabaseChain.in.mockReturnValue(mockSupabaseChain);
  mockSupabaseChain.maybeSingle.mockReset();
  mockSupabaseChain.single.mockReset();
  mockSupabaseChain.insert.mockReturnValue(mockSupabaseChain);
  mockSupabaseChain.order.mockReturnValue(mockSupabaseChain);
  mockSupabaseChain.is.mockReturnValue(mockSupabaseChain);
};

jest.mock("../../config/supabaseClient", () => ({
  supabaseAdmin: {
    from: jest.fn(() => mockSupabaseChain)
  }
}));

describe("Mensajes Controller Unit Tests", () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      user: { auth_user_id: "auth-uuid" },
      params: {},
      query: {},
      body: {}
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
    resetMocks();
  });

  describe("getContactos()", () => {
    it("debería retornar 404 si el usuario no existe", async () => {
      mockSupabaseChain.eq.mockReturnValueOnce(mockSupabaseChain);
      mockSupabaseChain.maybeSingle.mockResolvedValueOnce({ data: null, error: null });

      await mensajesController.getContactos(req, res, next);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: "Perfil no encontrado" });
    });

    it("debería retornar contactos para un DOCENTE", async () => {
      // 1. getInternalUser -> eq(), maybeSingle()
      mockSupabaseChain.eq.mockReturnValueOnce(mockSupabaseChain);
      mockSupabaseChain.maybeSingle.mockResolvedValueOnce({
        data: { id: "docente-uuid", rol_id: ROLES.DOCENTE, nombre_completo: "Profe 1" },
        error: null
      });

      // 2. asignaciones -> eq() (resolves)
      mockSupabaseChain.eq.mockResolvedValueOnce({
        data: [{ grupo_id: 1, materia_id: 1 }],
        error: null
      });

      // 3. alumnos -> in() (resolves)
      mockSupabaseChain.in.mockResolvedValueOnce({
        data: [{ id: "alumno1", nombre_completo: "Alumno Uno", grupo: { grado: 1, seccion: "A" } }],
        error: null
      });

      // 4. materias -> eq() (resolves)
      mockSupabaseChain.eq.mockResolvedValueOnce({
        data: [{ grupo_id: 1, materia: { nombre_materia: "Matemáticas" } }],
        error: null
      });

      await mensajesController.getContactos(req, res, next);
      expect(res.json).toHaveBeenCalled();
      expect(res.json.mock.calls[0][0].data.length).toBe(1);
    });
  });

  describe("enviarMensaje()", () => {
    it("debería retornar 400 si el cuerpo no pasa validación Joi", async () => {
      req.body = { contenido: "" }; // Vacío (min 1)
      await mensajesController.enviarMensaje(req, res, next);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it("debería retornar 403 si el PADRE no tiene parentesco con el alumno", async () => {
      req.body = { alumno_id: "alumno-uuid", docente_id: "profe-uuid", contenido: "Hola" };

      // 1. getInternalUser -> eq(), maybeSingle()
      mockSupabaseChain.eq.mockReturnValueOnce(mockSupabaseChain);
      mockSupabaseChain.maybeSingle.mockResolvedValueOnce({
        data: { id: "padre-uuid", rol_id: ROLES.PADRE },
        error: null
      });

      // 2. verifyAccessToStudent (PADRE) -> eq(), eq(), maybeSingle()
      mockSupabaseChain.eq.mockReturnValueOnce(mockSupabaseChain);
      mockSupabaseChain.eq.mockReturnValueOnce(mockSupabaseChain);
      mockSupabaseChain.maybeSingle.mockResolvedValueOnce({
        data: null,
        error: null
      });

      await mensajesController.enviarMensaje(req, res, next);
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ error: "No tienes permiso para comunicarte sobre este alumno." });
    });
  });

  describe("getChatConDestinatario()", () => {
    it("debería retornar 200 con mensajes si existe la conversación", async () => {
      req.params = { destinatario_id: "dest-uuid" };
      
      // 1. getInternalUser -> eq(), maybeSingle()
      mockSupabaseChain.eq.mockReturnValueOnce(mockSupabaseChain);
      mockSupabaseChain.maybeSingle.mockResolvedValueOnce({
        data: { id: "padre-uuid", rol_id: ROLES.PADRE },
        error: null
      });

      // 2. query conversacion -> eq, eq, is, maybeSingle
      mockSupabaseChain.eq.mockReturnValueOnce(mockSupabaseChain);
      mockSupabaseChain.eq.mockReturnValueOnce(mockSupabaseChain);
      mockSupabaseChain.is.mockReturnValueOnce(mockSupabaseChain);
      mockSupabaseChain.maybeSingle.mockResolvedValueOnce({
        data: { id: "conv-1" },
        error: null
      });

      // 3. mensajes -> eq, order
      mockSupabaseChain.eq.mockReturnValueOnce(mockSupabaseChain);
      mockSupabaseChain.order.mockResolvedValueOnce({
        data: [{ id: "msg1", contenido: "Hola" }],
        error: null
      });

      await mensajesController.getChatConDestinatario(req, res, next);
      expect(res.json).toHaveBeenCalled();
      expect(res.json.mock.calls[0][0].data.length).toBe(1);
    });
  });

  describe("getPadresDeAlumno()", () => {
    it("debería retornar 200 con la lista de padres", async () => {
      req.params = { alumno_id: "alumno-uuid" };

      // 1. getInternalUser -> Admin
      mockSupabaseChain.eq.mockReturnValueOnce(mockSupabaseChain);
      mockSupabaseChain.maybeSingle.mockResolvedValueOnce({
        data: { id: "admin-uuid", rol_id: ROLES.ADMIN },
        error: null
      });

      // 2. parentescos -> select, eq
      mockSupabaseChain.eq.mockResolvedValueOnce({
        data: [{ usuarios: { id: "padre1", nombre_completo: "Papa", email: "p@p.com" } }],
        error: null
      });

      await mensajesController.getPadresDeAlumno(req, res, next);
      expect(res.json).toHaveBeenCalled();
      expect(res.json.mock.calls[0][0].data.length).toBe(1);
    });
  });

  describe("getDocentesDeAlumno()", () => {
    it("debería retornar 200 con la lista de docentes", async () => {
      req.params = { alumno_id: "alumno-uuid" };

      // 1. getInternalUser -> Admin
      mockSupabaseChain.eq.mockReturnValueOnce(mockSupabaseChain);
      mockSupabaseChain.maybeSingle.mockResolvedValueOnce({
        data: { id: "admin-uuid", rol_id: ROLES.ADMIN },
        error: null
      });

      // 2. alumno -> select, eq, single
      mockSupabaseChain.eq.mockReturnValueOnce(mockSupabaseChain);
      mockSupabaseChain.single.mockResolvedValueOnce({
        data: { grupo_id: 1 },
        error: null
      });

      // 3. asignaciones -> select, eq
      mockSupabaseChain.eq.mockResolvedValueOnce({
        data: [{ usuarios: { id: "doc1", nombre_completo: "Docente", email: "d@d.com" } }],
        error: null
      });

      await mensajesController.getDocentesDeAlumno(req, res, next);
      expect(res.json).toHaveBeenCalled();
      expect(res.json.mock.calls[0][0].data.length).toBe(1);
    });
  });

  describe("enviarMensaje() - DOCENTE a PADRES", () => {
    it("debería retornar 201 y crear conversaciones y enviar el mensaje a todos los padres", async () => {
      req.body = { alumno_id: "alumno-uuid", contenido: "Aviso" };

      // 1. getInternalUser -> Docente
      mockSupabaseChain.eq.mockReturnValueOnce(mockSupabaseChain);
      mockSupabaseChain.maybeSingle.mockResolvedValueOnce({
        data: { id: "doc-uuid", rol_id: ROLES.DOCENTE },
        error: null
      });

      // 2. verifyAccessToStudent (Docente) -> eq(), maybeSingle(), eq(), eq(), maybeSingle()
      mockSupabaseChain.eq.mockReturnValueOnce(mockSupabaseChain);
      mockSupabaseChain.maybeSingle.mockResolvedValueOnce({ data: { grupo_id: 1 }, error: null });
      mockSupabaseChain.eq.mockReturnValueOnce(mockSupabaseChain);
      mockSupabaseChain.eq.mockReturnValueOnce(mockSupabaseChain);
      mockSupabaseChain.maybeSingle.mockResolvedValueOnce({ data: { docente_id: "doc-uuid" }, error: null });

      // 3. get parents -> select, eq
      mockSupabaseChain.eq.mockResolvedValueOnce({
        data: [{ padre_id: "padre-uuid" }],
        error: null
      });

      // 4. check if conv exists -> select, eq, eq, eq, maybeSingle
      mockSupabaseChain.eq.mockReturnValueOnce(mockSupabaseChain);
      mockSupabaseChain.eq.mockReturnValueOnce(mockSupabaseChain);
      mockSupabaseChain.eq.mockReturnValueOnce(mockSupabaseChain);
      mockSupabaseChain.maybeSingle.mockResolvedValueOnce({ data: null, error: null }); // no existe

      // 5. create conv -> insert, select, single
      mockSupabaseChain.insert.mockReturnValueOnce(mockSupabaseChain);
      mockSupabaseChain.select.mockReturnValueOnce(mockSupabaseChain);
      mockSupabaseChain.single.mockResolvedValueOnce({ data: { id: "new-conv" }, error: null });

      // 6. insert msg -> insert, select, single
      mockSupabaseChain.insert.mockReturnValueOnce(mockSupabaseChain);
      mockSupabaseChain.select.mockReturnValueOnce(mockSupabaseChain);
      mockSupabaseChain.single.mockResolvedValueOnce({ data: { id: "new-msg", contenido: "Aviso" }, error: null });

      await mensajesController.enviarMensaje(req, res, next);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalled();
    });
  });
});

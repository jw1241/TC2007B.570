const authController = require("../../controllers/authController");
const { supabase, supabaseAdmin } = require("../../config/supabaseClient");

// Mock de Supabase
jest.mock("../../config/supabaseClient", () => ({
  supabase: {
    auth: {
      signInWithPassword: jest.fn(),
      resetPasswordForEmail: jest.fn()
    }
  },
  supabaseAdmin: {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn()
  }
}));

describe("Auth Controller Unit Tests", () => {
  let req, res, next;

  beforeEach(() => {
    // Resetear mocks
    jest.clearAllMocks();

    req = {
      body: {},
      headers: {}
    };

    res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis()
    };

    next = jest.fn();
  });

  describe("login()", () => {
    it("debería retornar 400 si los datos son inválidos", async () => {
      req.body = { email: "invalid-email" }; // Falta password

      await authController.login(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.objectContaining({ message: "Datos inválidos" })
        })
      );
    });

    it("debería retornar 401 si las credenciales son incorrectas en Supabase", async () => {
      req.body = { email: "test@test.com", password: "wrongpassword" };

      supabase.auth.signInWithPassword.mockResolvedValueOnce({
        data: null,
        error: { message: "Invalid credentials" }
      });

      await authController.login(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.objectContaining({ message: "Credenciales incorrectas" })
        })
      );
    });

    it("debería retornar 200 y el token si las credenciales son correctas y el usuario existe", async () => {
      req.body = { email: "test@test.com", password: "correctpassword" };

      const mockAuthData = {
        session: { access_token: "mock-token", expires_at: 123456 },
        user: { id: "user-id-123" }
      };

      const mockUserData = {
        id: 1,
        email: "test@test.com",
        nombre_completo: "Test User",
        rol_id: 1
      };

      supabase.auth.signInWithPassword.mockResolvedValueOnce({
        data: mockAuthData,
        error: null
      });

      // supabaseAdmin chain
      supabaseAdmin.from().select().eq().single.mockResolvedValueOnce({
        data: mockUserData,
        error: null
      });

      await authController.login(req, res, next);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Login exitoso",
          token: expect.any(Object),
          usuario: expect.any(Object)
        })
      );
    });
  });

  describe("resetPassword()", () => {
    it("debería retornar 400 si el email es inválido", async () => {
      req.body = { email: "no-email" };

      await authController.resetPassword(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it("debería retornar 200 y mensaje de éxito al mandar el reset de correo", async () => {
      req.body = { email: "test@test.com" };

      supabase.auth.resetPasswordForEmail.mockResolvedValueOnce({ error: null });

      await authController.resetPassword(req, res, next);

      expect(supabase.auth.resetPasswordForEmail).toHaveBeenCalledWith("test@test.com", expect.any(Object));
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining("Si el correo está registrado")
        })
      );
    });
  });
});

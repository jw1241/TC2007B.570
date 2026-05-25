const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const errorHandler = require("./middleware/errorHandler");
require("dotenv").config({ path: ".env.production" });

const app = express();

// 1. Cabeceras de Seguridad (Helmet)
app.use(helmet());

// 2. CORS Restringido
const corsOptions = {
  origin: process.env.FRONTEND_URL || "http://localhost:8100", // Cambiar en producción
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true,
  optionsSuccessStatus: 204
};
app.use(cors(corsOptions));

// 3. Protección contra DoS / Payload Size Limit
app.use(express.json({ limit: "10kb" }));

// 4. Rate Limiting (Protección contra Fuerza Bruta)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // Límite de 100 peticiones por IP por ventana
  message: { error: { message: "Demasiadas peticiones desde esta IP, por favor intenta de nuevo después de 15 minutos." } },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api/", limiter); // Aplica a todas las rutas API

// Importar archivo de rutas
const itemRoutes = require("./routes/items");
app.use("/api/items", itemRoutes);

// Importar rutas de administración y middleware de auth
const adminRoutes = require("./routes/adminRoutes");
const { authMiddleware, requireAdmin } = require("./middleware/authMiddleware");

// Rutas de administración protegidas
app.use("/api/admin", authMiddleware, requireAdmin, adminRoutes);

// Carga la UI de Swagger y API config
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./swagger");
// TODO: Considerar restringir acceso a /api-docs en entornos de producción.
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Middleware Global de Manejo de Errores (Debe ir al final)
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

// Inicia back-end
app.listen(PORT, () => {
  console.log(`🚀 Server running securely on port ${PORT}`);
  console.log(`📖 Swagger docs: http://localhost:${PORT}/api-docs`);
});
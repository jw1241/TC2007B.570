require("dotenv").config({
  path: ".env"
});

const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const swaggerUi = require("swagger-ui-express");

const swaggerSpec = require("./swagger");

const errorHandler =
  require("./middleware/errorHandler");

const {
  authMiddleware
} = require("./middleware/authMiddleware");

const {
  requireRole
} = require("./middleware/roleMiddleware");

const ROLES =
  require("./constants/roles");

const { globalErrorHandler, logger } = require("./middleware/errorHandler");
const { sanitizeInputs } = require("./middleware/sanitizeMiddleware");

/**
 * ROUTES
 */

const adminRoutes =
  require("./routes/adminRoutes");

const authRoutes =
  require("./routes/authRoutes");

const regRoutes =
  require("./routes/registration.routes");


const padreRoutes =
  require("./routes/padreRoutes");

const boletasRoutes =
  require("./routes/boletasRoutes");

const mensajesRoutes =
  require("./routes/mensajesRoutes");

const supportRoutes =
  require("./routes/sorporteRoutes");

const gradesRoutes =
  require("./routes/calificacionesRoutes");

const profeRoutes =
  require("./routes/profeRoutes");

const periodosRoutes = require('./routes/periodosRoutes');

const adminUsuario = require("./routes/adminUsuario")


/**
 * PROCESS ERROR HANDLERS
 */
process.on(
  "uncaughtException",
  (err) => {

    console.error(
      "UNCAUGHT EXCEPTION:",
      err
    );

  }
);

process.on(
  "unhandledRejection",
  (err) => {
    console.error("UNHANDLED REJECTION:", err);
    // Para RNF04 (Disponibilidad), evitamos cerrar el servidor abruptamente.
    // En un entorno de producción, un process manager como PM2 reiniciaría el proceso 
    // pero Node.js recomienda hacer un graceful shutdown.
    // process.exit(1);
  }
);

/**
 * EXPRESS APP
 */
const app = express();

/**
 * TRUST PROXY
 * Needed for rate limiting
 * behind reverse proxies
 */
app.set("trust proxy", 1);

/**
 * SECURITY HEADERS
 */
app.use(helmet({
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));

/**
 * CORS
 */
const allowedOrigins = [
  "http://localhost:8100",
  "http://localhost:4200",
  process.env.FRONTEND_URL
].filter(Boolean);

const corsOptions = {

  origin: (origin, callback) => {

    /**
     * Allow mobile apps,
     * Postman, curl
     */
    if (!origin) {
      if (process.env.NODE_ENV !== "production") {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    }

    if (
      allowedOrigins.includes(origin)
    ) {

      return callback(null, true);

    }

    if (
      process.env.NODE_ENV !== "production"
    ) {

      console.warn(
        "Blocked by CORS:",
        origin
      );

    }

    return callback(
      new Error("Not allowed by CORS")
    );

  },

  methods: [
    "GET",
    "POST",
    "PUT",
    "DELETE",
    "OPTIONS"
  ],

  credentials: true

};

app.use(cors(corsOptions));

/**
 * BODY PARSER
 */
app.use(
  express.json({
    limit: "10kb"
  })
);

app.use(express.urlencoded({ extended: true }));

/**
 * XSS SANITIZATION
 */
app.use(sanitizeInputs);

/**
 * GLOBAL RATE LIMITER
 */
const limiter = rateLimit({

  windowMs:
    15 * 60 * 1000,

  max: 10000, // [Demo-Safe] Elevado a 10,000 para evitar bloqueos en la presentación

  standardHeaders: true,

  legacyHeaders: false,

  message: {
    error: {
      message:
        "Too many requests. Please try again later."
    }
  }

});

app.use("/api", limiter);

/**
 * DEV REQUEST LOGGER
 */
if (
  process.env.NODE_ENV !== "production"
) {

  app.use((req, res, next) => {

    console.log(
      `${req.method} ${req.originalUrl}`
    );

    next();

  });

}

/**
 * PRODUCTION AUDIT LOG (Checklist Punto 6)
 */
app.use((req, res, next) => {
  logger.info({
    type: 'access',
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    user: req.user ? req.user.id : 'guest',
    timestamp: new Date().toISOString()
  });
  next();
});

/**
 * PUBLIC ROUTES
 */
app.use(
  "/api/auth",
  authRoutes,
  regRoutes
);


/**
 * PROTECTED ADMIN ROUTES
 */
app.use(
  "/api/admin",
  authMiddleware,
  requireRole([ROLES.ADMIN]),
  adminRoutes
);

app.use(
  "/api/soporte",
  authMiddleware,
  supportRoutes
);

app.use(
  '/api/periodos',
  authMiddleware,
  requireRole([ROLES.ADMIN, ROLES.DOCENTE]),
  periodosRoutes
);

/**
 * PROTECTED PADRE ROUTES
 */
app.use(
  "/api/padre",
  authMiddleware,
  requireRole([
    ROLES.PADRE,
    ROLES.ADMIN
  ]),
  padreRoutes
);

/**
 * PROTECTED BOLETAS ROUTES
 */
app.use(
  "/api/boletas",
  authMiddleware,
  boletasRoutes
);

/**
 * PROTECTED MENSAJES ROUTES
 */
app.use(
  "/api/mensajes",
  authMiddleware,
  mensajesRoutes
);


app.use(
  "/api/grades",
  authMiddleware,
  gradesRoutes
);



app.use(
  '/api/teacher',
  authMiddleware,
  requireRole([ROLES.ADMIN, ROLES.DOCENTE]),
  profeRoutes
);
app.use(
  '/api/admin-usuarios',
  authMiddleware,
  requireRole([ROLES.ADMIN]),
  adminUsuario
);
/**
 * SWAGGER DOCS
 */
if (
  process.env.NODE_ENV !== "production"
) {

  app.use(
    "/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec)
  );

}

/**
 * GLOBAL ERROR HANDLER
 * MUST BE LAST
 */
app.use(globalErrorHandler);

/**
 * START SERVER
 */
const PORT =
  process.env.PORT || 3000;

app.listen(PORT, () => {

  console.log(
    `🚀 Server running on port ${PORT}`
  );

  if (
    process.env.NODE_ENV !== "production"
  ) {

    console.log(
      `📖 Swagger docs: http://localhost:${PORT}/api-docs`
    );

  }

});
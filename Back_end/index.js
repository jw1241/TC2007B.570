require("dotenv").config({
  path: ".env.production"
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

/**
 * ROUTES
 */
const itemRoutes =
  require("./routes/items");

const adminRoutes =
  require("./routes/adminRoutes");

const authRoutes =
  require("./routes/authRoutes");

const regRoutes =
  require("./routes/registration.routes")

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

    console.error(
      "UNHANDLED REJECTION:",
      err
    );

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
app.use(helmet());

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
      return callback(null, true);
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

/**
 * GLOBAL RATE LIMITER
 */
const limiter = rateLimit({

  windowMs:
    15 * 60 * 1000,

  max: 100,

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
 * PUBLIC ROUTES
 */
app.use(
  "/api/auth",
  authRoutes,
  regRoutes
);

app.use(
  "/api/items",
  itemRoutes
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
app.use(errorHandler);

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
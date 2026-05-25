const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json()); // Analizar automáticamente los datos JSON

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
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

const PORT = process.env.PORT || 3000;

// Inicia back-end
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Swagger docs: http://localhost:${PORT}/api-docs`);
});
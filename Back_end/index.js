const express = require("express");
require("dotenv").config();

const app = express();

app.use(express.json()); // Analizar automáticamente los datos JSON

// Importar archivo de rutas
const itemRoutes = require("./routes/items");
app.use("/api/items", itemRoutes);

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
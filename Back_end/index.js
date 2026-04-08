const express = require("express"); // Construir una API
const dotenv = require('dotenv').config(); // Usar variables de .env

dotenv.config();

const app = express(); // Crear servidor
app.use(express.json()); 

app.use(express.json()); // Analizar automáticamente los datos JSON

const itemRoutes = require("./routes/items"); // Importar archivo de ruta
app.use("/api/items", itemRoutes);

// Carga la UI de Swagger y API config
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./swagger");

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

const PORT = process.env.PORT || 3000;

//  Inicia back-end
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
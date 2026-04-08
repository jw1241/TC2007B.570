const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Items API",
      version: "1.0.0",
      description: "API REST para gestión de items - Proyecto del socio formador",
    },
    servers: [
      {
        url: "http://localhost:3000",
        description: "Servidor de desarrollo",
      },
    ],
  },
  apis: ["./routes/*.js"], // Archivos donde buscar anotaciones Swagger
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;

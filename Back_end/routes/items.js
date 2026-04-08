const express = require("express");
const router = express.Router();

// "Base de datos" en memoria
let items = [
  { id: 1, name: "Item 1", description: "Descripción del item 1" },
  { id: 2, name: "Item 2", description: "Descripción del item 2" },
  { id: 3, name: "Item 3", description: "Descripción del item 3" },
];

let nextId = 4;

// ==================== RUTAS CRUD ====================

/**
 * @swagger
 * components:
 *   schemas:
 *     Item:
 *       type: object
 *       required:
 *         - name
 *         - description
 *       properties:
 *         id:
 *           type: integer
 *           description: ID auto-generado del item
 *         name:
 *           type: string
 *           description: Nombre del item
 *         description:
 *           type: string
 *           description: Descripción del item
 *       example:
 *         id: 1
 *         name: Item 1
 *         description: Descripción del item 1
 */

/**
 * @swagger
 * /api/items:
 *   get:
 *     summary: Obtener todos los items
 *     tags: [Items]
 *     responses:
 *       200:
 *         description: Lista de todos los items
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Item'
 */
router.get("/", (req, res) => {
  res.json(items);
});

/**
 * @swagger
 * /api/items/{id}:
 *   get:
 *     summary: Obtener un item por ID
 *     tags: [Items]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del item
 *     responses:
 *       200:
 *         description: Item encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Item'
 *       404:
 *         description: Item no encontrado
 */
router.get("/:id", (req, res) => {
  const item = items.find((i) => i.id === parseInt(req.params.id));
  if (!item) {
    return res.status(404).json({ message: "Item no encontrado" });
  }
  res.json(item);
});

/**
 * @swagger
 * /api/items:
 *   post:
 *     summary: Crear un nuevo item
 *     tags: [Items]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - description
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *             example:
 *               name: Nuevo Item
 *               description: Descripción del nuevo item
 *     responses:
 *       201:
 *         description: Item creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Item'
 *       400:
 *         description: Datos inválidos
 */
router.post("/", (req, res) => {
  const { name, description } = req.body;

  if (!name || !description) {
    return res
      .status(400)
      .json({ message: "Los campos 'name' y 'description' son requeridos" });
  }

  const newItem = {
    id: nextId++,
    name,
    description,
  };

  items.push(newItem);
  res.status(201).json(newItem);
});

/**
 * @swagger
 * /api/items/{id}:
 *   put:
 *     summary: Actualizar un item por ID
 *     tags: [Items]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del item
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *             example:
 *               name: Item actualizado
 *               description: Descripción actualizada
 *     responses:
 *       200:
 *         description: Item actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Item'
 *       404:
 *         description: Item no encontrado
 */
router.put("/:id", (req, res) => {
  const item = items.find((i) => i.id === parseInt(req.params.id));
  if (!item) {
    return res.status(404).json({ message: "Item no encontrado" });
  }

  const { name, description } = req.body;
  if (name) item.name = name;
  if (description) item.description = description;

  res.json(item);
});

/**
 * @swagger
 * /api/items/{id}:
 *   delete:
 *     summary: Eliminar un item por ID
 *     tags: [Items]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del item
 *     responses:
 *       200:
 *         description: Item eliminado exitosamente
 *       404:
 *         description: Item no encontrado
 */
router.delete("/:id", (req, res) => {
  const index = items.findIndex((i) => i.id === parseInt(req.params.id));
  if (index === -1) {
    return res.status(404).json({ message: "Item no encontrado" });
  }

  const deleted = items.splice(index, 1);
  res.json({ message: "Item eliminado", item: deleted[0] });
});

module.exports = router;

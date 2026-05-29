const express = require("express");
const router = express.Router();
const Joi = require("joi");

let items = [];
let nextId = 1;

const itemSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).required(),
  description: Joi.string().trim().min(2).max(500).required()
});

const updateSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100),
  description: Joi.string().trim().min(2).max(500)
}).min(1);

function validateId(id) {
  return Number.isInteger(id) && id > 0;
}

router.get("/", async (req, res, next) => {
  try {

    res.json({
      success: true,
      data: items
    });

  } catch (err) {
    next(err);
  }
});

router.get("/:id", async (req, res, next) => {
  try {

    const id = Number(req.params.id);

    if (!validateId(id)) {
      return res.status(400).json({
        error: { message: "ID inválido" }
      });
    }

    const item = items.find(i => i.id === id);

    if (!item) {
      return res.status(404).json({
        error: { message: "Item no encontrado" }
      });
    }

    res.json({
      success: true,
      data: item
    });

  } catch (err) {
    next(err);
  }
});

router.post("/", async (req, res, next) => {
  try {

    const { error, value } =
      itemSchema.validate(req.body);

    if (error) {
      return res.status(400).json({
        error: {
          message: "Datos inválidos",
          details: error.details.map(d => d.message)
        }
      });
    }

    const newItem = {
      id: nextId++,
      ...value
    };

    items.push(newItem);

    res.status(201).json({
      success: true,
      data: newItem
    });

  } catch (err) {
    next(err);
  }
});

router.put("/:id", async (req, res, next) => {
  try {

    const id = Number(req.params.id);

    if (!validateId(id)) {
      return res.status(400).json({
        error: { message: "ID inválido" }
      });
    }

    const item = items.find(i => i.id === id);

    if (!item) {
      return res.status(404).json({
        error: { message: "Item no encontrado" }
      });
    }

    const { error, value } =
      updateSchema.validate(req.body);

    if (error) {
      return res.status(400).json({
        error: {
          message: "Datos inválidos",
          details: error.details.map(d => d.message)
        }
      });
    }

    Object.assign(item, value);

    res.json({
      success: true,
      data: item
    });

  } catch (err) {
    next(err);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {

    const id = Number(req.params.id);

    if (!validateId(id)) {
      return res.status(400).json({
        error: { message: "ID inválido" }
      });
    }

    const index =
      items.findIndex(i => i.id === id);

    if (index === -1) {
      return res.status(404).json({
        error: { message: "Item no encontrado" }
      });
    }

    const deleted =
      items.splice(index, 1);

    res.json({
      success: true,
      message: "Item eliminado",
      data: deleted[0]
    });

  } catch (err) {
    next(err);
  }
});

module.exports = router;
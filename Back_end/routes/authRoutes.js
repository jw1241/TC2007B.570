const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../middleware/authMiddleware");
const authController = require("../controllers/authController");

const rateLimit = require("express-rate-limit");
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20
});

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Iniciar sesión con email y contraseña
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Inicio de sesión exitoso (Retorna Token)
 */
router.post("/login", authLimiter, authController.login);

/**
 * @swagger
 * /api/auth/reset-password:
 *   post:
 *     summary: Enviar correo de recuperación de contraseña
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 */
router.post("/reset-password", authLimiter, authController.resetPassword);

/**
 * @swagger
 * /api/auth/update-password:
 *   post:
 *     summary: Actualizar contraseña usando el access_token del correo
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - newPassword
 *             properties:
 *               newPassword:
 *                 type: string
 */

router.post("/update-password", authController.updatePassword);

/**
 * @swagger
 * /api/auth/registro-padres:
 *   post:
 *     summary: Registra a un Padre de Familia validando la matrícula del alumno
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - nombre_completo
 *               - matricula
 *               - fecha_nacimiento
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               nombre_completo:
 *                 type: string
 *               matricula:
 *                 type: string
 *               fecha_nacimiento:
 *                 type: string
 *                 format: date
 */
router.post("/registro-padres", authLimiter, authController.registroPadres);

router.get("/me", authMiddleware, authController.me);

module.exports = router;

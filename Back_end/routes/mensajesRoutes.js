const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../middleware/authMiddleware");
const mensajesController = require("../controllers/mensajesController");

/**
 * @swagger
 * /api/mensajes/contactos:
 *   get:
 *     summary: Obtener la lista de contactos disponibles para chatear
 *     tags: [Mensajes]
 *     security:
 *       - bearerAuth: []
 */
router.get("/contactos", authMiddleware, mensajesController.getContactos);

/**
 * @swagger
 * /api/mensajes/chat/{destinatario_id}:
 *   get:
 *     summary: Obtener historial de conversación con un usuario
 *     tags: [Mensajes]
 *     security:
 *       - bearerAuth: []
 */
router.get("/chat/:destinatario_id", authMiddleware, mensajesController.getChatConDestinatario);

/**
 * @swagger
 * /api/mensajes/enviar:
 *   post:
 *     summary: Enviar un mensaje a un destinatario
 *     tags: [Mensajes]
 *     security:
 *       - bearerAuth: []
 */
router.post("/enviar", authMiddleware, mensajesController.enviarMensaje);

router.get("/alumno/:alumno_id/parent", authMiddleware, mensajesController.getPadresDeAlumno);

router.get("/chat/:parent_id", authMiddleware, mensajesController.getChatConPadre);

router.get("/chat/alumno/:alumno_id", authMiddleware, mensajesController.getTodosChatsDeAlumno);

router.get("/alumno/:alumno_id/teachers", authMiddleware, mensajesController.getDocentesDeAlumno);

router.get("/alumno/:alumno_id/chat", authMiddleware, mensajesController.getChatAlumnoDocente);

router.get("/chat/:alumno_id/:teacher_id", authMiddleware, mensajesController.getChatIndividualDeAlumno);

module.exports = router;

const express = require("express");
const router = express.Router();

/**
 * @swagger
 * /api/admin/usuarios:
 *   get:
 *     summary: Obtener todos los usuarios del sistema
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de usuarios (Padres, Docentes, Administradores)
 *       401:
 *         description: No autenticado
 *       403:
 *         description: Requiere rol de administrador
 */
router.get("/usuarios", async (req, res) => {
  const { data, error } = await req.supabase
    .from('usuarios')
    .select('*');

  if (error) {
    return res.status(500).json({ error: error.message });
  }
  res.json(data);
});

/**
 * @swagger
 * /api/admin/alumnos:
 *   get:
 *     summary: Obtener la lista de alumnos
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de todos los alumnos
 */
router.get("/alumnos", async (req, res) => {
  // Nota: Si hay relaciones, asegúrate de que las tablas estén vinculadas mediante Foreign Keys
  const { data, error } = await req.supabase
    .from('alumnos')
    .select('*');

  if (error) {
    return res.status(500).json({ error: error.message });
  }
  res.json(data);
});

/**
 * @swagger
 * /api/admin/reportes:
 *   get:
 *     summary: Obtener métricas y estatus general
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Métricas del sistema
 */
router.get("/reportes", async (req, res) => {
  // En un caso real, aquí irían las validaciones y los conteos de las tablas
  res.json({
    status: "ok",
    metricas: {
      total_boletas: 150,
      boletas_firmadas: 120,
      boletas_pendientes: 30
    }
  });
});

module.exports = router;

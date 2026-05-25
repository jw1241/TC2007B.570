const express = require("express");
const router = express.Router();
const Joi = require("joi");
const { supabaseAdmin } = require("../config/supabaseClient");
const { supabaseAdmin } = require("../config/supabaseClient");

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
router.get("/usuarios", async (req, res, next) => {
  try {
    const { data, error } = await req.supabase
      .from('usuarios')
      .select('*');

    if (error) throw error;
    
    res.json(data);
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /api/admin/usuarios:
 *   post:
 *     summary: Crear un nuevo usuario (Docente, Padre, etc.) en Auth y base de datos
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - rol_id
 *               - nombre
 *             properties:
 *               email:
 *                 type: string
 *                 example: docente1@laluz.edu.mx
 *               password:
 *                 type: string
 *                 example: PasswordSeguro123
 *               rol_id:
 *                 type: integer
 *                 example: 2
 *               nombre:
 *                 type: string
 *                 example: Ana Martínez
 *     responses:
 *       201:
 *         description: Usuario creado exitosamente
 *       400:
 *         description: Faltan campos requeridos
 *       500:
 *         description: Error interno o falta SERVICE_ROLE_KEY
 */
router.post("/usuarios", async (req, res, next) => {
  try {
    if (!supabaseAdmin) {
      return res.status(500).json({ error: { message: "El backend no tiene configurado el SUPABASE_SERVICE_ROLE_KEY." } });
    }

    // Validación de entrada con Joi (Previene NoSQL/SQL injection en logs/app y fuerza esquema)
    const schema = Joi.object({
      email: Joi.string().email().required(),
      password: Joi.string().min(6).required(),
      rol_id: Joi.number().integer().positive().required(),
      nombre: Joi.string().trim().min(2).max(100).required()
    });

    const { error: validationError, value } = schema.validate(req.body);
    if (validationError) {
      return res.status(400).json({ 
        error: { 
          message: "Datos inválidos", 
          details: validationError.details.map(d => d.message) 
        } 
      });
    }

    const { email, password, rol_id, nombre } = value;

    // 1. Crear el usuario en Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true,
      user_metadata: { nombre, rol_id }
    });

    if (authError) throw authError;

    // 2. Insertar el perfil en la tabla pública 'usuarios'
    const { data: dbData, error: dbError } = await supabaseAdmin
      .from('usuarios')
      .insert([
        { id: authData.user.id, email, nombre, rol_id }
      ])
      .select()
      .single();

    if (dbError) {
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
      throw dbError;
    }

    res.status(201).json({ message: "Usuario creado exitosamente", usuario: dbData });
  } catch (err) {
    next(err);
  }
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
router.get("/alumnos", async (req, res, next) => {
  try {
    const { data, error } = await req.supabase
      .from('alumnos')
      .select('*');

    if (error) throw error;
    
    res.json(data);
  } catch (err) {
    next(err);
  }
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
router.get("/reportes", async (req, res, next) => {
  try {
    res.json({
      status: "ok",
      metricas: {
        total_boletas: 150,
        boletas_firmadas: 120,
        boletas_pendientes: 30
      }
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

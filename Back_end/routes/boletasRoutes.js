const express = require("express");
const router = express.Router();
const PDFDocument = require("pdfkit");
const { supabaseAdmin } = require("../config/supabaseClient");
const { authMiddleware } = require("../middleware/authMiddleware");

/**
 * @swagger
 * /api/boletas/{alumno_id}/descargar-pdf:
 *   get:
 *     summary: Generar y descargar la boleta en formato PDF
 *     tags: [Boletas]
 *     security:
 *       - bearerAuth: []
 */
router.get("/:alumno_id/descargar-pdf", authMiddleware, async (req, res, next) => {
  try {
    const { alumno_id } = req.params;

    // Obtener datos del alumno y grupo
    const { data: alumno, error: alumError } = await supabaseAdmin
      .from("alumnos")
      .select("nombre, apellidos, matricula, grupos(nombre, grado)")
      .eq("id", alumno_id)
      .single();

    if (alumError || !alumno) {
      return res.status(404).json({ error: { message: "Alumno no encontrado." } });
    }

    // Obtener calificaciones
    const { data: calificaciones, error: califError } = await supabaseAdmin
      .from("calificaciones")
      .select("trimestre, calificacion, materias(nombre)")
      .eq("alumno_id", alumno_id);

    if (califError) throw califError;

    // Agrupar calificaciones por materia
    const boletaMap = {};
    calificaciones.forEach(c => {
      const mat = c.materias.nombre;
      if (!boletaMap[mat]) boletaMap[mat] = { 1: "-", 2: "-", 3: "-" };
      boletaMap[mat][c.trimestre] = c.calificacion;
    });

    // Iniciar PDF
    const doc = new PDFDocument({ margin: 50 });

    // Configurar respuesta HTTP para forzar descarga
    res.setHeader("Content-Disposition", `attachment; filename=Boleta_${alumno.matricula}.pdf`);
    res.setHeader("Content-Type", "application/pdf");

    doc.pipe(res);

    // Encabezado
    doc.fontSize(20).text("Escuela Metropolitana 'La Luz'", { align: 'center' });
    doc.moveDown();
    doc.fontSize(14).text("Boleta de Calificaciones Oficial", { align: 'center' });
    doc.moveDown(2);

    // Datos del Alumno
    doc.fontSize(12).text(`Alumno: ${alumno.nombre} ${alumno.apellidos}`);
    doc.text(`Matrícula: ${alumno.matricula}`);
    doc.text(`Grupo: ${alumno.grupos.grado}° "${alumno.grupos.nombre}"`);
    doc.moveDown(2);

    // Tabla de Calificaciones (Simulada con texto posicionado)
    const tableTop = doc.y;
    const itemX = 50;
    const t1X = 250;
    const t2X = 350;
    const t3X = 450;

    doc.font('Helvetica-Bold');
    doc.text("Materia", itemX, tableTop);
    doc.text("Tri 1", t1X, tableTop);
    doc.text("Tri 2", t2X, tableTop);
    doc.text("Tri 3", t3X, tableTop);

    // Línea separadora
    doc.moveTo(50, doc.y + 5).lineTo(500, doc.y + 5).stroke();
    
    let y = doc.y + 15;
    doc.font('Helvetica');

    Object.keys(boletaMap).forEach(materia => {
      const notas = boletaMap[materia];
      doc.text(materia, itemX, y);
      doc.text(notas[1].toString(), t1X, y);
      doc.text(notas[2].toString(), t2X, y);
      doc.text(notas[3].toString(), t3X, y);
      y += 20;
    });

    // Línea final
    doc.moveTo(50, y).lineTo(500, y).stroke();
    doc.moveDown(4);

    // Pie de página / Firma
    doc.text("__________________________________", { align: 'center' });
    doc.text("Firma del Director", { align: 'center' });

    // Finalizar el documento
    doc.end();

  } catch (err) {
    console.error("Error generando PDF:", err);
    if (!res.headersSent) {
      next(err);
    }
  }
});

module.exports = router;

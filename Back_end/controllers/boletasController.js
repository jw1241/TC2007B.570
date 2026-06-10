const PDFDocument = require("pdfkit");
const Joi = require("joi");
const { supabaseAdmin } = require("../config/supabaseClient");

const generarBoletaIndividual = async (req, res, next) => {
  try {
    const { alumno_id } = req.params;
    const schema = Joi.object({
      alumno_id: Joi.string().required()
    });
    const { error: validationError } = schema.validate({ alumno_id });
    if (validationError) return res.status(400).json({ error: { message: validationError.details[0].message } });

    // Obtener datos del alumno y grupo
    const { data: alumno, error: alumError } = await supabaseAdmin
      .from("alumnos")
      .select("nombre, apellidos, matricula, grupos(grado, seccion)")
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
    doc.text(`Grupo: ${alumno.grupos?.grado || ''}° "${alumno.grupos?.seccion || ''}"`);
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
};

const generarBoletasMasivas = async (req, res, next) => {
  try {
    // Verificación estricta de seguridad: Solo el rol de administrador (1) puede descargar boletas masivas.
    if (!req.user || req.user.rol_id !== 1) {
      return res.status(403).json({ error: { message: "Acceso denegado. Se requieren privilegios de administrador." } });
    }

    const { data: alumnos, error: alumError } = await supabaseAdmin
      .from("alumnos")
      .select("id, nombre, apellidos, matricula, grupos(grado, seccion)");

    if (alumError) throw alumError;

    if (!alumnos || alumnos.length === 0) {
      return res.status(404).json({ error: { message: "No hay alumnos registrados." } });
    }

    const { data: calificaciones, error: califError } = await supabaseAdmin
      .from("calificaciones")
      .select("alumno_id, trimestre, calificacion, materias(nombre)");

    if (califError) throw califError;

    const doc = new PDFDocument({ margin: 50 });

    res.setHeader("Content-Disposition", `attachment; filename=Boletas_Masivas.pdf`);
    res.setHeader("Content-Type", "application/pdf");

    doc.pipe(res);

    for (let i = 0; i < alumnos.length; i++) {
      const alumno = alumnos[i];
      if (i > 0) doc.addPage();

      // Filtrar calificaciones de este alumno
      const califsAlumno = calificaciones.filter(c => c.alumno_id === alumno.id);
      
      const boletaMap = {};
      califsAlumno.forEach(c => {
        const mat = c.materias.nombre;
        if (!boletaMap[mat]) boletaMap[mat] = { 1: "-", 2: "-", 3: "-" };
        boletaMap[mat][c.trimestre] = c.calificacion;
      });

      // Encabezado
      doc.fontSize(20).text("Escuela Metropolitana 'La Luz'", { align: 'center' });
      doc.moveDown();
      doc.fontSize(14).text("Boleta de Calificaciones Oficial", { align: 'center' });
      doc.moveDown(2);

      // Datos del Alumno
      doc.fontSize(12).text(`Alumno: ${alumno.nombre} ${alumno.apellidos}`);
      doc.text(`Matrícula: ${alumno.matricula}`);
      doc.text(`Grupo: ${alumno.grupos?.grado || ''}° "${alumno.grupos?.seccion || ''}"`);
      doc.moveDown(2);

      // Tabla de Calificaciones
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

      doc.moveTo(50, y).lineTo(500, y).stroke();
      doc.moveDown(4);

      doc.text("__________________________________", { align: 'center' });
      doc.text("Firma del Director", { align: 'center' });

      // Ceder control al Event Loop (Tolerancia a fallos y rendimiento RNF02)
      // Permite que otras requests sigan siendo atendidas y evita el "blocking".
      if (i % 10 === 0) {
        await new Promise(resolve => setImmediate(resolve));
      }
    }

    doc.end();

  } catch (err) {
    console.error("Error generando PDF masivo:", err);
    if (!res.headersSent) {
      next(err);
    }
  }
};

module.exports = {
  generarBoletaIndividual,
  generarBoletasMasivas
};

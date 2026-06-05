const express = require('express');
const router = express.Router();
const { supabaseAdmin } = require('../config/supabaseClient');

router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('periodos_evaluacion')
      .select('*')
      .order('mes_inicio');

    if (error) {
      return res.status(500).json(error);
    }

    res.json(data || []);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: 'Error obteniendo periodos'
    });
  }
});

module.exports = router;
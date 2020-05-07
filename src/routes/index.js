const express = require('express');
const router = express.Router();

const pool = require('../database');

// console.log(pool);

router.get('/', async (req, res) => {
    // const registros = await pool.query('SELECT * FROM dolares');
    res.render('dollar/list');
});

module.exports = router;
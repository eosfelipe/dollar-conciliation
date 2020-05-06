const express = require('express');
const router = express.Router();

const pool = require('../database');

console.log(pool);

router.get('/', (req, res) => {
    
});

module.exports = router;
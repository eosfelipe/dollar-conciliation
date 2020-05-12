const express = require('express');
const router = express.Router();

const pool = require('../database');
const gt = require('../lib/functions'); 

// console.log(pool);

router.get('/', async (req, res) => {
    // const procedure = await pool.query("call create_tmptables();");

    const registros = await pool.query("select concat(centro,substr(fecha,7,4),'-',substr(fecha,4,2),'-',substr(fecha,1,2)) as idunico,centro,caja,ticket,id_fpt,usr,fecha,hora,dlls as dlls,venta,no_auto,canc from dolar order by idunico asc;");

    res.render('dollar/list', { registros });
});

router.get('/comparar', async (req, res) => {
    const procedure = await pool.query("call create_tmptables();");
    console.log(procedure);

    const registros = await pool.query("select td.idunico as recuperados,tg.idunico as griselda, td.dlls + tg.total_general as diferencia from tmpdolar td inner join tmpgriselda tg on td.idunico = tg.idunico;");

    res.render('dollar/comparison', { registros });
});

router.get('/generar', async (req, res) => {
    // if(gt()){
    //     console.log('ok');
    // }
    res.render('dollar/generate');
});

router.post('/generar', async (req, res) => {
    const { _token } = req.body;
    
    if( typeof _token === 'string' ){
        let response = true
        gt();
        res.render('dollar/generate', {response});
    }else {
        res.send('algo salió mal :(');
    }
});

module.exports = router;
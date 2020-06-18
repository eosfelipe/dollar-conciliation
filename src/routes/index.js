const express = require('express');
const router = express.Router();

const pool = require('../database');
const file = require('../lib/functions');
const axios = require('axios');
const fs = require('fs');
const moment =require('moment');

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
    // if(file()){
    //     console.log('ok');
    // }
    res.render('dollar/generate');
});

router.post('/generar', async (req, res) => {
    const { _token } = req.body;

    if (typeof _token === 'string') {
        let response = true
        file.genTXT();
        res.render('dollar/generate', { response });
    } else {
        res.send('algo salió mal :(');
    }
});

router.get('/canfac', async (req, res) => {
    res.render('fac/cancel');
});

router.post('/canfac', async (req, res) => {
    const END_POINT = 'http://10.32.1.138/restful/index.php/sucursales/sucursal/';
    const { cc, folio } = req.body;
    const response = await axios.get(END_POINT + cc);
    const sucursal = response.data.sucursal;
    let render = null;

    const content = 
    { 
        folio: folio,
        serie: sucursal.prefijo,
        rfc_emisor: "PPA831231GI0",
        fecha_cancelacion: moment(Date.now()).format('YYYY-MM-DD'),
        hora_cancelacion: moment(Date.now()).format('HH:mm:ss'),
        motivo_cacelacion: "Factura reemplazada"
    }

    fs.writeFile(`./can_json/CAN${cc}${sucursal.prefijo}${folio}.json`, JSON.stringify(content), (error) => {
        if (error) {
            console.log(error);
        }
        console.log('Successfully generated file .CAN');
    });
    render = {...content, ok: true};
    // res.status(200).send('res');
    res.render('fac/cancel', { render });
});

module.exports = router;
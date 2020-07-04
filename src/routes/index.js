const express = require('express');
const router = express.Router();

const pool = require('../database');
const file = require('../lib/functions');
const axios = require('axios');
const fs = require('fs');
const moment = require('moment');
const path = require('path');
const { nextTick } = require('process');

let message = {};

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

// router.get('/canfac', async (req, res) => {
//     res.render('fac/cancel');
// });

router.get('/json', async (req, res) => {
    const fullPath = path.join(process.cwd(), '/can_json');
    const dir = fs.opendirSync(fullPath);
    let entity;
    let listing = [];
    while ((entity = dir.readSync()) !== null) {
        if (entity.isFile()) {
            listing.push({ type: 'f', name: entity.name });
        } else if (entity.isDirectory()) {
            listing.push({ type: 'd', name: entity.name });
        }
    }
    dir.closeSync();

    // res.send(listing);
    // console.log(listing)
    message.files = listing;
    res.render('fac/invoice', { message });
});

router.get('/download/:name', (req, res, next) => {
    const fileName = req.params.name;
    const options = {
        root: path.join(process.cwd(), '/can_json'),
        dotfiles: 'deny',
        headers: {
            'x-timestamp': Date.now(),
            'x-sent': true
        }
    }
    res.download(path.join(process.cwd(), `/can_json/${fileName}`), (err) => {
        if (err) {
            next(err);
        } else {
            console.log('Sent: ', fileName);
        }
    });
});

router.post('/canfac', async (req, res) => {
    const END_POINT = 'http://10.32.1.138/restful/index.php/sucursales/sucursal/';
    const { cc, folio } = req.body;
    const response = await axios.get(END_POINT + cc);
    const sucursal = response.data.sucursal;

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
    message = { ...content, ok: true, msg: `Successfully generated file .CAN Folio: ${content.folio}` };
    // res.status(200).send('res');
    // res.download(`./can_json/CAN${cc}${sucursal.prefijo}${folio}.json`)
    res.redirect('/json');
});

router.post('/upload', (req, res) => {
    let msg = null;
    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).send('No files were uploaded');
    }

    let jf = req.files.jsonFile;

    jf.mv(`./fac_json/${jf.name}`, (err) => {
        if (err) return res.status(500).send(err);

        message = { ok: true, msg: `Successfully uploaded file ${jf.name}` };
        res.redirect('/json');
    });
});

module.exports = router;
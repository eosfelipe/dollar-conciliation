const pool = require('../database');
const fs = require('fs');
async function genTxt() {
    let total = 0;
    let content = '';
    let count = 0;
    let body = '';
    let header = '';

    for (let dia = 1; dia < 32; dia++) {
        let results;
        if (dia < 10) {
            results = await pool.query("select concat(substr(fecha,7,4),'/',substr(fecha,4,2),'/',substr(fecha,1,2),' ',hora) as fecha_hora, centro,usr,round(dlls,2) as dlls,round(venta,2) as venta, concat(centro,'0',caja,ticket,id_fpt,concat(substr(fecha,7,4),substr(fecha,4,2),substr(fecha,1,2))) as id from dolar where fecha like '0" + dia + "/04/2020';");

        }
        else {
            results = await pool.query("select concat(substr(fecha,7,4),'/',substr(fecha,4,2),'/',substr(fecha,1,2),' ',hora) as fecha_hora, centro,usr,round(dlls,2) as dlls,round(venta,2) as venta, concat(centro,'0',caja,ticket,id_fpt,concat(substr(fecha,7,4),substr(fecha,4,2),substr(fecha,1,2))) as id from dolar where fecha like '" + dia + "/04/2020';");
        }

        if (results.length !== 0) {
            count = results.length;
            for (let i = 0; i < results.length; i++) {
                body += `5701|${results[i].fecha_hora}|${results[i].centro}|${results[i].usr}|0|840|${Number(results[i].dlls).toFixed(2)}|${Number(results[i].venta).toFixed(2)}|21.00|0|${results[i].id}\n`;

                total += results[i].dlls;

            }
            header = `HDR|T6AH4ADX|N23BZQ3O|${count}|${Number(total).toFixed(2)}|0\n`;
            content = header + body;

            fs.writeFile(`./txt/20200511_${dia}.txt`, content, (err) => {
                if (err) {
                    return console.log(err);
                }
                console.log('The file was saved!')
            });
        }
        total = 0;
        content = '';
        count = 0;
        body = '';
        header = '';
    }
    return true;
}

module.exports = genTxt;
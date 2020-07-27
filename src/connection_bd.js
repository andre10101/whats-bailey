var mysql = require('mysql');


export function verifyQrCode(numero) {
    var con = mysql.createConnection({
        host: "179.188.38.36",
        user: "andre.seremeta",
        password: "AtriaABC28*Andre",
        port: 3306,
        database: "praweb"
    });
    var token;
    return new Promise((resolve, reject) => {

        con.query("SELECT * FROM praweb.numero_token where numero = '" + numero + "'", function (err, result) {
            if (err) {
                reject(err)
            }

            if (result && result.length) {
                // console.log("Result: " + ƒJSON.stringify(result));
                let aux = JSON.stringify(result);
                token = JSON.parse(result[0].extra);
            }

            if (token) {
                resolve(token);
            } else {
                resolve(null);
            };
        });

    })

};


export function authenticated(session, numero) {
    var con = mysql.createConnection({
        host: "179.188.38.36",
        user: "andre.seremeta",
        password: "AtriaABC28*Andre",
        port: 3306,
        database: "praweb"
    });
    return new Promise((resolve, reject) => {
        console.log("Connected 2!");

        let query = " INSERT INTO praweb.numero_token SET ? ON DUPLICATE KEY UPDATE extra = ?"

        let values = {
            numero: numero,
            extra: JSON.stringify(session)
        }

        let sql = con.format(query, [values, JSON.stringify(session)]);

        con.query(sql, function (err) {
            if (err) {
                reject(err)
            } else {
                resolve(true)
            }
        });
    });
};
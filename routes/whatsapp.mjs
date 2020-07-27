const express = require('express');
import { WAClient } from '@adiwajshing/baileys'
var QRCode = require('qrcode')
var conection = require("../src/connection_bd.js")


module.exports = function (io) {
  let router = express.Router()

  // define routes
  // io is available in this scope

  router.get("/whats/:num", async function (req, res) {
    var client = new WAClient()
    client.close();
    var send_by = req.params.num;
    let token = await conection.verifyQrCode(send_by);
    let url;

    if (token) {
      let user = await client.connect(token);
      const creds = client.base64EncodedAuthInfo();
      client.close();
      return res.status(200).json({ msg: "Esta pronto pra ser usado." });
    } else {
      client.onReadyForPhoneAuthentication = async ([ref, publicKey, clientID]) => {
        ref = await client.generateNewQRCode ();
        let str = ref + ',' + publicKey + ',' + clientID 
        // console.log("str",str)
        url = await QRCode.toDataURL(str);
        res.render('index', { title: url });
      }
      let user = await client.connect();
      io.emit('conectado', "sucesso");
      const creds = client.base64EncodedAuthInfo();
      await conection.authenticated(creds, send_by);
      client.close();
      return;
    }
  })


  return router;
}
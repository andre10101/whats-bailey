const express = require('express');
import { WAClient } from '@adiwajshing/baileys'
import { MessageType } from '@adiwajshing/baileys';
var QRCode = require('qrcode')
var conection = require("../src/connection_bd.js")


module.exports = function (io) {
  let router = express.Router()


  /* GET home page. */
  router.get('/', function (req, res, next) {
    res.render('index', { title: 'Express' });
  });


  /* Verificar/Registrar Numero*/
  router.get("/whats/:num", async function (req, res) {
    var client = new WAClient()
    client.close();
    var send_by = req.params.num;
    let token = await conection.verifyQrCode(send_by);

    if (token) {
      try {
        client.loadAuthInfoFromBase64(token)
        let user = await client.connectSlim(null, 20*1000);
        // console.log("user", user)
        const creds = client.base64EncodedAuthInfo();
        client.close();
        return res.status(200).json({ msg: "Esta pronto pra ser usado." });
      } catch (e) {
        // console.log("err", e)
        generateQRCode(res, send_by);
      }
    } else {
      generateQRCode(res, send_by);
    }
  })

  /*send Message */
  router.post("/whats", checkAuthTokenMiddleware, async function (req, res) {
    var client = new WAClient();
    client.close();
    var send_by = req.body.send_by;
    var send_to = req.body.send_to;
    var msg = req.body.msg;

    var msg = req.body.msg;

    console.log("send_by", send_by)
    let token = await conection.verifyQrCode(send_by);


    if (token) {
      try {
        client.loadAuthInfoFromBase64(token)
        await client.connectSlim(null, 20*1000);
        let id = send_to + '@s.whatsapp.net' // the WhatsApp ID 
        await client.sendMessage(id, msg, MessageType.text)
        client.close();
        return res.status(200).json({ msg: "Enviando Mensagem via whatsapp.." });
      } catch (err) {
        console.log("unexpected error: " + err)
        return res.status(400);
      }
    } else {
      client.close();
      return res.status(200).json({ msg: "Não esta pronto pra ser usado" });
    }
  });

  function checkAuthTokenMiddleware(req, res, next) {
    if (req.headers && req.headers.token) {
      let token = req.headers.token;
      if (token === undefined) {
        // access token - missing
        return next(new Error("Authorization header required."));
      } else if (token == "d76e45028a10cfba523b17118f99e2e3") {
        return next();
      } else {
        return next(new Error("Token invalid."));
      }
      // add something here to ensure the token is valid
    } else {
      return next(new Error("Authorization header required."));
    }
  }

  async function generateQRCode(res, send_by) {
    let url;
    var client = new WAClient()
    client.onReadyForPhoneAuthentication = async ([ref, publicKey, clientID]) => {
      ref = await client.generateNewQRCode();
      let str = ref + ',' + publicKey + ',' + clientID;
      url = await QRCode.toDataURL(str);
      res.render('index', { title: url });
    }
    try{
    let user = await client.connectSlim(null, 20*1000);
    io.emit('conectado', "sucesso");
    const creds = client.base64EncodedAuthInfo();
    await conection.authenticated(creds, send_by);
    client.close();
    return;
    } catch(err) {
      io.emit('conectado', "error");
      return
    }
  }

  return router;
}
var express = require('express');
var router = express.Router();
import { WAClient } from '@adiwajshing/baileys'
import { MessageType } from '@adiwajshing/baileys'
var QRCode = require('qrcode')

const client = new WAClient()
var conection = require("../src/connection_bd.js")


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

/* GET home page. */
router.get('/', function (req, res, next) {
  console.log("__dirname", __dirname)
  res.sendFile(__dirname + '/index.html');
  // res.render('index', { title: 'Express' });
});



router.post("/whats", checkAuthTokenMiddleware, async function (req, res) {
  var send_by = req.body.send_by;
  var send_to = req.body.send_to;
  var msg = req.body.msg;

  var msg = req.body.msg;

  console.log("se", send_by)
  let token = await conection.verifyQrCode(send_by);

  // console.log("token", token)
  const id = send_to + '@s.whatsapp.net' // the WhatsApp ID 
  // send a simple text!
  if (token) {
    client.connectSlim(token) // does not wait for chats & contacts
      .then(async user => {
        await client.sendMessage(id, msg, MessageType.text)
        client.close();
        return res.status(200).json({ msg: "enviando Mensagem via whatsapp.." });
      })
      .catch(err => {
        console.log("unexpected error: " + err)
        return res.status(400);
      })
  } else {
    client.close();
    return res.status(200).json({ msg: "Não esta pronto pra ser usado" });
  }
});

module.exports = router;

"use strict";
var express = require('express');
var router = express.Router();

router.get("/ping", function (req, res) {
    return res.status(200).send("pong");
});


//router.use(OMSCORE._auth.BaseAuth);


router.use('/settings', require('./SettingsRoute'));
//router.use('/invoices', require('./InvoicesRoute'));

module.exports = router;
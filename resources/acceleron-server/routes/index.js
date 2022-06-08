"use strict";
var express = require("express");
var router = express.Router();

var swaggerUi = require("swagger-ui-express");
var swaggerDocument = require("../docs/swagger.js");

router.get("/ping", function (req, res) {
  return res.status(200).send("pong");
});

/* Swagger Documentation */
router.get("/", function (req, res, next) {
  res.redirect("/apidocs");
});
router.use("/apidocs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
router.get("/apidocs.json", function (req, res, next) {
  res.status(200).json(swaggerDocument);
});

/* Basic Authentication */
router.use(ACCELERONCORE._auth.BaseAuth);
router.use("/settings", require("./SettingsRoute"));
router.use("/table", require("./TableRoute"));
router.use("/kot", require("./KOTRoute"));
router.use("/user", require("./UserRoute"));
router.use("/summary", require("./SummaryRoute"));
router.use("/menu", require("./MenuRoute"));
router.use("/managemenu", require("./ManageMenuRoute"));
router.use("/license", require("./LicenseRoute"));
router.use("/pending-bill", require("./PendingBillRoute"));
router.use("/settled-bill", require("./SettledBillRoute"));
router.use("/billing", require("./BillingModuleRoute"));
router.use("/cancelled-order", require("./CancelledOrderRoute"));
router.use("/cancelled-invoice", require("./CancelledInvoiceRoute"));
router.use("/login", require("./LoginRoute"));

module.exports = router;

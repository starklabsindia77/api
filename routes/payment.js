
var connection = require('../middlewares/database');
var upload = require('../middlewares/upload');
var verify = require('../middlewares/verify-token');
const express = require("express");
const app = express();
const cors = require('cors')
const _ = require('lodash');
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const bcrypt = require('bcryptjs');
var Guid = require('guid');
const config = require("../key");
// const fetch = require('node-fetch');
const { isNull } = require('lodash');
const formidable = require('formidable');
var Promise = require("bluebird");
Promise.longStackTraces();
var cron = require('node-cron');
const validateUserToken = require('../middlewares/verify-token');
const checksum_lib = require('../middlewares/checksum');




serverUrl = config.serverUrl
app.use(cors());
app.set('view engine', 'ejs');
//to not get any deprecation warning or error
//support parsing of application/x-www-form-urlencoded post data
app.use(bodyParser.json({ limit: '50mb' }));
// app.use(bodyParser.urlencoded());
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
//to get json data
// support parsing of application/json type post data
app.use(cookieParser());

function generateUniqueId(prefix = "ORD") {
    const timestamp = Date.now().toString(36).toUpperCase();
    const randomChars = Math.random().toString(36).substr(2, 6).toUpperCase();
    return `${prefix}-${timestamp}-${randomChars}`;
  }


//PAYTM CONFIGURATION
var PaytmConfig = {
  mid: "YOUR_MERCHANT_ID",
  key: "YOUR_MERCHANT_KEY",
  website: "WEBSTAGING"
};

var txn_url = "https://securegw-stage.paytm.in/order/process"; // for staging

var callbackURL = "http://10.0.2.2:3001/api/paymentReceipt";

//CORS ACCESS CONTROL
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

app.post("/payment", (req, res) => {
  let paymentData = req.body;
  const uniqueOrderId = generateUniqueId();
  var params = {};
  params["MID"] = PaytmConfig.mid;
  params["WEBSITE"] = PaytmConfig.website;
  params["CHANNEL_ID"] = "WEB";
  params["INDUSTRY_TYPE_ID"] = "Retail";
  //params["ORDER_ID"] = paymentData.orderID;
  params["ORDER_ID"] = uniqueOrderId;
  params["CUST_ID"] = paymentData.custID;
  params["TXN_AMOUNT"] = paymentData.amount;
  params["CALLBACK_URL"] = callbackURL;
  params["EMAIL"] = paymentData.custEmail;
  params["MOBILE_NO"] = paymentData.custPhone;

  checksum_lib.genchecksum(params, PaytmConfig.key, (err, checksum) => {
    if (err) {
      console.log("Error: " + e);
    }

    var form_fields = "";
    for (var x in params) {
      form_fields +=
        "<input type='hidden' name='" + x + "' value='" + params[x] + "' >";
    }
    form_fields +=
      "<input type='hidden' name='CHECKSUMHASH' value='" + checksum + "' >";

    res.writeHead(200, { "Content-Type": "text/html" });
    res.write(
      '<html><head><title>Merchant Checkout Page</title></head><body><center><h1>Please do not refresh this page...</h1></center><form method="post" action="' +
        txn_url +
        '" name="f1">' +
        form_fields +
        '</form><script type="text/javascript">document.f1.submit();</script></body></html>'
    );
    res.end();
  });
});

app.post("/paymentReceipt", (req, res) => {
  let responseData = req.body;
  var checksumhash = responseData.CHECKSUMHASH;
  var result = checksum_lib.verifychecksum(
    responseData,
    PaytmConfig.key,
    checksumhash
  );
  if (result) {
    return res.send({
      status: 0,
      data: responseData
    });
  } else {
    return res.send({
      status: 1,
      data: responseData
    });
  }
});


module.exports = app;
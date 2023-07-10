
var connection = require('../middlewares/database');
var upload = require('../middlewares/uploadCloudinary');

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
const verifyToken = require('../middlewares/verify-token');




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

// Define the GET API for products
app.get('/products', async (req, res) => {
  try {
    // make sure that any items are correctly URL encoded in the connection string     
    let result;
    let queryStr;
    // let expert = req.decoded.user;


    queryStr = `SELECT * FROM products`;



    await connection.query(queryStr, async function (error, results, fields) {
      // console.log(error, results);
      if (error) {
        // console.log("error", error);
        res.send({ message: "error", err: error });
      } else {
        result = JSON.parse(JSON.stringify(results));
        res.send({ status: true, data: result });
      }
    });
  } catch (err) {
    // ... error checks
    console.log("errornew", err);
    res.send(err);
  }
  // res.send({ status: true, data: mockProducts});
});

app.get('/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const queryStr = `SELECT * FROM products WHERE id = ?`;
    
    await connection.query(queryStr, [id], function (error, results, fields) {
      if (error) {
        res.send({ message: "error", err: error });
      } else {
        const result = JSON.parse(JSON.stringify(results));
        // Check if product exists
        if (result.length > 0) {
          res.send({ status: true, product: result[0] });
        } else {
          res.send({ status: false, message: "No product found with the provided id" });
        }
      }
    });
  } catch (err) {
    console.log("errornew", err);
    res.send(err);
  }
});

app.post('/products',  upload, (req, res) => {
  let product = req.body;  
  var sqlQuery = 'INSERT INTO `products` (`title`,`description`,`star`,`sold`,`price`,`cover`, `images`, `code`, `sku`, `priceSale`, `taxes`, `inStock`, `created_at`,`updated_at`) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)';
  var values = [product.title, product.description, 4.5, 231, product.price, product.cover, product.images, product.code, product.sku, product.priceSale, product.taxes, product.inStock, new Date().toJSON().slice(0, 19).replace('T', ' '), new Date().toJSON().slice(0, 19).replace('T', ' ')];

  connection.query(sqlQuery, values, (err, result) => {
    if (err) throw err;
    console.log(result);
    res.send('Product inserted...');
  });
});

// Update product
app.put('/products/:id', upload, (req, res) => {
  let product = req.body;
  const { id } = req.params;

  var sqlQuery = 'UPDATE `products` SET `title`=?, `description`=?, `star`=?, `sold`=?, `price`=?, `cover`=?, `images`=?, `code`=?, `sku`=?, `priceSale`=?, `taxes`=?, `inStock`=?, `updated_at`=? WHERE `id`=?';
  
  var values = [product.title, product.description, 4.5, 231, product.price, product.cover, product.images, product.code, product.sku, product.priceSale, product.taxes, product.inStock, new Date().toJSON().slice(0, 19).replace('T', ' '), id];

  connection.query(sqlQuery, values, (err, result) => {
    if (err) throw err;
    console.log(result);
    res.send('Product updated...');
  });
});

// Delete product
app.delete('/products/:id', async (req, res) => {
  const { id } = req.params;
  console.log("delete ", id);
  try {

    connection.query('DELETE FROM Products WHERE id = ?', [id], (err, result) => {
      if (err) throw err;
      console.log(result);
      res.send({ message: "Product deleted successfully" });
    });


  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


module.exports = app;
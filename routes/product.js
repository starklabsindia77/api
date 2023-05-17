
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


const mockProducts = [
    {
      id: "1",
      title: 'Foam Padded Chair',
      star: 4.5,
      sold: 8374,
      price: 120.00,
      icon: 'https://res.cloudinary.com/dsty70mlq/image/upload/v1684343987/foam_padded_chair_2x_rzevjg.png',
    },
    {
      id: "2",
      title: 'Small Bookcase',
      star: 4.7,
      sold: 7483,
      price: 145.40,
      icon: 'https://res.cloudinary.com/dsty70mlq/image/upload/v1684343987/book_case_2x_qq8wq2.png',
    },
    {
      id: "3",
      title: 'Glass Lamp',
      star: 4.3,
      sold: 6937,
      price: 40.00,
      icon: 'https://res.cloudinary.com/dsty70mlq/image/upload/v1684343987/lamp_s7ikym.png',
    },
    {
      id: "4",
      title: 'Glass Package',
      star: 4.9,
      sold: 8174,
      price: 55.00,
      icon: 'https://res.cloudinary.com/dsty70mlq/image/upload/v1684343987/class_package_2x_aaoy78.png',
    },
    {
      id: "5",
      title: 'Plastic Chair',
      star: 4.6,
      sold: 6843,
      price: 65.00,
      icon: 'https://res.cloudinary.com/dsty70mlq/image/upload/v1684343987/plastic_chair_2x_dytymk.png',
    },
    {
      id: "6",
      title: 'Wooden Chairs',
      star: 4.5,
      sold: 7758,
      price: 69.00,
      icon: 'https://res.cloudinary.com/dsty70mlq/image/upload/v1684343987/wooden_chairs_szl9th.png',
    },
    // Add more products as needed...
  ];
  
  // Define the GET API for products
  app.get('/products', (req, res) => {
    res.send({ status: true, data: mockProducts});
  });


module.exports = app;
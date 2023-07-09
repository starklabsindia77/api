
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
  app.get('/products', async  (req, res) => {

    try {
        // make sure that any items are correctly URL encoded in the connection string     
        let result;
        let queryStr;
        // let expert = req.decoded.user;

        
        queryStr = `SELECT * FROM products`;
        
        
            
        await connection.query(queryStr, async function (error, results, fields) {
            // console.log(error, results);
            if (error){
                // console.log("error", error);
                res.send({ message:"error", err:error });
            }else {                
                result =JSON.parse(JSON.stringify(results));             
                res.send({ status: true, data: result});
            }
        });
    } catch (err) {
        // ... error checks
        console.log("errornew", err);
        res.send(err);
    }
    // res.send({ status: true, data: mockProducts});
  });

  app.post('/products', upload, (req, res) => {
    let product = req.body;
    console.log("products", product);
    var sqlQuery = 'INSERT INTO `products` (`title`,`description`,`star`,`sold`,`price`,`icon`,code, sku, priceSale, taxes, inStock `created_at`,`updated_at`) VALUES (?,?,?,?,?,?,?,?)';
    var values = [product.title, product.description, 4.5, 231, product.price, product.icon, product.code, product.sku, product.priceSale, product.taxes, product.inStock, product.created_at, product.updated_at];

    connection.query(sqlQuery, values, (err, result) => {
        if(err) throw err;
        console.log(result);
        res.send('Product inserted...');
    });
  });

// Update product
app.put('/products/:id', async (req, res) => {
    const { title, description, star, sold, price, icon } = req.body;
    const { id } = req.params;
    try {
        const [rows, fields] = await connection.query('UPDATE Products SET title = ?, description = ?, star = ?, sold = ?, price = ?, icon = ? WHERE id = ?', [title, description, star, sold, price, icon, id]);
        res.json({ message: "Product updated successfully" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Delete product
app.delete('/products/:id', async (req, res) => {
    const { id } = req.params;
    console.log("delete ", id);
    try {

      connection.query('DELETE FROM Products WHERE id = ?', [id], (err, result) => {
          if(err) throw err;
          console.log(result);
          res.send({ message: "Product deleted successfully" });
      });
        
       
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


module.exports = app;
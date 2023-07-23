
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
const { v4: uuidv4 } = require('uuid');
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

function generateUniqueOrderId() {
    // Generate a timestamp (number of milliseconds since Jan 1, 1970)
    const timestamp = Date.now().toString();
  
    // Generate a random string using Math.random() and convert it to base36
    const randomString = Math.random().toString(36).substr(2, 5);
  
    // Concatenate the timestamp and random string to create the unique order ID
    const orderId = timestamp + randomString;
  
    return orderId;
  }

async function getUserinfo(userId) {
    let insertQuery = "SELECT * FROM users Where id = " + userId + "";
    await connection.query(insertQuery, async function (error, results, fields) {        
        if (error) {
            console.log("error insert", error);           
        } else {
          result = JSON.parse(JSON.stringify(results[0]));
          console.log("user info", result);
          return result;
        }
    });
}

  
  // Define the GET API for orders
  app.get('/orders', async  (req, res) => {

    try {        
        let result;
        let queryStr;    
        queryStr = `SELECT * FROM orders`;      
        
            
        await connection.query(queryStr, async function (error, results, fields) {
            // console.log(error, results);
            if (error){                
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
  });

  app.get('/orders/user/:userId', async  (req, res) => {
    const { userId } = req.params;
    try {        
        let result;
        let queryStr; 
        queryStr = `select * from orders as od left Outer Join users as u On u.id = od.user_id where u.id = ${userId}`;
        
        await connection.query(queryStr, async function (error, results, fields) {
            // console.log(error, results);
            if (error){              
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
  });

  app.get('/orders/:id', async  (req, res) => {
    const { id } = req.params;
    try {         
        let result;
        let queryStr;      

        queryStr = `SELECT * FROM orders where id = ${id}`;

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
  });

  
app.post('/addOrder', async (req, res) => {
    const guid = uuidv4();
    const userId = req.body.user_id;
    const userInfo = await getUserinfo(userId);
    const createDate = new Date().toISOString().slice(0, 19).replace('T', ' ');
    const updatedDate = createDate; // Set the same as createDate for the initial insert
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 20);
    const orderId = generateUniqueOrderId();

    console.log("user info 222", userInfo);
    const { user_id, trans_id, sub_total, shipping_fee, gst, total, cart_info, shipping_info, status} = req.body;
    let query = 'INSERT INTO `databaseastro`.`orders` (`guid`, `order_id`, `user_id`, `trans_id`, `sub_total`, `shipping_fee`, `gst`,`total`, `cart_info`, `shipping_info`, `status`, `userInfo`, `createDate`, `updatedDate`, `dueDate`) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
    try {
         await connection.query(query, [guid, orderId, user_id, trans_id, sub_total, shipping_fee, gst, total, JSON.stringify(cart_info), JSON.stringify(shipping_info), status, JSON.stringify(userInfo), createDate, updatedDate, dueDate], async function (error, results, fields) {
            console.log(error, results);
            if (error){               
                res.send({ message:"error", err:error });
            }else {                
                result =JSON.parse(JSON.stringify(results));             
                res.send({ status: true, data: result, message: "Order created successfully"});
            }
        });      
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Update product
app.put('/order/:id', async (req, res) => {
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
app.delete('/order/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const [rows, fields] = await connection.query('DELETE FROM Products WHERE id = ?', [id]);
        res.json({ message: "Product deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


module.exports = app;
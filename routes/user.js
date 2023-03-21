
var mysql      = require('mysql');
const express = require("express");
const app = express();
const cors = require('cors')
const _ = require('lodash');
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
var Guid = require('guid');
const config = require("../key");
// const fetch = require('node-fetch');
const { isNull } = require('lodash');
const formidable = require('formidable');
var Promise = require("bluebird");
Promise.longStackTraces();
var cron = require('node-cron');


serverUrl = config.serverUrl
const dbString = config.dbString;
let enableJobs = config.enableJobs;
app.use(cors())
//to not get any deprecation warning or error
//support parsing of application/x-www-form-urlencoded post data
app.use(bodyParser.json({ limit: '50mb' }));
// app.use(bodyParser.urlencoded());
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
//to get json data
// support parsing of application/json type post data
app.use(cookieParser());



var connection = mysql.createConnection({
    host     : config.host,
    user     : config.user,
    password : config.password,
    port: config.port,
    database : config.database
  });


connection.connect((error) => {
    if (error) {
        console.error('Error connecting to MySQL server: ', error);
        return;
    }
    console.log('Connected to MySQL server.');
});


// admin get all users 
app.get('/user', async (req, res) => {
    try {
        // make sure that any items are correctly URL encoded in the connection string       
        let result;
        let queryStr = "SELECT * FROM users";
        
        await connection.query(queryStr, async function (error, results, fields) {
            if (error){
                // console.log("error", error);
                res.send({ message:"error", err:error });
            }else if(results.length > 0 ){
                result =JSON.parse(JSON.stringify(results[0]));                
                // await updateOTP(result.id, otp, phone);     
                res.send({ status: true, data: result});
            }else{
                res.send({ status: true, data: []});
            } 
        });
    } catch (err) {
        // ... error checks
        console.log("errornew", err);
        res.send(err);
    }
});


// admin get single users 
app.get('/user/:id', async (req, res) => {
    let userId = req.params.id
    try {
        // make sure that any items are correctly URL encoded in the connection string       
        let result;
        let queryStr = "SELECT * FROM users Where id = '"+ userId +"'";
        
        await connection.query(queryStr, async function (error, results, fields) {
            if (error){
                // console.log("error", error);
                res.send({ message:"error", err:error });
            }else if(results.length > 0 ){
                result =JSON.parse(JSON.stringify(results[0]));                
                // await updateOTP(result.id, otp, phone);     
                res.send({ status: true, data: result});
            }else{
                res.send({ status: true, data: []});
            } 
        });
    } catch (err) {
        // ... error checks
        console.log("errornew", err);
        res.send(err);
    }
});


// insert single user
app.post('/user', async(req, res) => {
    let reqData = req.body;
    try {
        // make sure that any items are correctly URL encoded in the connection string
       
        let result;
        let queryStr = "SELECT * FROM users WHERE mobileNo = '" + reqData.mobile + "'";
        
        await connection.query(queryStr, async function (error, results, fields) {
            if (error){
                // console.log("error", error);
                res.send({ message:"error", err:error });
            }else if(results.length > 0 ){
                result =JSON.parse(JSON.stringify(results[0]));
                res.send({ message: "User Already exist try login "});
            }else{
                await insertUser(otp, reqData);
                res.send({ message: "OTP Send Succesfully",  });
            }            
        });          
    } catch (err) {
        // ... error checks
        console.log("errornew", err);
        res.send(err);
    }
});

// update single user 
app.put('/user/:id', async (req, res) => {
    let userId = req.params.id
    let reqData = req.body;
    try {
        // make sure that any items are correctly URL encoded in the connection string     
        let result;
        let token;
        let queryStr = "SELECT * FROM users WHERE mobileNo = '" + reqData.mobile + "' and otp = '" + reqData.otp + "'";
        
        console.log("string", queryStr);
        await connection.query(queryStr, async function (error, results, fields) {
            if (error){
                // console.log("error", error);
                res.send({ message:"error", err:error });
            }else if(results.length > 0 ){
                result =JSON.parse(JSON.stringify(results[0]));                
                      
                res.send({ message: "user is updated", success: true, data:result});
            }else{
                res.send({ message: "user does't exist",  });
            }            
        });
    } catch (err) {
        // ... error checks
        console.log("errornew", err);
        res.send(err);
    }
});

// delete user from table

app.delete('/user/:id', async (req, res) => {
    let userId = req.params.id
    try {
        // make sure that any items are correctly URL encoded in the connection string
        let result;
        let queryStr = "DELETE FROM users WHERE id = '" + userId + "'";
        await connection.query(queryStr, async function (error, results, fields) {
            if (error){
                // console.log("error", error);
                res.send({ message:"error", err:error });
            }else if(results.length > 0 ){
                result =JSON.parse(JSON.stringify(results[0]));                
                      
                res.send({ message: "user deleted", success: true, data:result});
            }else{
                res.send({ message: "got issue in api",  });
            }            
        });    
    } catch (err) {
        // ... error checks
        console.log("errornew", err);
        res.send(err);
    }
});



module.exports = app;
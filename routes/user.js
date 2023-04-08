
var connection = require('../middlewares/database');
var upload = require('../middlewares/upload');
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



async function insertUser(reqData, next) {

    let insertQuery =
      "INSERT INTO users (`firstName`,`lastName`, `name`, `email`,`mobileNo`,`otp`, `roleId`, `role`, `avatarURL`, `address`,  `city`, `zipCode`, `country`, `state`, `isVerified`, `createdAt`, `updatedAt`,`status`) VALUES ('" + 
      reqData.firstName + "', '" + reqData.lastName + "', '" + reqData.name + "' , '" + reqData.email + "', '" + reqData.mobileNo + "', 1234 , '1' , 'Customer', '" + reqData.avatarUrl + "', '"+ reqData.address +"',  '"+ reqData.city +"', '"+ reqData.zipCode +"', '"+ reqData.country +"', '"+ reqData.state +"', '"+ reqData.isVerified +"', '" + new Date().toJSON().slice(0, 19).replace('T', ' ')  + "', '" + new Date().toJSON().slice(0, 19).replace('T', ' ') + "', '1') ";
    await connection.query(insertQuery, function (error, results, fields) {
      if (error) {
        console.log("error insert", error);
        // res.send({ message:"error", err:error });
      } else {
        // console.log("result ", results);
        next();
      }
  
      updateResponse = JSON.parse(JSON.stringify(results));
      console.log("result error", updateResponse);
    });
  }





// admin get all users 
app.get('/user', async (req, res) => {
    try {
        // make sure that any items are correctly URL encoded in the connection string     
        let result;
        let queryStr = "SELECT * FROM users WHERE role = 'Customer' ";
        
        await connection.query(queryStr, async function (error, results, fields) {
            
            if (error){
                // console.log("error", error);
                res.send({ message:"error", err:error });
            }else if(results.length > 0 ){
                
                // result =JSON.parse(JSON.stringify(results[0]));                
                // await updateOTP(result.id, otp, phone);     
                res.send({ status: true, user: results});
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
                res.send({ status: true, user: result});
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
app.post('/user', upload, async(req, res, next) => {
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
                await insertUser(reqData, next);
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
app.put('/user/:id', upload, async (req, res) => {
    let userId = req.params.id
    let reqData = req.body;
    // let uploadLocation = await upload(reqData, res);
    // console.log("upload value", uploadLocation);
    // reqData.avatarUrl = uploadLocation;
    try {
        // make sure that any items are correctly URL encoded in the connection string     
        if(reqData.status === 'active'){
            reqData.status = 0;
        }else{
            reqData.status = 1;
        }
        let result;
        let queryStr = "UPDATE users SET firstName = '"+ reqData.firstName + "'," +
        "lastName = '"+ reqData.lastName + "', " + 
        "name = '"+ reqData.name + "'," +
        "email = '"+ reqData.email + "', " +
        "mobileNo = '"+ reqData.mobileNo + "', " +
        "avatarUrl = '"+ reqData.avatarUrl + "', " +
        "address = '"+ reqData.address + "', " +
        "city = '"+ reqData.city + "', " +
        "zipCode = '"+ reqData.zipCode + "', " +
        "country = '"+ reqData.country + "', " +
        "state = '"+ reqData.state + "', " +
        "isVerified = "+ reqData.isVerified + ", " +
        "updatedAt = '"+ new Date().toJSON().slice(0, 19).replace('T', ' ') + "', " +
        "status = '"+ reqData.status + "' WHERE id = "+ userId +";"
        
        // console.log("string", queryStr);
        await connection.query(queryStr, async function (error, results, fields) {
            // console.log(error, results);
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
           +91
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
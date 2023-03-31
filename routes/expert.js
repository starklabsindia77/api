
var connection = require('../middlewares/database');
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


serverUrl = config.serverUrl

app.use(cors())
//to not get any deprecation warning or error
//support parsing of application/x-www-form-urlencoded post data
app.use(bodyParser.json({ limit: '50mb' }));
// app.use(bodyParser.urlencoded());
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
//to get json data
// support parsing of application/json type post data
app.use(cookieParser());



async function insertExpert(reqData, next) {

    if(!reqData.password){
        reqData.password = "demo1234";
    }
    const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(reqData.password, salt);
    let insertQuery =
      "INSERT INTO adminusers (`firstName`,`lastName`, `displayName`, `email`,`mobileNo`,`password`, `roleId`, `role`, `photoURL`, `address` ,  `city` , `zipCode` , `country` , `state` , `isVerified`, `createdAt`, `updatedAt`,`status`) VALUES ('" + 
      reqData.firstName + "', '" + reqData.lastName + "', '" + reqData.firstName +' '+ reqData.lastName + "' , '" + reqData.email + "', '" + reqData.mobileNo + "', '" + hashedPassword + "', '3' , 'Expert', 'https://minimal-assets-api-dev.vercel.app/assets/images/avatars/avatar_default.jpg', '" + reqData.address + "', '" + reqData.city + "', '" + reqData.zipcode + "', '" + reqData.country + "', '" + reqData.state + "', '" + reqData.isVerified + "', '" + new Date().toJSON().slice(0, 19).replace('T', ' ')  + "', '" + new Date().toJSON().slice(0, 19).replace('T', ' ') + "', '1') ";
    await connection.query(insertQuery, function (error, results, fields) {
      if (error) {
        console.log("error insert", error);
        // res.send({ message:"error", err:error });
      } else {
        console.log("result ", results);
      }
      next();
    //   updateResponse = JSON.parse(JSON.stringify(results));
    //   console.log("result error", updateResponse);
    });
  }





// admin get all users 
app.get('/expert', async (req, res) => {
    try {
        // make sure that any items are correctly URL encoded in the connection string     
        let result;
        let queryStr = "SELECT * FROM adminusers WHERE role = 'Expert' ";
        
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
app.get('/expertsingle', validateUserToken , async (req, res) => {
    try {
        // make sure that any items are correctly URL encoded in the connection string     
        let result;
        console.log(req.decoded)
        let queryStr = "SELECT * FROM adminusers";
        
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
app.get('/expert/:id', async (req, res) => {
    let userId = req.params.id
    try {
        // make sure that any items are correctly URL encoded in the connection string       
        let result;
        let queryStr = "SELECT * FROM adminusers Where id = '"+ userId +"'";
        
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
app.post('/expert', async(req, res, next) => {
    let reqData = req.body;
    try {
        // make sure that any items are correctly URL encoded in the connection string
       
        let result;
        let queryStr = "SELECT * FROM adminusers WHERE mobileNo = '" + reqData.mobile + "'";
        
        await connection.query(queryStr, async function (error, results, fields) {
            if (error){
                // console.log("error", error);
                res.send({ message:"error", err:error });
            }else if(results.length > 0 ){
                result =JSON.parse(JSON.stringify(results[0]));
                res.send({ message: "Expert Already exist try login "});
            }else{
                await insertExpert(reqData, next);
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
app.put('/expert/:id', async (req, res) => {
    let userId = req.params.id
    let reqData = req.body;
    console.log(reqData);
    try {
        // make sure that any items are correctly URL encoded in the connection string     
        if(reqData.status === 'active'){
            reqData.status = 0;
        }else{
            reqData.status = 1;
        }
        let result;
        let queryStr;
        if(reqData.password){           
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(reqData.password, salt);
            queryStr = "UPDATE adminusers SET firstName = '"+ reqData.firstName + "'," +
        "lastName = '"+ reqData.lastName + "', " + 
        "displayName = '"+reqData.firstName + + reqData.lastName + "'," +
        "email = '"+ reqData.email + "', " +
        "password = '"+ hashedPassword + "', " +
        "mobileNo = '"+ reqData.mobileNo + "', " +
        "roleId = '"+ reqData.roleId + "', " +
        "role = '"+ reqData.role + "', " +
        "photoURL = '"+ reqData.avatarUrl + "', " +
        "address = '"+ reqData.address + "', " +
        "city = '"+ reqData.city + "', " +
        "zipCode = '"+ reqData.zipCode + "', " +
        "country = '"+ reqData.country + "', " +
        "state = '"+ reqData.state + "', " +
        "isVerified = "+ reqData.isVerified + ", " +
        "updatedAt = '"+ new Date().toJSON().slice(0, 19).replace('T', ' ') + "', " +
        "status = '"+ reqData.status + "' WHERE id = "+ userId +";"

        }else{
            queryStr = "UPDATE adminusers SET firstName = '"+ reqData.firstName + "'," +
        "lastName = '"+ reqData.lastName + "', " + 
        "displayName = '"+reqData.firstName + + reqData.lastName + "'," +
        "email = '"+ reqData.email + "', " +
        "mobileNo = '"+ reqData.mobileNo + "', " +
        "roleId = '"+ reqData.roleId + "', " +
        "role = '"+ reqData.role + "', " +
        "photoURL = '"+ reqData.avatarUrl + "', " +
        "address = '"+ reqData.address + "', " +
        "city = '"+ reqData.city + "', " +
        "zipCode = '"+ reqData.zipCode + "', " +
        "country = '"+ reqData.country + "', " +
        "state = '"+ reqData.state + "', " +
        "isVerified = "+ reqData.isVerified + ", " +
        "updatedAt = '"+ new Date().toJSON().slice(0, 19).replace('T', ' ') + "', " +
        "status = '"+ reqData.status + "' WHERE id = "+ userId +";"
        }
        
        
        // console.log("string", queryStr);
        await connection.query(queryStr, async function (error, results, fields) {
            console.log(error, results);
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

app.delete('/expert/:id', async (req, res) => {
    let userId = req.params.id
    try {
        
        // make sure that any items are correctly URL encoded in the connection string
        let result;
        let queryStr = "DELETE FROM adminusers WHERE id = '" + userId + "'";
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
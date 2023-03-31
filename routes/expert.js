
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
// const AWS = require('aws-sdk');
// const fs = require('fs');

// Set the region and credentials for AWS SDK
// AWS.config.update({
//   accessKeyId: config.AWS_ACCESS_KEY_ID,
//   secretAccessKey: config.AWS_ACCESS_KEY_SECRET,
// //   region: config.AWS_REGION
// });

// // Create an instance of the S3 service
// const s3 = new AWS.S3();

// Set the parameters for the S3 bucket and the file you want to upload



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

async function updateExpertInfo(reqData, insertId, next){
    let insertQuery =
      "UPDATE `databaseAstro`.`expertInfo`" +
      "SET `skill` = '" + reqData.skill + "', " + 
      "`bio` = '" + reqData.bio + "'," +
      "`bookingAmount` = '200'," +     
      "`updatedAt` = " + new Date().toJSON().slice(0, 19).replace('T', ' ') + 
      "WHERE `usersId` = '" + insertId + "'";
    await connection.query(insertQuery, function (error, results, fields) {
      if (error) {
        console.log("error insert", error);
        // res.send({ message:"error", err:error });
      } else {
        console.log("result ", results);
        next();
      }
      
    //   updateResponse = JSON.parse(JSON.stringify(results));
    //   console.log("result error", updateResponse);
    });
}
async function insertExpertInfo(reqData, insertId, next){
    let insertQuery =
      "INSERT INTO `databaseAstro`.`expertInfo` ( `skill`, `bio`, `bookingAmount`, `usersId`, `createdAt`, `updatedAt`, `status`)" +
      "VALUES (  '" + reqData.skill + "',  '" + reqData.bio + "', '200',  '" + insertId + "', " +
      new Date().toJSON().slice(0, 19).replace('T', ' ') + "', " + new Date().toJSON().slice(0, 19).replace('T', ' ') + "', 1)";
    await connection.query(insertQuery, function (error, results, fields) {
      if (error) {
        console.log("error insert", error);
        // res.send({ message:"error", err:error });
      } else {
        console.log("result ", results);
        next();
      }
      
    //   updateResponse = JSON.parse(JSON.stringify(results));
    //   console.log("result error", updateResponse);
    });
}
async function insertExpert(reqData, next) {

    if(!reqData.password){
        reqData.password = "demo1234";
    }
    // const params = {
    //     Bucket: config.AWS_BUCKET_NAME,      // bucket that we made earlier
    //     Key: req.file.originalname,               // Name of the image
    //     Body: req.file.buffer,                    // Body which will contain the image in buffer format
    //     ACL: "public-read-write",                 // defining the permissions to get the public link
    //     ContentType: "image/jpeg"                 // Necessary to define the image content-type to view the photo in the browser with the link
    // };
    
    // // Upload the file to the S3 bucket
    // s3.upload(params, (err, data) => {
    //   if (err) {
    //     console.log('Error uploading file:', err);
    //   } else {
    //     console.log('File uploaded successfully:', data.Location);
    //   }
    // });
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
        insertExpertInfo(reqData, results.insertId, next);
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
        //let queryStr = "SELECT * FROM adminusers WHERE role = 'Expert' ";
        let queryStr = "SELECT * FROM adminusers as au left outer Join expertInfo as ei on au.id = ei.usersId WHERE au.role = 'Expert'";
        
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
app.put('/expert/:id', async (req, res, next) => {
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
                updateExpertInfo(reqData, userId, next);          
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
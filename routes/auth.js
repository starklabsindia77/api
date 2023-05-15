var mysql = require("mysql");

const express = require("express");
var connection = require("../middlewares/database");
const app = express();

const cors = require("cors");
const _ = require("lodash");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
var Guid = require("guid");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const tokenExpireTime = "24h";
const config = require("../key");
// const fetch = require('node-fetch');
const { isNull } = require("lodash");
const formidable = require("formidable");
var Promise = require("bluebird");
Promise.longStackTraces();
var cron = require("node-cron");
const { ObjectId, MongoClient } = require("mongodb");

serverUrl = config.serverUrl;
const dbString = config.dbString;
let enableJobs = config.enableJobs;
app.use(cors());
//to not get any deprecation warning or error
//support parsing of application/x-www-form-urlencoded post data
app.use(bodyParser.json({ limit: "50mb" }));
// app.use(bodyParser.urlencoded());
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));
//to get json data
// support parsing of application/json type post data
app.use(cookieParser());

const accountSid = config.TWILIO_ACCOUNT_SID;
const authToken = config.TWILIO_AUTH_TOKEN;
const client = require("twilio")(accountSid, authToken);

async function sendTxtMsg(phone, otp) {
  client.messages
    .create({
      body: `login OTP is ${otp}`,
      from: "+44 7888 864285",
      to: `${phone}`,
    })
    .then((message) => console.log(message.sid));
}

async function updateOTP(id, otp, phone) {
  let updateQuery =
    "UPDATE users SET otp =  '" + otp + "' WHERE users.id = '" + id + "'";
  await connection.query(updateQuery, function (error, results, fields) {
    if (error) {
      console.log("error update", error);
      // res.send({ message:"error", err:error });
    }
    updateResponse = JSON.parse(JSON.stringify(results));
    if (updateResponse.affectedRows == 1) {
      sendTxtMsg(phone, otp);
    }
  });
}

async function insertUser(otp, reqData) {
  let insertQuery =
    "INSERT INTO users ( `email`, `mobileNo`, `otp`, `roleId`, `role`) VALUES ( '" +
    reqData.email +
    "', '" +
    reqData.mobile +
    "', '" +
    otp +
    "', 1, 'Customer');";
  await connection.query(insertQuery, function (error, results, fields) {
    if (error) {
      console.log("error insert", error);
      // res.send({ message:"error", err:error });
    } else {
      // console.log("result ", results);
      updateResponse = JSON.parse(JSON.stringify(results));
      // console.log("result error", updateResponse);
      if (updateResponse.affectedRows == 1) {
        let phone = reqData.mobile;
        sendTxtMsg(phone, otp);
      }
    }

    
  });
}

app.post("/login", async (req, res) => {
  let reqData = req.body;
  try {
    // make sure that any items are correctly URL encoded in the connection string

    let otp = Math.floor(1000 + Math.random() * 9000);
    let phone = reqData.mobile;
    console.log("otp", otp);

    let result;
    let queryStr =
      "SELECT * FROM users WHERE mobileNo = '" + reqData.mobile + "'";

    await connection.query(queryStr, async function (error, results, fields) {
      if (error) {
        // console.log("error", error);
        res.send({ message: "error", err: error });
      } else if (results.length > 0) {
        result = JSON.parse(JSON.stringify(results[0]));
        // await updateOTP(result.id, otp, phone);
        res.send({ message: "OTP Send Successfully" });
      } else {
        res.send({ message: "user does't exist" });
      }
    });
  } catch (err) {
    // ... error checks
    console.log("errornew", err);
    res.send(err);
  }
});

app.put('/user/profile', async (req, res) => {
  let reqData = req.body;
  console.log("data", reqData);

  let queryStr = "UPDATE users SET firstName = '"+ reqData.firstName + "'," +
      "lastName = '"+ reqData.lastName + "', " + 
      "name = '"+ reqData.name + "'," +
      "dob = '"+ reqData.dob + "', " +
      "gender = '"+ reqData.gender + "', " +
      "email = '"+ reqData.email + "', " +
      "address = '"+ reqData.address + "', " +
      "city = '"+ reqData.city + "', " +
      "zipCode = '"+ reqData.zipCode + "', " +
      "country = '"+ reqData.country + "', " +
      "updatedAt = '"+ new Date().toJSON().slice(0, 19).replace('T', ' ') + "', " +
      "status = '"+ reqData.status + "' WHERE id = "+ reqData.id +";"

      try {
          await connection.query(queryStr, async function (error, results, fields) {
              console.log(error, results);
              if (error){
                  // console.log("error", error);
                  res.send({ message:"error", err:error });
              }else{
                  res.send({ message: "user is updated", success: true, data:reqData});
              }            
          });

      }catch (err) {
          // ... error checks
          console.log("errornew", err);
          res.send(err);
      }
      
})

app.post("/register", async (req, res) => {
  let reqData = req.body;
  try {
    // make sure that any items are correctly URL encoded in the connection string
    let otp = Math.floor(100000 + Math.random() * 900000);

    let result;
    let queryStr =
      "SELECT * FROM users WHERE mobileNo = '" + reqData.mobile + "'";

    await connection.query(queryStr, async function (error, results, fields) {
      if (error) {
        // console.log("error", error);
        res.send({ message: "error", err: error });
      } else if (results.length > 0) {
        result = JSON.parse(JSON.stringify(results[0]));
        res.send({ message: "User Already exist try login " });
      } else {
        await insertUser(otp, reqData);

        res.send({ message: "OTP Send Succesfully" });
      }
    });
  } catch (err) {
    // ... error checks
    console.log("errornew", err);
    res.send(err);
  }
});

app.post("/otpverify", async (req, res) => {
  let reqData = req.body;
  console.log("otpverify", reqData);
  try {
    // make sure that any items are correctly URL encoded in the connection string

    let result;
    let userinfo;
    let token;
    let queryStr =
      "SELECT * FROM users WHERE mobileNo = '" +
      reqData.mobile +
      "' and otp = '" +
      reqData.otp +
      "'";
    console.log("qury", queryStr);
    
    await connection.query(queryStr, async function (error, results, fields) {
      console.log("res", results);
      if (error) {
        res.send({ message: "error", err: error });
      } else if (results.length > 0) {
        userinfo = JSON.parse(JSON.stringify(results[0]));
        token = jwt.sign({ user: userinfo.mobileNo }, config.SECRET, {
          expiresIn: tokenExpireTime,
        });
        queryStr = `SELECT * FROM appointment as App left OUTER JOIN adminusers as us on us.id = App.expert_id left OUTER JOIN expertinfo as ei on ei.usersId = App.expert_Id Where App.user_id = ${userinfo.id} and us.role = 'Expert' ORDER BY App.date DESC `;
        
            
        await connection.query(queryStr, async function (error, results, fields) {
            //console.log(error, results);
            if (error){
                // console.log("error", error);
                res.send({ message:"error", err:error });
            }else {                
                result =JSON.parse(JSON.stringify(results)); 
                const currentDate = new Date();
                currentDate.setHours(0, 0, 0, 0);
                // Filter the dateArray based on the current date
                
                

                res.send({
                  message: "Otp Verifed",
                  success: true,
                  token: token,
                  user: userinfo,
                });
            }
        });

        
      } else {
        console.log("Otp Verifed", results);
        res.send({ message: "OTP is Wrong" });
      }
    });
  } catch (err) {
    // ... error checks
    console.log("errornew", err);
    res.send(err);
  }
});
module.exports = app;

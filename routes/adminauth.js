
const express = require("express");
var connection = require("../middlewares/database");
const app = express();
const cors = require("cors");
const _ = require("lodash");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const bcrypt = require('bcryptjs');
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const tokenExpireTime = "24h";
const config = require("../key");

var Promise = require("bluebird");
Promise.longStackTraces();

serverUrl = config.serverUrl;

app.use(cors());
app.set('view engine', 'ejs');
//to not get any deprecation warning or error
//support parsing of application/x-www-form-urlencoded post data
app.use(bodyParser.json({ limit: "50mb" }));
// app.use(bodyParser.urlencoded());
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));
//to get json data
// support parsing of application/json type post data
app.use(cookieParser());

async function insertUser(reqData) {

    const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(reqData.password, salt);
    let insertQuery =
      "INSERT INTO adminusers (`firstName`,`lastName`, `displayName`, `email`,`mobileNo`,`password`, `roleId`, `role`, `photoURL`, `address` ,  `city` , `zipCode` , `country` , `state` , `isVerified`, `createdAt`, `updatedAt`,`status`) VALUES ('" + 
      reqData.firstName + "', '" + reqData.lastName + "', '" + reqData.firstName +' '+ reqData.lastName + "' , '" + reqData.email + "', '" + reqData.mobileNo + "', '" + hashedPassword + "', '1' , 'Admin', 'https://minimal-assets-api-dev.vercel.app/assets/images/avatars/avatar_default.jpg', '" + reqData.address + "', '" + reqData.city + "', '" + reqData.zipcode + "', '" + reqData.country + "', '" + reqData.state + "', '" + reqData.isVerified + "', '" + new Date().toJSON().slice(0, 19).replace('T', ' ')  + "', '" + new Date().toJSON().slice(0, 19).replace('T', ' ') + "', '1') ";
    await connection.query(insertQuery, function (error, results, fields) {
      if (error) {
        console.log("error insert", error);
        // res.send({ message:"error", err:error });
      } else {
        console.log("result ", results);
      }
  
      updateResponse = JSON.parse(JSON.stringify(results));
      console.log("result error", updateResponse);
    });
  }

app.post("/login", async (req, res) => {
  let reqData = req.body;
  try {
    let data;
    let queryStr =
      "SELECT au.*, ei.skill, ei.bio, ei.bookingAmount FROM adminusers as au left outer join expertinfo as ei on au.id = ei.usersId WHERE au.email = '" + reqData.email + "'";

    await connection.query(queryStr, async function (error, results, fields) {
      if (error) {
        // console.log("error", error);
        res.send({ message: "error", err: error });
      } else if (results.length > 0) {
        data = JSON.parse(JSON.stringify(results[0]));
        bcrypt.compare(
          req.body.password,
          data.password,
          function (err, result) {
            if (result) {
              token = jwt.sign({ user: data }, config.SECRET, {
                expiresIn: tokenExpireTime,
              });
              return res
                .status(200)
                .send({
                  message: "Login Successful ",
                  accessToken: token,
                  user: data,
                });
            } else {
              return res.status(400).send();
            }
          }
        );
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

app.post("/register", async (req, res) => {
    let reqData = req.body;
    try {
      // make sure that any items are correctly URL encoded in the connection string
      
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
          await insertUser(reqData);
  
          res.send({ message: "user registered successfull" });
        }
      });
    } catch (err) {
      // ... error checks
      console.log("errornew", err);
      res.send(err);
    }
  });


  module.exports = app;
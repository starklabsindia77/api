

const express = require("express");

const app = express();

const cors = require("cors");
const _ = require("lodash");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");

const nodemailer = require("nodemailer");

const config = require("../key");

var Promise = require("bluebird");
Promise.longStackTraces();


serverUrl = config.serverUrl;

app.use(cors());
//to not get any deprecation warning or error
//support parsing of application/x-www-form-urlencoded post data
app.use(bodyParser.json({ limit: "50mb" }));
// app.use(bodyParser.urlencoded());
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));
//to get json data
// support parsing of application/json type post data
app.use(cookieParser());



app.post('/send-email', async (req, res) => {
    console.log('body', req.body)
    let { name, email, subject, message } = req.body;
  
    let mailOptions = {
      from: "astroscore1@gmail.com", // sender address
      to: "varunps191@gmail.com", // list of receivers
      subject: subject, // Subject line
      text: `Message from: ${name}, email: ${email}\n${message}`, // plain text body
    };
  
    let transporter = nodemailer.createTransport({
      service: 'gmail', // use 'gmail' for Google's Gmail service
      auth: {
        user: 'astroscore1@gmail.com', // replace with your email address
        pass: 'Baba@1234' // replace with your email password
      }
    });
  
    try {
      let info = await transporter.sendMail(mailOptions);
      console.log("Message sent: %s", info.messageId);
      res.json({ status: 'Email sent' });
    } catch (error) {
      console.log("Error: ", error);
      res.json({ status: 'Failed to send the email.' });
    }
  });


module.exports = app;


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


app.post('/appointment', async (req, res) => {
    try {
        // make sure that any items are correctly URL encoded in the connection string     
        let result;
        let queryStr;
        let reqData = req.body;
        
        let date = new Date();
        


        queryStr = `INSERT INTO appointment ( expert_Id, user_id, start_time, end_time, date, payment_status, transdetails, booking_status, overallDataJsonString, created_at, updated_at ) 
            VALUES (${reqData.expertId},${reqData.user.id},'${reqData.startTime}','${reqData.endTime}','${reqData.date}','Done','', 'active', '${JSON.stringify(reqData)}', '${new Date().toJSON().slice(0, 19).replace('T', ' ')}', '${new Date().toJSON().slice(0, 19).replace('T', ' ')}')`;
        
            
        await connection.query(queryStr, async function (error, results, fields) {
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


app.get('/appointment', verifyToken, async (req, res) => {
    try {
        // make sure that any items are correctly URL encoded in the connection string     
        let result;
        let queryStr;
        let reqData = req.body;
        
        let date = new Date();
        let expert = req.decoded;


        queryStr = `SELECT * FROM appointment as App left OUTER JOIN users as us on us.id = App.user_id Where App.expert_Id = ${expert.user.id}`;
        
            
        await connection.query(queryStr, async function (error, results, fields) {
            //console.log(error, results);
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

module.exports = app;

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
        
        let date = new Date();

        queryStr = `INSERT INTO appointment ( 
            expert_Id, user_id, start_time, end_time, date, payment_status, booking_status, created_at, updated_at ) 
            VALUES ('[value-2]','[value-3]','[value-4]','[value-5]','[value-6]','[value-7]','[value-8]','[value-9]','[value-10]')`
        
        
        await connection.query(queryStr, async function (error, results, fields) {
            if (error){
                // console.log("error", error);
                res.send({ message:"error", err:error });
            }else if(results.length > 0 ){                
                result =JSON.parse(JSON.stringify(results[0]));            
                let slot = JSON.parse(result.time_slot);     
                res.send({ status: true, data: slot});
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

module.exports = app;
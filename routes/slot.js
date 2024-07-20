
var connection = require('../middlewares/database');
var upload = require('../middlewares/azureUpload');
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


app.get('/slots/:id/:date', async (req, res) => {
    try {
        // make sure that any items are correctly URL encoded in the connection string     
        let result;
        let queryStr;
        
        let date = new Date(req.params.date);
       

        queryStr = `SELECT * FROM expert_slot WHERE expert_Id = ${req.params.id} AND date = ${JSON.stringify(date)};`
        
        //queryStr = `SELECT * FROM expert_slot as es left outer join appointment as App on es.expert_Id = App.expert_Id and es.date = App.date  WHERE es.expert_Id = ${req.params.id} AND es.date = ${JSON.stringify(date)};`

        await connection.query(queryStr, async function (error, results, fields) {
            
            if (error){
                // console.log("error", error);
                res.send({ message:"error", err:error });
            }else if(results.length > 0 ){                
                result =JSON.parse(JSON.stringify(results[0]));                
                let slot = JSON.parse(result.time_slot); 
                let queryStr2 = `SELECT * FROM appointment WHERE expert_Id = ${req.params.id} AND date = ${JSON.stringify(date)};` 
                await connection.query(queryStr2, async function (error, results, fields) {
                    //console.log(error, results);
                    if (error){
                        // console.log("error", error);
                        res.send({ message:"error", err:error });
                    }else {                
                        let app =JSON.parse(JSON.stringify(results));
                        for(let i = 0; i < app.length; i++) {     
                            for(let j = 0; j < slot.length; j++) {
                                if(slot[j].startTime == app[i].start_time){
                                    slot[j].status = 'booked';
                                }
                            }
                          }
                        // console.log("result", result2);             
                        // res.send({ status: true, data: result});
                        res.send({ status: true, data: slot});
                    }
                });        
                    
                
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
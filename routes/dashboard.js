
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

app.get('/dashboard', verify, async (req, res) => {
    try {
        // make sure that any items are correctly URL encoded in the connection string     
        let result;
        let queryStr;
        let expert = req.decoded.user;
        let totalUser;
        let totalExpert;
        let totalincome;
        let TotalUpcomingExpertAppoinments;
        let TotalPastExpertAppoinments;
        let TotalAppoinments;
        let lastFiveRecords;
        queryStr = `SELECT count(*) FROM users`; 

        let queryExpert = `SELECT count(*) FROM adminusers WHERE role = 'Expert'`;
        
        await connection.query(queryStr, async function (error, results, fields) {
            
            if (error){
                res.send({ message:"error", err:error });
            }else {                
                result =JSON.parse(JSON.stringify(results[0]));                
                totalUser = result['count(*)']
                            
                // res.send({ status: true, data: result});
            }
        });

        await connection.query(queryExpert, async function (error, results, fields) {
            
            if (error){
                res.send({ message:"error", err:error });
            }else {                
                result =JSON.parse(JSON.stringify(results[0]));
                totalExpert = result['count(*)']
                            
                // res.send({ status: true, data: result});
            }
        });

        let quertApp;
        let lastFiveQuery;

        if(expert.role !== 'Admin'){
            quertApp = `SELECT * FROM appointment Where expert_Id = ${expert.id}`;
            lastFiveQuery = `SELECT * FROM (
                SELECT * FROM databaseastro.appointment
                ORDER BY date DESC
                LIMIT 5
              )  as App left OUTER JOIN users as us on us.id = App.user_id Where App.expert_Id = ${expert.id}
              ORDER BY date DESC;`
        }else{
            quertApp = `SELECT * FROM appointment`;
            lastFiveQuery = `SELECT * FROM (
                SELECT * FROM databaseastro.appointment
                ORDER BY date DESC
                LIMIT 5
              )  as App left OUTER JOIN users as us on us.id = App.user_id 
              ORDER BY date DESC;`
        }

        await connection.query(lastFiveQuery, async function (error, results, fields) {
            
            if (error){
                res.send({ message:"error", err:error });
            }else {                
                result =JSON.parse(JSON.stringify(results));
                lastFiveRecords = result;
            }
        });
        await connection.query(quertApp, async function (error, results, fields) {
            // console.log(results);
            if (error){
                res.send({ message:"error", err:error });
            }else {                
                result =JSON.parse(JSON.stringify(results));
                const currentDate = new Date('2023-04-26T00:00:00.000Z');
                // const currentDate = new Date();
                currentDate.setHours(0, 0, 0, 0);

                // Filter the dateArray based on the current date
                const upcomingApp = result.filter((dateString) => {
                    const date = new Date(dateString.date);
                    date.setHours(0, 0, 0, 0);

                    // Check if the date is greater than or equal to the current date
                    return date >= currentDate;
                });

                TotalUpcomingExpertAppoinments = upcomingApp.length;

                const pastApp = result.filter((dateString) => {
                   const date = new Date(dateString.date);
                   date.setHours(0, 0, 0, 0);

                   // Check if the date is greater than or equal to the current date
                   return date < currentDate;
                });

                TotalPastExpertAppoinments = pastApp.length

                TotalAppoinments = result.length
                totalincome = 350 * TotalAppoinments;


                // console.log(lastFiveRecords);

                // console.log("1", totalUser);
                // console.log("2", totalExpert);
                // console.log("3", TotalUpcomingExpertAppoinments);
                // console.log("4", TotalPastExpertAppoinments);
                // console.log("5", TotalAppoinments);
                // console.log("6", totalincome);
                // console.log("7", {
                //     totalUser: totalUser, 
                //     totalExpert: totalExpert, 
                //     TotalUpcomingExpertAppoinments: TotalUpcomingExpertAppoinments,
                //     TotalPastExpertAppoinments: TotalPastExpertAppoinments,
                //     TotalAppoinments: TotalAppoinments,
                //     totalincome: totalincome,
                //     lastFiveRecords: lastFiveRecords,
                // })
                res.send({ status: true, 
                    data: {
                        totalUser: totalUser, 
                        totalExpert: totalExpert, 
                        TotalUpcomingExpertAppoinments: TotalUpcomingExpertAppoinments,
                        TotalPastExpertAppoinments: TotalPastExpertAppoinments,
                        TotalAppoinments: TotalAppoinments,
                        totalincome: totalincome,
                        lastFiveRecords: lastFiveRecords,
                    }
                });
            }
        });

        




       
    } catch (err) {
        // ... error checks
        console.log("errornew", err);
        res.send(err);
    }
});


module.exports = app;
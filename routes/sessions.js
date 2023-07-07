
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


function getDayFromDate(dateString) {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const date = new Date(dateString);
    const day = date.getDay();
    return days[day];
}

function getNextDate(currentDate) {
    const nextDate = new Date(currentDate);
    nextDate.setDate(nextDate.getDate() + 1);
    return nextDate;
}

async function getTimeSlots(startTime, endTime) {
    const start = new Date(`${startTime}`);
    const end = new Date(`${endTime}`);

    start.setSeconds(0, 0);
    end.setSeconds(0, 0);
  
    const timeSlots = [];
  
    while (start < end) {
        const currentSlot = start.toLocaleTimeString('en-US', {
            hour12: true,
            hour: '2-digit',
            minute: '2-digit',
            
        });
  
        start.setMinutes(start.getMinutes() + 15);
        const endSlot = start.toLocaleTimeString('en-US', {
            hour12: true,
            hour: '2-digit',
            minute: '2-digit',
            
        });
      
        let myslot = {
            startTime: currentSlot,
            endTime: endSlot,
            status: 'active'
        }
        timeSlots.push(myslot);
    }
    return timeSlots;
}

async function addExpertSlots(reqData, currentDate, sessionId, expert_Id) {
    let timeSlot;
    let slot = reqData.slot;

    for (let i = 0; i < slot.length; i++) {
        let result = await getTimeSlots(slot[i].startTime, slot[i].endTime);
        if (i === 0) {
            timeSlot = result;
        } else {
            timeSlot = timeSlot.concat(result);
        }
    }

    let time_slot = JSON.stringify(timeSlot);

    const insertQuery = `INSERT INTO expert_slot (expert_Id, date, time_slot, time_interval, sessions_id)
    VALUES (${expert_Id}, ${JSON.stringify(currentDate)}, '${time_slot}', '${reqData.TimeInterval}', ${sessionId})`;

    try {
        const [results] = await connection.query(insertQuery);
        return true;
    } catch (error) {
        // res.send({ message: "error", err: error });
    }
}

async function iterateDates(startDate, endDate, reqData, insertId, expert_Id) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    let currentDate = start;
    let count = 1;
    while (currentDate <= end) {
        // console.log("loop count", count);
        const day = getDayFromDate(currentDate);
        if (reqData[day]) {
            // console.log("loop count 2", count);
            await addExpertSlots(reqData, currentDate, insertId, expert_Id);
        }
        count = count + 1;
        currentDate = getNextDate(currentDate);
    }
}


app.get('/sessions', verify,  async (req, res) => {
    try {
        // make sure that any items are correctly URL encoded in the connection string     
        let result;
        let queryStr;
        if(req.decoded.user.role !== 'Admin'){
            queryStr = `SELECT s.id as sid, s.* FROM sessions as s WHERE s.expert_Id = ${req.decoded.user.id}`;
        }else{
            queryStr = "SELECT s.id as sid, s.*, au.* FROM sessions as s left outer join adminusers as au on au.id = s.expert_Id";
        }
        
        // console.log("query", queryStr, req.decoded);
        await connection.query(queryStr, async function (error, results, fields) {
            if (error){
                // console.log("error", error);
                res.send({ message:"error", err:error });
            }else if(results.length > 0 ){                
                result =JSON.parse(JSON.stringify(results[0]));               
                res.send({ status: true, data: results});
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

app.post('/sessions', verify, async (req, res) => {
    let reqData = req.body;
    try {
        // make sure that any items are correctly URL encoded in the connection string
        
        
        let result;
        let queryStr = `INSERT INTO sessions ( expert_Id, start_date, end_date, slot, Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday) 
        VALUES ( ${req.decoded.user.id},${JSON.stringify(reqData.startDate)},${JSON.stringify(reqData.endDate)},'${JSON.stringify(reqData.slot)}', ${reqData.monday},${reqData.tuesday},${reqData.wednesday},
        ${reqData.thursday},${reqData.friday},${reqData.saturday},${reqData.sunday})`
        
        
        await connection.query(queryStr, async function (error, results, fields) {
            if (error){
                // console.log("error", error);
                res.send({ message:"error", err:error });
            }else {
                result =JSON.parse(JSON.stringify(results));
                let insertId = result.insertId;
                reqData.startDate = reqData.startDate.split("T")[0];
                reqData.endDate = reqData.endDate.split("T")[0];
                await iterateDates(reqData.startDate, reqData.endDate, reqData, insertId, req.decoded.user.id);
                res.send({ message: "Sessions Inserted succesfully "});
            }            
        });          
    } catch (err) {
        // ... error checks
        console.log("errornew", err);
        res.send(err);
    }
})

app.delete('/sessions/:id', async (req, res) => {
    let userId = req.params.id
    try {
        
        // make sure that any items are correctly  URL encoded in the connection string
        
        
        let result;
        let queryStr = "DELETE FROM sessions WHERE id = '" + userId + "'";
        await connection.query(queryStr);
        let query2 = `select * from expert_slot where sessions_id = ${userId}`;
        await connection.query(query2, async function (error, results, fields) {
            if (error){
                res.send({ message:"error", err:error });
            }else {
                let result2 =JSON.parse(JSON.stringify(results));               
                for(let i = 0; i < result2.length; i++){
                    let query3 = `DELETE FROM expert_slot WHERE id = ${result2[i].id}`;
                    await connection.query(query3);
                    // await connection.query(query3, async function (error, results, fields) {
                    //     if (error){
                    //         res.send({ message:"error", err:error });
                    //     }else {
                    //         return true;
                    //     }
                    // });
                }
                return true;


            }           
        });
        res.send({ message: "user deleted", success: true, data:result});

        // await connection.query(queryStr, async function (error, results, fields) {
        //     if (error){
        //         res.send({ message:"error", err:error });
        //     }else {
        //         result =JSON.parse(JSON.stringify(results));                
        //         let query2 = `select * from expert_slot where sessions_id = ${userId}`;
        //         await connection.query(query2, async function (error, results, fields) {
        //             if (error){
        //                 res.send({ message:"error", err:error });
        //             }else {
        //                 let result2 =JSON.parse(JSON.stringify(results));               
        //                 for(let i = 0; i < result2.length; i++){
        //                     let query3 = `DELETE FROM expert_slot WHERE id = = ${result2[i].id}`;
        //                     const [results] = await connection.query(query3);
        //                     // await connection.query(query3, async function (error, results, fields) {
        //                     //     if (error){
        //                     //         res.send({ message:"error", err:error });
        //                     //     }else {
        //                     //         return true;
        //                     //     }
        //                     // });
        //                 }
        //                 return true;


        //             }           
        //         }); 
                
        //         res.send({ message: "user deleted", success: true, data:result});
                
        //     }           
        // });    
    } catch (err) {
        // ... error checks
        console.log("errornew", err);
        res.send(err);
    }
});

module.exports = app;
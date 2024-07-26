// var mysql      = require('mysql');
// const fs = require('fs')
// const config = require("../key");



// var connection = mysql.createConnection({
//     host     : config.host,
//     user     : config.user,
//     password : config.password,
//     port: config.port,
//     connectionLimit: 15,
//     queueLimit: 30,
//     acquireTimeout: 1000000,
//     database : config.database,
    
   
//   });




// connection.connect((error) => {
//     if (error) {
//         console.error('Error connecting to MySQL server: ', error);
//         return;
//     }
//     console.log('Connected to MySQL server.');
// });



// // console.log('Connected to MsSQL server', connection)


// module.exports = connection;


var mysql = require('mysql');
const config = require("../key");

let connection;

function handleDisconnect() {
  connection = mysql.createConnection({
    host: config.host,
    user: config.user,
    password: config.password,
    port: config.port,
    connectionLimit: 15,
    queueLimit: 30,
    acquireTimeout: 1000000,
    database: config.database,
  });

  connection.connect((error) => {
    if (error) {
      console.error('Error connecting to MySQL server: ', error);
      setTimeout(handleDisconnect, 2000); // Retry after 2 seconds
    } else {
      console.log('Connected to MySQL server.');
    }
  });

  connection.on('error', (err) => {
    console.error('MySQL error:', err);
    if (err.code === 'PROTOCOL_CONNECTION_LOST' || err.code === 'ECONNRESET') {
      console.log('Attempting to reconnect...');
      handleDisconnect();
    } else {
      throw err;
    }
  });
}

handleDisconnect();

module.exports = connection;
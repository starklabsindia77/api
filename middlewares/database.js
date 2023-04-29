var mysql      = require('mysql');
const fs = require('fs')
const config = require("../key");



var connection = mysql.createConnection({
    host     : config.host,
    user     : config.user,
    password : config.password,
    port: config.port,
    connectionLimit: 15,
    queueLimit: 30,
    acquireTimeout: 1000000,
    database : config.database,
    // ssl: {
    //     // Uncomment this section and provide the correct paths to the necessary certificates
    //     ca: fs.readFileSync('path/to/ca-cert.pem'),
    //     cert: fs.readFileSync('path/to/client-cert.pem'),
    //     key: fs.readFileSync('path/to/client-key.pem'),
    // },
  });




connection.connect((error) => {
    if (error) {
        console.error('Error connecting to MySQL server: ', error);
        return;
    }
    console.log('Connected to MySQL server.');
});



// console.log('Connected to MsSQL server', connection)


module.exports = connection;
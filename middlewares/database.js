var mysql      = require('mysql');
const config = require("../key");


var connection = mysql.createConnection({
    host     : config.host,
    user     : config.user,
    password : config.password,
    port: config.port,
    database : config.database
  });


connection.connect((error) => {
    if (error) {
        console.error('Error connecting to MySQL server: ', error);
        return;
    }
    console.log('Connected to MySQL server.');
});


module.exports = connection;
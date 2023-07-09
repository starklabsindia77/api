// var http = require("http");
const https = require('https');
const app = require('./index');
const fs = require('fs');

// var httpServer = http.createServer(app);
let PORT = process.env.PORT || 3001;

const server = https.createServer({
    key: fs.readFileSync('/etc/ssl/private.key'), // Your private key
    cert: fs.readFileSync('/etc/ssl/certificate.cert') // Your SSL certificate
  }, app).listen(PORT);
// const server = httpServer.listen(PORT, () => {
//     console.log(`Server is up and running on ${PORT} ...`);
// })
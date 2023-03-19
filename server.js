var http = require("http");
const app = require('./index');

var httpServer = http.createServer(app);
let PORT = process.env.PORT || 3001;
const server = httpServer.listen(PORT, () => {
    console.log(`Server is up and running on ${PORT} ...`);
})
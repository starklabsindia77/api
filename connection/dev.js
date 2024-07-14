const dotenv = require('dotenv');
dotenv.config();
module.exports = {
    AWS_BUCKET_NAME: "productallimages",
    AWS_ACCESS_KEY_ID: "AKIA4KOVHMFEDSZDSZ7R",
    AWS_ACCESS_KEY_SECRET: "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",
    AZURE_STORAGE_CONNECTION_STRING:"DefaultEndpointsProtocol=https;AccountName=astrodata;AccountKey=xuELymbLsGp3yfYuvYmWItl+qlbT3L2nu08e1PIfXq8v+CQTeCFIdS+Di8vPPc7fHN0FAO8x9WQ3+AStZKw7fQ==;EndpointSuffix=core.windows.net",
    AZURE_CONTAINER_NAME:"astrocontainer",
    SECRET: "Noki@lumi@52",
    TWILIO_ACCOUNT_SID:"AC780130b3ca1f4079ab7dfff843e402ca",
    TWILIO_AUTH_TOKEN:"6924014f902c3fafb6df8f40f4e859c2",
    TWILIO_PHONE_NUMBER:"",
    TWIML_SERVER_URL:"https://www.example.org/twiml/",
    // host     : 'astrodbnew.cfhotb0aool1.ap-south-1.rds.amazonaws.com',
    // user     : 'admin',
    // password : 'Baba1234',
    // port: '3306',
    // database : 'databaseAstro'
    host     : 'varunmainserver.mysql.database.azure.com',
    user     : 'adminvarun',
    password : 'Baba@1234',
    port: '3306',
    database : 'databaseAstro',

}
const AWS = require("aws-sdk");
// const multer = require("multer");
// const multerS3 = require("multer-s3");
const fs = require("fs");
const config = require("../key");

AWS.config.update({
    accessKeyId: config.AWS_ACCESS_KEY_ID,
    secretAccessKey: config.AWS_ACCESS_KEY_SECRET,
    region: config.AWS_REGION
});

module.exports = function (req, res, next) {

    try {
        const s3 = new AWS.S3();
        let reqData = req.body;
        if (typeof reqData.cover === "string") {
            console.log("type of 2", typeof reqData.cover);
            next();
        } else {


            let pathkey = reqData.cover.path;
            const imageBuffer = Buffer.from(reqData.image, 'base64');
            const params = {
                Bucket: config.AWS_BUCKET_NAME,      // bucket that we made earlier
                Key: pathkey,               // Name of the image
                Body: imageBuffer,                    // Body which will contain the image in buffer format
                ACL: "public-read-write",                 // defining the permissions to get the public link
                ContentType: "image/jpeg"                 // Necessary to define the image content-type to view the photo in the browser with the link
            };

            // Upload the file to the S3 bucket
            s3.upload(params, (err, data) => {
                if (err) {
                    console.log('Error uploading file:', err);
                } else {
                    req.body.cover = data.Location;

                    next();
                }
            });
        }
    } catch (err) {
        console.log('Error uploading file:', err);
    }
};

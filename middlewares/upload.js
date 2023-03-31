const AWS  = require("aws-sdk");
// const multer = require("multer");
// const multerS3 = require("multer-s3");
const fs = require("fs");
const config = require("../key");

AWS.config.update({
    accessKeyId: config.AWS_ACCESS_KEY_ID,
    secretAccessKey: config.AWS_ACCESS_KEY_SECRET,
  //   region: config.AWS_REGION
  });



// const upload = multer({
//   storage: multerS3({
//     s3: s3,
//     bucket: config.AWS_BUCKET_NAME,
//     acl: "public-read",
//     metadata: (req, file, cb) => {
//       cb(null, { fieldName: file.fieldname });
//     },
//     key: (req, file, cb) => {
//       cb(null, Date.now().toString());
//     }
//   })
// });


module.exports = function(req, res, next) {
  //  console.log('req', req);
    try{
        const s3 = new AWS.S3();
        const fileContent = fs.readFileSync(req.body.avatarUrl.preview);
        const params = {
            Bucket: config.AWS_BUCKET_NAME,      // bucket that we made earlier
            Key: req.body.avatarUrl.path,               // Name of the image
            Body: fileContent,                    // Body which will contain the image in buffer format
            ACL: "public-read-write",                 // defining the permissions to get the public link
            ContentType: "image/jpeg"                 // Necessary to define the image content-type to view the photo in the browser with the link
        };
        
        // Upload the file to the S3 bucket
        s3.upload(params, (err, data) => {
          if (err) {
            console.log('Error uploading file:', err);
          } else {
            console.log('File uploaded successfully:', data.Location);
          }
        });
    }catch(err){
        console.log('Error uploading file:', err);
    }
  };


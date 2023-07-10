const AWS = require("aws-sdk");
const fs = require("fs");
const config = require("../key");

AWS.config.update({
  accessKeyId: config.AWS_ACCESS_KEY_ID,
  secretAccessKey: config.AWS_ACCESS_KEY_SECRET,
  region: config.AWS_REGION
});

module.exports = function(req, res, next) {
  try {
    const s3 = new AWS.S3();
    let reqData = req.body;
    
    if (typeof reqData.cover === "string") {
      console.log("type of 2", typeof reqData.cover);
      // next();
    } else {
      let pathkey = reqData.cover.path;
      const imageBuffer = Buffer.from(reqData.coverImage, 'base64');
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
              // next();
          }
      });
    }

    if (reqData.images.length > 0 ) {
      if(typeof reqData.images[0] === "string"){
        req.body.images = JSON.stringify(reqData.images);
        next();
      }else{
        // Iterate over each image
        let uploadedLocations = [];
        reqData.productImages.forEach((image, index) => {
          let pathkey = reqData.images[index].path; 
          const imageBuffer = Buffer.from(image.base64String, 'base64');
          const params = {
              Bucket: config.AWS_BUCKET_NAME,
              Key: pathkey,
              Body: imageBuffer,
              ACL: "public-read-write",
              ContentType: "image/jpeg"
          };
          
          // Upload the file to the S3 bucket
          s3.upload(params, (err, data) => {
            if (err) {
              console.log('Error uploading file:', err);
            } else {
              console.log('File uploaded successfully:', data.Location);
              uploadedLocations.push(data.Location);
              // Check if all images have been uploaded
              if (uploadedLocations.length === reqData.productImages.length) {
                // Add the URLs to the request object
                req.body.images = JSON.stringify(uploadedLocations);
                next();
              }
            }
          });
        });
      }     
    } 

    
    
  } catch(err) {
    console.log('Error uploading file:', err);
  }
};

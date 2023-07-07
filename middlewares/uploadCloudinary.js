const cloudinary = require('cloudinary').v2;

cloudinary.config({ 
    cloud_name: 'dsty70mlq', 
    api_key: '538377882936111', 
    api_secret: 'f5bXalT8yqYEDO0rbusLQdEZhrk' 
  });





module.exports = function(req, res, next) {
  
    try{
        
        let reqData = req.body;
        if(typeof reqData.icon === "string" ){
          console.log("type of 2", typeof reqData.icon);
            next();
        }else{
          
        
          
            console.log("icon", reqData.icon);
            cloudinary.uploader.upload('path_to_your_image', function(error, result) {
                if (error) {
                    console.error('Upload error: ', error);
                } else {
                    console.log('Upload result: ', result);
                }
            });
          // Upload the file to the S3 bucket
         
        }
    }catch(err){
        console.log('Error uploading file:', err);
    }
  };


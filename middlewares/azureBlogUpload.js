const { BlobServiceClient } = require("@azure/storage-blob");
const fs = require("fs");
const config = require("../key");

const AZURE_STORAGE_CONNECTION_STRING = config.AZURE_STORAGE_CONNECTION_STRING;

const blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING);

module.exports = async function (req, res, next) {
    try {
        let reqData = req.body;
        if (typeof reqData.cover === "string") {
            console.log("type of 2", typeof reqData.cover);
            next();
        } else {
            let pathkey = reqData.cover.path;
            const imageBuffer = Buffer.from(reqData.image, 'base64');
            const containerName = config.AZURE_CONTAINER_NAME;
            const blobName = pathkey;

            const containerClient = blobServiceClient.getContainerClient(containerName);
            const blockBlobClient = containerClient.getBlockBlobClient(blobName);

            const uploadOptions = {
                blobHTTPHeaders: {
                    blobContentType: "image/jpeg"
                }
            };

            try {
                const uploadBlobResponse = await blockBlobClient.uploadData(imageBuffer, uploadOptions);
                console.log(`Upload block blob ${blobName} successfully`, uploadBlobResponse.requestId);

                req.body.cover = blockBlobClient.url;

                next();
            } catch (err) {
                console.log('Error uploading file:', err);
                res.status(500).send('Error uploading file');
            }
        }
    } catch (err) {
        console.log('Error uploading file:', err);
        res.status(500).send('Error uploading file');
    }
};

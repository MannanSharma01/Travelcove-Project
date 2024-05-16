// in this file, we will write code, to connect our server, to our cloud. after this, we will be able to interact
// with our cloud, from our server-side code itself.

const cloudinary = require("cloudinary").v2;
const {CloudinaryStorage} = require("multer-storage-cloudinary")

cloudinary.config(
  {
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET
  }
) ;


const storage = new CloudinaryStorage(
  {
    cloudinary: cloudinary,
    params: {
      folder: "wanderlust-first-listingImageFiles"
    }
  }
) ;

module.exports = {cloudinary, storage} ;
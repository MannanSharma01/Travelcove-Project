const express = require("express");
const router = express.Router();

const wrapAsyncFn = require("../utilities/asyncWrap.js");

const {isLoggedIn, isOwner} = require("../middleware.js"); 

const listingController = require("../controllers/listings.js");

const MyError = require("../utilities/Error.js");
const multer = require("multer");

const {storage} = require("../cloudConfig.js");
const upload = multer({storage, 
  fileFilter: (req, file, cb) => {          // server-side validation for the file sent by the client. ---only specefic file formats are allowed to be stored in the cloud.
    if(["png", "jpeg", "jpg"].includes(file.mimetype.split("/")[1])) {
      cb(null, true);
    }
    else {
      cb(new MyError(400, "Invalid file format"));
    }
  }
});

router.route("")
  .get( listingController.index )     // index-route
  .post( isLoggedIn, upload.single("image"), listingController.create );     // create-route



// new-(form) route 
router.get("/new", isLoggedIn, listingController.newForm);    // new-route MUST be written above show-route


router.get("/countrySearch", listingController.countrySearch);   // search by country


router.route("/:id")
  .get( wrapAsyncFn(listingController.show) )         // show route
  .put( isLoggedIn, wrapAsyncFn(isOwner), upload.single("image"), (listingController.update) ) ;    // update-route



// updation-form route 
router.get("/:id/edit", isLoggedIn, wrapAsyncFn(isOwner), listingController.updateForm);



// delete route
router.delete("/:id", isLoggedIn, wrapAsyncFn(isOwner), listingController.delete );


//---------------------filter------------

router.get("/filter/:category", listingController.filter);



module.exports = router;
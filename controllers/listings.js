const Listings = require("../models/listings.js");
const handlingFlash = require("../utilities/handlingFlash.js");
const MyError = require("../utilities/Error.js");
const { cloudinary } = require("../cloudConfig.js");

const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const geocoding = mbxGeocoding({accessToken: process.env.MAP_TOKEN});


module.exports.index = (req, res) => {     // no need for any error-handling in this function
  Listings.find({})
  .then( (result) => {                     // we can simply make this function 'async', and use 'await' here. I am using 'then' here, just for practice
    handlingFlash(req, res);
    res.render("listings/index.ejs", {allListings: result});
  } );
} ;


module.exports.newForm = (req, res) => {
  handlingFlash(req, res);
  res.render("listings/new.ejs");
};


module.exports.show = async (req, res, next) => {
  let listingId = req.params.id;
  // let qo = Listings.findById(listingId) .populate("reviews") .populate("owner");
  let qo = Listings.findById(listingId)
  .populate(
    {
      path: "reviews",
      populate: {
        path: "author"
      }
    }
  )
  .populate("owner");
  let listing = await qo;          // if this line give error(can give id-casting-error), handled by wrapAsyncFn
  if(listing === null) {
    next(new MyError(404, "no such listing found in the db"));
  }
  else {
    handlingFlash(req, res);
    res.render("listings/show.ejs", {theParticularListing: listing});
  }
} ;


module.exports.create = async (req, res, next) => {
  if(req.body.abc === undefined || typeof(req.body.abc)!== "object") {
    if(req.file) {
      cloudinary.uploader.destroy(req.file.filename, (err, result) => {
        console.log("file deleted from the cloud");
      });
    }
    throw new MyError(400, "some error");
  }
  else if(req.file === undefined) {
    throw new MyError(400, "no file sent");   // no 'image' key in the body OR invalid value given to 'image' in the body(eg. "image": "iafo", "image": "abc.pdf")
  }
  else {
    let newListing = req.body.abc;
    newListing.image = {url: req.file.path, filename: req.file.filename};
    newListing.owner = req.user._id;
    //---------geocoding--------------------------------
    let po = geocoding.forwardGeocode({
      query: newListing.location+", "+newListing.country,
      limit: 1
    }).send();
    let result = await po;
    newListing.geography = result.body.features[0].geometry;
    //--------------------------------------------------------
    newListing = new Listings( newListing );           // (now we want to insert one document, in a particular collection, in a database)
    let x= newListing.save();          // this is an 'async' function, ideally, we should have use 'await' here, instead of .then, .catch. Doing it just for my practice. 
    x.then( () => {
      req.flash("successMsg", "New Listing Created !");
      req.session.save( (err)=> {
        res.redirect("http://localhost:3000/listings");
      });
      
    })
    .catch( () => {                                                      // to handle casting,validation error. 
      cloudinary.uploader.destroy(req.file.filename, (err, result) => {
        console.log("file deleted from the cloud");
      });
      next( new MyError(500, "mongoose validation OR casting error(in simple words, the constraints written for a document in the 'listings' collection are not followed by the document we are trying to save in the 'listings' collection)") );
    });
  }
} ;         



module.exports.updateForm = async (req, res, next) => { 
  let theListing = await Listings.findById(req.params.id);
  handlingFlash(req, res);
  let url = (theListing.image.url).replace("/upload", "/upload/h_300,w_250");     // ** here, we want to show a lower-quality-picture.  // using cloudinary-image-transfomation
  res.render( "listings/edit.ejs", {theParticuarListing: theListing, url} );   
};     // NO need of 'ANY' error-handling in this function. All of it has already been done, in a middleware function, which is called before this ('isOwner' middleware function).




module.exports.update = async (req, res, next) => {
  
  if(req.body.xyz === undefined || typeof req.body.xyz !== "object") {
    if(req.file) {
      cloudinary.uploader.destroy(req.file.filename, (err, result) => {
        console.log("the file deleted from the cloud");
      });
    }
    next(new MyError(400, "ERROR ERROR"));
  }
  else {    // i.e req.body.xyz is acceptable.

    if (req.file === undefined) {
      next( new MyError(400, "no file sent") );
    }
    else {
      let updatedListing = req.body.xyz;
      updatedListing.image = {url: req.file.path, filename: req.file.filename};
      //-------geocoding---------------
      let result = await geocoding.forwardGeocode({
        query: updatedListing.location+", "+updatedListing.country,
        limit: 1
      }).send();

      updatedListing.geography = result.body.features[0].geometry;
      //----------------------------------
      try {
        let previousListing = await Listings.findByIdAndUpdate(req.params.id, updatedListing, { runValidators: true });    // if this line gives error(will 'only' give error, when updatedListing doesnt follow the constraints mentioned in the db schema---validation OR casting error),
//                                                                                            we dont want wrapAsynFn to handle it.(that's why, we are not even using wrapAsyncFn here.) we want to handle it some other way. thats why we are using try-catch.
        let previousImageFileName = previousListing.image.filename;
        cloudinary.uploader.destroy(previousImageFileName, (err, result) => {
          console.log("the previous file deleted from the cloud");
        });
        req.flash("successMsg", "Listing Updated Successfully!");
        req.session.save( (err)=> {
          res.redirect(`http://localhost:8080/listings/${req.params.id}`);
        });
        
      } catch {
        cloudinary.uploader.destroy(req.file.filename, (err, result) => {
          console.log("the file deleted from the cloud");
        });                                                
        next( new MyError(400, "mongoose validation or casting error in controllers/listings 'update' middleware function."));
      }
    }
  }
};



module.exports.delete = async (req, res, next) => {
  let listingId = req.params.id;
  let deletedListing = await Listings.findByIdAndDelete(listingId);
  req.flash("successMsg", "Listing Deleted Successfully!");
  cloudinary.uploader.destroy(deletedListing.image.filename, (err, result) => {
   console.log("a file deleted from the cloud.");
  });
  req.session.save( (err)=> {
    res.redirect("http://localhost:3000/listings");
  });
  
  }         // NO NEED on 'ANY' error-handling in this function.
  

//---------filter------------------------

module.exports.filter = async function(req, res) {
  let category = req.params.category;
  let allListings = await Listings.find({});
  let filteredListings = filterListings(allListings, category);
  if(filteredListings.length === 0) {
    handlingFlash(req, res);
    res.render("listings/no-listing-matches.ejs", {message: "No listing matches the applied filter"});
  } else {
    handlingFlash(req, res);
    res.render("listings/index.ejs", {allListings: filteredListings});
  }
 
} ;

function filterListings(arr, ctgry) {
  let i, resultArr=[];
  for(i of arr) {

    if( (i.categories).includes(ctgry) ) {
      resultArr.push(i);
    }
  }
  return resultArr;
} ; 

//-----------------countrySearch-----------

module.exports.countrySearch = async (req, res) => {
  let cntry = req.query.country;
  let filteredListings = await Listings.find({country: cntry});        // (0 chance of getting an error by this line)
  handlingFlash(req, res);
  if(!filteredListings.length) {
    res.render("listings/no-listing-matches.ejs", {message: `No Destination available in ${cntry} .`});
  } else {
    res.render("listings/index.ejs", {allListings: filteredListings});
  }
} ;



// if the code in this file becomes excessively large, split the middlewares related to listings, reviews, 
//and users, in separate files.

let Listings = require("./models/listings.js");
let MyError = require("./utilities/Error.js");
const Reviews = require("./models/reviews.js");                

const {reviewsCondns} = require("./utilities/joiConditions.js");


// ----------------listings----------------

function isLoggedIn (req, res, next) {       // checks if a particular client is logged in as a user or not.
  if(!req.isAuthenticated()) {         // i.e if(req.user === undefined)

    req.session.pathAndQs = req.originalUrl;        // remember the path to which, orignally the request was sent   // req.orignalUrl--path + queryString
    req.flash("error", "You Must Be Logged In To Perform This Action");

    req.session.save( (err) => {              // ensure that the session data is saved in the db, before redirecting
      res.redirect("http://localhost:8080/login");
    }); 
  } else {
    next();
  }
  
}


async function isOwner(req, res, next) {      // checks if a user is the owner of a listing
  let listingId = req.params.id;
  let theParticularListing = await Listings.findById(listingId);         // 'necessary' to do 'error-handling' in this function. After this, can remove handling of the same things from the 'update' function, 'updateForm', etc. (in controllers/listings).
//         if this line gives error(mongoose-listing_id-casting-error), handled by wrapAsyncFn

  if(theParticularListing === null) {       // if no such listing exists in the db.(i.e wrong listing id)
    next(new MyError(404, "wrong listing id") );              // the case of 'invalid' listingId (i.e mongoose casting error), handled by wrapAsyncFn
  }
  else {
    if(req.user._id.toString() === theParticularListing.owner.toString()) {     // user is the owner of the listing, so proceed
      next();
    } 
    else {       // user is the not owner of the listing, so DONT proceed
      req.flash("error", "You are NOT the owner of this listing. So can't perfrom this action.");
      req.session.save( (err) => {
        res.redirect(`http://localhost:8080/listings/${listingId}`);
      });
      
    }
  }  
}


//--------------------users-------------------------------

function notLoggedIn (req, res, next) {       // ensures that the client is not already logged in as a user

  if( req.isAuthenticated() ) {
    req.flash("error", "You are already logged in.");
    req.session.save( (err) => {
      return res.redirect("http://localhost:8080/listings");
    });
  } else {
    next();
  }
  
}


function savePathAndQs (req, res, next) {
  res.locals.pathAndQS = req.session.pathAndQs;
  next();
}



//-------------------- Reviews---------------------------------

function validateReview(req, res, next) {
  if(!req.body.abc) {
    next( new MyError(400, "error-1") );
  }
  else {
    let ans = reviewsCondns.validate( req.body.abc );
    if( ans.error ) {                   // the review DOESN'T follow the costraints defined by us(using joi), i.e review-validation failed.
      next( new MyError(400, "error-2") );     // calling the 'next', 'possible'---error-handling middleware function  
    }
    else{
      next();           // review validation passed. so shift control to the 'next', 'possible', non-error-handling middleware function.
    }
  }
}


async function notOwner(req, res, next) {            // to check if the user is NOT the owner of a listing, so that this user is UNABLE to post a review on his/her own listing.
  let listingId = req.params.id; 
  let theParticularListing = await Listings.findById(listingId);       // if this line gives error, handled by wrapAsyncFn (btw, this line will give a "casting-error", when the listingId is Invalid)
  if(!theParticularListing) return next(new MyError(404, "no such listing found in the db"));
  if(theParticularListing.owner.toString() !== req.user._id.toString()) return next(); 
  req.flash("error", "You can't drop a review on your own listing");
  req.session.save( (err) => {
    res.redirect(`http://localhost:8080/listings/${listingId}`);
  });
  
}


async function authorOfTheReview(req, res, next) {    // to check if the user is the owner of a review---so that he/she can ONLY delete their own review 

  let theParticularReview = await Reviews.findById(req.params.reviewId);
  if(theParticularReview === null) {
    next( new MyError(404, "No such review, exists in the db") );
  } 
  else {
    if(theParticularReview.author.toString() === req.user._id.toString()) {      // user IS the author of the review. proceed forward
      next();
    }
    else {                    // user IS NOT the author of the review. 
      let theListing = await Listings.findById(req.params.id);       // if this line gives error(can only give error when invalid_id written-----mongoose casting-error), handled by wrapAsyncFn.
      if(!theListing) {
        next( new MyError(404, "no such listing exists---wrong listing id") );
      } else {
        req.flash("error", "You are NOT the author of this review. So can't delete it");
        req.session.save( (err) => {
          res.redirect(`http://localhost:8080/listings/${req.params.id}`);
        });       
      }
    }
  } 
}



module.exports = {
  isLoggedIn,
  notLoggedIn,
  savePathAndQs,
  isOwner,
  notOwner,
  authorOfTheReview,
  validateReview
} ;
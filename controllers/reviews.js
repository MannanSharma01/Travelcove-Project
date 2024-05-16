const Listings = require("../models/listings.js");
const Reviews = require("../models/reviews.js");  
const MyError = require("../utilities/Error.js");


module.exports.create = async (req, res, next) => {   // no constraints written in the 'db' for a document in the 'reviews' collection.  Thats why, using 'joi', to check the constraints, before proceeding to store the document in the db. 

  let listingId = req.params.id;
  let theListing = await Listings.findById( listingId );  // (0 possiblity of this line giving an error(i.e invalidId) OR theListing storing null)
      
  let theReview = new Reviews( req.body.abc );
  theReview.author = req.user._id;
  await theReview.save();                    // (0 possiblity of this line giving an error)
  
  theListing.reviews.push(theReview._id);
  await Listings.findByIdAndUpdate(listingId, {reviews: theListing.reviews});   // (0 possiblity of this line giving an error)
  req.flash("successMsg", "New Review Created !");
  res.redirect(`http://localhost:8080/listings/${listingId}`);
} ;     // I have removed all the error-handling from this function because, all of the handling has already been done in middleware functions, which are called before this middleware function is called(notOwner and validateReview).



module.exports.destroy = async(req, res) => {          // I have removed all the error-handling code from here.
  let {id: listingId, reviewId} = req.params;
  await Listings.findByIdAndUpdate(listingId, { $pull: {reviews: reviewId} });
  await Reviews.findByIdAndDelete(reviewId);

  req.flash("successMsg", "Review Deleted Successfully!");     
  res.redirect(`http://localhost:8080/listings/${listingId}`);
}
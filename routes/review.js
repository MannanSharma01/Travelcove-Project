const express = require("express");
const router = express.Router({mergeParams: true});

const wrapAsyncFn = require("../utilities/asyncWrap.js");

const {isLoggedIn, notOwner, authorOfTheReview, validateReview} = require("../middleware.js");

const reviewController = require("../controllers/reviews.js");


//reviews--- create route
router.post( "", isLoggedIn, wrapAsyncFn(notOwner), validateReview, reviewController.create ) ;


// reviews--- delete-route
router.get( "/:reviewId", isLoggedIn, wrapAsyncFn(authorOfTheReview), (reviewController.destroy) );

module.exports = router;
let mongoose = require("mongoose");

let Schema = mongoose.Schema;

const listingSchema = new Schema(
  {
    title: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    image: 
    {             // for this key(image), the value should be an 'object' . 
      url: {
        type: String,
      },
      filename: String
    }, 
    price: {
      type: Number,
      required: true
    },
    location: {
      type: String,
      required: true
    },
    country: {
      type: String,
      required: true
    },

    reviews: [          // the 2 collections, namely 'listings' and 'reviews' have one-to-many relationship (one---listings, many---reviews)
      {
        type: Schema.Types.ObjectId,
        ref: "a-review"                           // we might have to use populate method, so writing ref option
      }
    ],

    owner: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: true
    }, 

    geography: {                 // storing in GeoJson format
      type: {
        required: true,
        type: String,
        enum: ["Point"]    // ony "Point" is allowed
      },
      coordinates: {
        type: [Number],
        required: true
      }
    },

    categories: {
      type: [String],
      enum: ["room", "camping", "castle", "farm", "beach", "pool", "ski", "arctic"]
    }
    
  }
) ;


const Reviews = require("./reviews.js");

listingSchema.post("findOneAndDelete", async (result, next) => {        // mongoose 'post' middleware function (to handle deletion of a particular listing. i.e, when a listing is deleted, all reviews posted for it, are deleted from the db)
  if(result === null) {
    next();          //(control shifts to the 'async' function. to complete its execution)
  }
  else {
    let x = Reviews.deleteMany( { _id: {$in: result.reviews} } );
    await x;
    console.log("documents deleted from the 'reviews' collection");
    next();
  }
  
});



const listingsModel = mongoose.model("listing", listingSchema, "listings");

module.exports = listingsModel;


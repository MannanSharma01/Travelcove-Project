const mongoose = require("mongoose");

const schema = mongoose.Schema;

const reviewsSchema = new schema(
  {
    comment: String,
    rating: {
      type: Number,
      min: 1,
      max:5
    },
    author: {
      type: schema.Types.ObjectId,
      ref: "user"
    }
  }
) ;

module.exports = mongoose.model("a-review", reviewsSchema, "reviews");
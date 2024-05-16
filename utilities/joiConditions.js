const joi = require("joi");

let revCondns = joi.object(  
  {
    rating: joi.number().integer().min(1).max(5).required(),
    comment: joi.string().required()
  }
) ;

module.exports.reviewsCondns = revCondns;
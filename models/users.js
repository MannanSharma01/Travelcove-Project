const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const usersSchema = new Schema( 
  {
    email: {                  // username automatically handled by passport
      type: String,
      required: true
    }
  }
);

const passportLocalMongoose = require("passport-local-mongoose");
usersSchema.plugin(passportLocalMongoose);

const UsersModel = mongoose.model("user", usersSchema, "users");
module.exports = UsersModel;
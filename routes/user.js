const express = require("express");
const router = express.Router();
const passport = require("passport");
const {notLoggedIn, savePathAndQs} = require("../middleware.js"); 

const userController = require("../controllers/users.js");


router.route("/signup")
  .get( notLoggedIn, userController.signupForm )
  .post( notLoggedIn, userController.signup);


// (if the client is already logged in as a user, when it(the client) sends this request, it should NOT BE ALLOWED to login)
router.route("/login")
  .get(notLoggedIn, userController.loginForm)
  .post(notLoggedIn, savePathAndQs, passport.authenticate("local", {failureRedirect: "/login", failureFlash: true}), userController.loginDone);


router.get("/logout", userController.logout);

module.exports = router;
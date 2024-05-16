const handlingFlash = require("../utilities/handlingFlash.js");
const User = require("../models/users.js");



module.exports.signupForm = (req, res) => {
  handlingFlash(req, res);
  res.render("users/signup.ejs");
}



module.exports.signup = async (req, res) => {
  let newUser = new User(
    {
      username: req.body.username,
      email: req.body.email
    }
  );
  try {
    let result = await User.register(newUser, req.body.password);        // this line will give an error--- if, the entered things dont obey the rules defined in the schema.(eg. email--mandatory,
// username--mandatory, password--mandatory, username should be unique for each document, ... ) -- (validation/casting error). to handle it, using try-catch instead of wrapAsyncFn, because, in the case 'this line' gives an error, we want to do different things, than done when using 'wrapAsycnFn'.

    req.login(result, (err) => {
      req.flash("successMsg", "Welcome to Travelcove");
      req.session.save( () => {
        res.redirect("/listings");
      }); 
    });   
  }
  catch(e) {
    if(e.name === "UserExistsError") {        // flashing a customized message in this particular case. Otherwise, not necessary. can just show e.message in EVERY case
      req.flash("error", `A User with username  '${req.body.username}'  already exists. Kindly choose some other username.`);
    }         
    else {    
      req.flash("error", e.message);
    }
    req.session.save( () => {
      res.redirect("/signup");
    });
    
  }
}


module.exports.loginForm = (req, res) => {
  handlingFlash(req, res);
  res.render("users/login.ejs");
}


module.exports.loginDone = (req, res) => {
  req.flash("successMsg", "You successfully logged in. Welcome to Travelcove 👋");

  if( res.locals.pathAndQS === undefined) {           // client logged in as a user, WITHOUT we forbidding it(the client) to perform an action, as it was NOT logged in as a user. 
    req.session.save( () => {
      res.redirect("/listings");
    });
    
  } 
  else {
    req.session.save( () => {
      res.redirect(`http://localhost:8080${res.locals.pathAndQS}`)
    });   
  }
};


module.exports.logout = (req, res) => {
  if(req.user === undefined) {                            // instead of using if-else here, we could have used a middleware function
    req.flash("error", "You are already logged out");
    req.session.save( () => {
      res.redirect("/listings");
    }); 
  }
  else {
    req.logOut( (err) => {
      if(!err) {
        req.flash("successMsg", "You Successfully Logged Out");
        req.session.save( () => {
          res.redirect("/listings");
        });
        
      } else {
        throw( MyError("500", "ERROR--unable to logout") );    // calling the 'next', 'possible', error handling middleware function
      }
    });
  }
};

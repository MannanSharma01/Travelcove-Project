require("dotenv").config();

const exp = require("express");
const app = exp();            // app------ corresponding to server-A      

app.listen(8080, ()=>{ console.log("server-A started at port 8080"); }) ;
app.listen(3000, ()=>{ console.log("server-A started at port 3000"); }) ;        // starting the server at 2 ports

const cors = require("cors");
app.use(cors());

const MyError = require("./utilities/Error.js");

const mongoose = require("mongoose");

async function main() {
  await mongoose.connect(process.env.ATLAS_DB_URL);
}

main()
  .then( ()=> { console.log("connection b/w this js file, and the specefied database, made"); } )
  .catch( ()=> { console.log("connection b/w this js file, and the specefied database, could'nt be made");} ) ;

app.set("view engine", "ejs");
const path = require("path");
app.set("views", path.join(__dirname, "/views"));

app.use(exp.static( path.join(__dirname, "/public") ));


const session = require("express-session");

const MongoStore = require("connect-mongo");
const store = MongoStore.create({
  mongoUrl: process.env.ATLAS_DB_URL,
  crypto: {
    secret: process.env.SECRET
  },
  touchAfter: 24*60*60,    // 24hrs

  collection: "sessionDataCollection"
});

store.on("error", (err) => {
  console.log("error in the session-store", err);     
})

const options = {
  store,
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() + 3*24*60*60*1000,         // 3 days
    maxAge: 3*24*60*60*1000,
    httpOnly: true          // to prevent XSS(cross-site-scripting) attacks
  }
} ;
app.use( session(options) );


const flash = require("connect-flash");          // need to write this above these 2 middleware functions----exp.urlenc.. AND exp.json...
app.use("/", flash());

app.use(exp.urlencoded({extended:true}));
app.use("/", exp.json());          // throw error if json syntax is wrong in req the request body

const ejsMate = require("ejs-mate");
app.engine("ejs", ejsMate);

const methodOverride = require("method-override");
app.use(methodOverride("_method"));


const passport = require("passport");
const LocalStrategy = require("passport-local");

const User = require("./models/users.js");

app.use( passport.initialize() );
app.use( passport.session() );

passport.use( new LocalStrategy( User.authenticate() ) );

passport.serializeUser( User.serializeUser() );
passport.deserializeUser( User.deserializeUser() );


const handlingFlash = require("./utilities/handlingFlash.js");      // this function handles the 'showing up the flash message', before any page is rendered
//-------------------------------------------------              // so always call it before rendering any page.
app.get("/", (req, res) => {
  res.redirect("/listings");
});

const listingRouter = require("./routes/listing.js") ;
app.use("/listings", listingRouter);

const reviewRouter = require("./routes/review.js");
app.use("/listings/:id/reviews", reviewRouter);    //  use the option {mergeParams: true}  with the express.Router, so that we can access the listingId there.

const userRouter = require("./routes/user.js");
app.use("", userRouter);

//---------privacy, terms-----------------------

app.get("/privacy", (req, res) => {
  handlingFlash(req, res);
  res.render("privacy.ejs");
});

app.get("/terms", (req, res) => {
  handlingFlash(req, res);
  res.render("terms.ejs");
});

//-------------------------------------------------


app.use("*", (req, res, next)=>{                          // if a client sends a request on a route, which does not exist(i.e we have not created) 
  next(new MyError(404, "Page doesnt exist"));
}) ;


app.use( (err, req, res, next) => {                         // error-handeling-middleware-function

  let statusCode = err.statusCode;
  let message = err.message;
  // res.status(statusCode).send(message);
  
  handlingFlash(req, res);
  res.status(statusCode).render("error.ejs", {message});
});



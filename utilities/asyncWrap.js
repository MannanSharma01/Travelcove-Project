let MyError = require("./Error.js");

function wrapAsync(f) {
  return function (req, res, next) {
    f(req, res, next).catch( ()=>{
      let x= new MyError(500, "error occurred");
      next(x);
    } );
  }
}

module.exports = wrapAsync;
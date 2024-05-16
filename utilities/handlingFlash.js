function handlingFlash(req, resp) {
  let success = req.flash("successMsg");
  resp.locals.successMsg = success;
  resp.locals.failureMsg = req.flash("error");

  resp.locals.request = req;     // ** not related to flash, but still imp. to do, before any page is rendered
}                                     // so that request object can be accessed in the ejs file(eg. for signup, logout, login conditions in the navbar )

module.exports = handlingFlash;             
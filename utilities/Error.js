class myError {                          // myError-------an object-constructor-function
  constructor(sts, msg) {
    this.statusCode = sts;
    this.message = msg;
  }
}; 

module.exports= myError;
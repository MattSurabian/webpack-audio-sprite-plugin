function UnexpectedError(message) {
  this.name = "UnexpectedError";
  this.message = (message || "");
}

UnexpectedError.prototype = Object.create(Error.prototype);
UnexpectedError.prototype.constructor = UnexpectedError;

module.exports = UnexpectedError;

const { StatusCodes } = require("http-status-codes");
const CustomerAPIError = require("./custom-api");

class BadRequestError extends CustomerAPIError {
  constructor(message) {
    super(message);
    this.StatusCodes = StatusCodes.BAD_REQUEST;
  }
}

module.exports = BadRequestError;

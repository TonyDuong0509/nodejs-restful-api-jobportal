const { createJWT, isTokenValid, attachCookiesToResponse } = require("./jwt");
const sendVerificationEmail = require("./sendVerificationEmail");
const createTokenUser = require("./createTokenUser");
const { checkPermissions } = require("./checkPermissions");
const validateMongoDbId = require("./validateMongoDbId");
const queryHelper = require("./queryHelper");
const handleUploadImage = require("./handleUploadImage");
const sendResetPasswordEmail = require("./sendResetPasswordEmail");
const createHash = require("./createHash");
const sendEmail = require("./sendEmail");

module.exports = {
  createJWT,
  isTokenValid,
  attachCookiesToResponse,
  sendVerificationEmail,
  createTokenUser,
  checkPermissions,
  validateMongoDbId,
  queryHelper,
  handleUploadImage,
  sendResetPasswordEmail,
  createHash,
  sendEmail,
};

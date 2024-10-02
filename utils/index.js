const { createJWT, isTokenValid, attachCookiesToResponse } = require("./jwt");
const sendVerificationEmail = require("./sendVerificationEmail");
const createTokenUser = require("./createTokenUser");

module.exports = {
  createJWT,
  isTokenValid,
  attachCookiesToResponse,
  sendVerificationEmail,
  createTokenUser,
};

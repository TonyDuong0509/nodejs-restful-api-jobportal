const CustomError = require("../errors");
const Token = require("./../models/tokenModel");
const { isTokenValid, attachCookiesToResponse } = require("./../utils/index");

const authenticateUser = async (req, res, next) => {
  const { refreshToken, accessToken } = req.signedCookies;
  try {
    if (accessToken) {
      const { payload } = isTokenValid(accessToken);
      req.user = payload.user;
      return next();
    }

    // If accessToken is expires
    const { payload } = isTokenValid(refreshToken);
    const existingToken = await Token.findOne({
      user: payload.user.userId,
      refreshToken: payload.refreshToken,
    });
    if (!existingToken || !existingToken?.isValid()) {
      throw new CustomError.Unauthenticated("Authentication Invalid !");
    }

    attachCookiesToResponse({
      res,
      user: payload.user,
      refreshToken: existingToken.refreshToken,
    });
    req.user = payload.user;
    next();
  } catch (error) {
    throw new CustomError.Unauthenticated("Authentication Invalid");
  }
};

module.exports = { authenticateUser };

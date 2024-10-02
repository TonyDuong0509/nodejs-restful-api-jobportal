const jwt = require("jsonwebtoken");

const createJWT = (payload) => jwt.sign(payload, process.env.JWT_TOKEN_SECRET);

const isTokenValid = (token) => jwt.verify(token, process.env.JWT_TOKEN_SECRET);

const attachCookiesToResponse = ({ res, user, refreshToken }) => {
  const accessTokenJWT = createJWT({ payload: { user } });
  const refreshTokenJWT = createJWT({ payload: { user, refreshToken } });

  const oneDay = 24 * 60 * 60 * 1000; // 1 day
  const longerExp = 1000 * 60 * 60 * 24 * 30;

  res.cookie("accessToken", accessTokenJWT, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    signed: true,
    expires: new Date(Date.now() + oneDay),
  });

  res.cookie("refreshToken", refreshTokenJWT, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    signed: true,
    expires: new Date(Date.now() + longerExp),
  });
};

module.exports = { createJWT, isTokenValid, attachCookiesToResponse };

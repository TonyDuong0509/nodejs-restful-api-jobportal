module.exports = {
  host: "smtp.gmail.com",
  port: 465,
  secure: true, // true for port 465, false for other ports
  auth: {
    user: process.env.ACCOUNT_GMAIL,
    pass: process.env.PASSOWRD_GMAIL,
  },
};

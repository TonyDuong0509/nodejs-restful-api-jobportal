const nodemailer = require("nodemailer");
const nodemailerConfig = require("./nodemailerConfig");

const sendEmail = async ({ to, subject, html }) => {
  const transporter = nodemailer.createTransport(nodemailerConfig);

  // Send mail with defined transport object
  return transporter.sendMail({
    from: "duonganhhao4751@gmail.com", // Sender address
    to,
    subject,
    html,
  });
};

module.exports = sendEmail;

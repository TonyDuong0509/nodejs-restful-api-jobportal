const sendEmail = require("./sendEmail");

const sendVerificationEmail = async ({ name, email, verificationToken }) => {
  const message = `<p>Please confirm your email by clicking on the following link: Fake Link - <span style='color: red'>${verificationToken}</span></p>`;

  return sendEmail({
    to: email,
    subject: "Email confirmation",
    html: `<h3>Hello, ${name}</h3> ${message}`,
  });
};

module.exports = sendVerificationEmail;

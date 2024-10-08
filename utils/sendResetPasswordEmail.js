const sendEmail = require("./sendEmail");

const sendResetPasswordEmail = async ({ name, email, token, origin }) => {
  const resetUrl = `${origin}/auth/reset-password?token=${token}&email=${email}`;

  const message = `<p>Please reset password by clicking on the following link: <a href='${resetUrl}'>Reset Password</a></p>`;

  return sendEmail({
    to: email,
    subject: "Reset Password",
    html: `<h3>Hello - ${name}</h3> ${message}`,
  });
};

module.exports = sendResetPasswordEmail;

const nodemailer = require("nodemailer");
require("dotenv").config()

const sendEmail = async (options) => {
  const transporter = nodemailer.createTransport({
    // for using gmail service service : 'Gmail' => Activate in gmail less secure options
    host: process.env.EMAIL_HOST,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  const mailOptions = {
    from: "Maaz Ahmed <maaz@gmail.com>",
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;

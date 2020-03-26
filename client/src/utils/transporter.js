let mailer = require("nodemailer");
// create reusable transporter object using the default SMTP transport
let transporter = mailer.createTransport({
  service: process.env.EMAIL_SERVICE,
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD
  }
});

module.exports = transporter;

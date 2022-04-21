const nodemailer = require("nodemailer");

async function mail(mailData) {
  let transporter = nodemailer.createTransport({
    service: "gmail",
    port: 587,
    secure: false, 
    auth: {
      user: 'snowbellplanet@gmail.com',
      pass: 'Snowbell@2022', 
    },
  });
  let info = await transporter.sendMail({
    from: '"support@snowbellinfotech" <snowbellplanet@gmail.com>', 
    to: mailData.to, 
    subject: mailData.subject, 
    text: mailData.text, 
    html: mailData.html, 
  });

  console.log("Message sent:", info.messageId);

}

module.exports={
    mailsending:mail
}
const nodemailer = require("nodemailer");
const ejs = require('ejs');
const {join} = require('path');

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
 // const data = await ejs.renderFile(join(__dirname,'../templates/', mailData.fileName), mailData, mailData.details)
const data=await ejs.renderFile(join(__dirname,'../templates/',mailData.fileName),mailData,mailData.details)
  let info = await transporter.sendMail({
    from: mailData.from, 
    to: mailData.to, 
    subject: mailData.subject, 
    text: mailData.text, 
    attachments: mailData.attachments,
    html: data, 

  });

  console.log("Message sent:", info.messageId);

}

module.exports={
    mailsending:mail
}
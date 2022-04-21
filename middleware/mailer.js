const mail = require('@sendgrid/mail');
const nodemailer=require('nodemailer');
const router = require('../routes/user.route');
const { route } = require('../routes/user.route');

const transport=nodemailer.createTransport({
    port:465,
    host:"",
    auth:{
        user:"sajna.platosys@gmail.com",
        pass:"Musthi@97"
    }
});

async function mailsending(mailData){
    try{
        transport.sendMail(mailData,(err,data)=>{
            if(err){
                console.log("err",err.message)
            }
        })
    }catch(error){
        console.log(error.message)
        process.exit(1);
    }
}

router.post("/mail",async(req,res)=>{
    try{
      const tomail=req.body.tomail;
      const subject=req.body.subject;
      const text=req.body.text;
      const mailData={
          from:"sajnaparveen97@gmail.com",
          to:tomail,
          subject: subject,
          text:text

      }
    }catch(error){

    }
})

module.exports={
    mailsending:mailsending
}
const router = require('express').Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const moment = require('moment');
const { Admin } = require('mongodb');              //testing
const schema = require('../model/usermodel');
const { joischema } = require("../validation/joischema");
const { mailsending } = require("../middleware/mailer");
const mail = require('@sendgrid/mail');


//const emailverify=require('../templates/emailverification.ejs');
//const mailsending=
//const nodemailer = require('nodemailer')
// const mail = nodemailer.createTransport({
//     "service":"gamil",
//     "auth":{
//         user:'sajnaparveen97@gmail.com',
//         pass:'Sajna@97'
//     }                               
// })

// const sendMail = () =>{
//     let mailData = {
//         from: "sajnaparveen97@gmail.com",
//         to: "sajna.platosys@gmail.com",
//         subject: "Hi Sajna",
//         text: "test mail"
//     }
//     mail.sendMail(mailData, function(err,data){
//         if(err){
//             console.log("err",err)
//         }else{
//             console.log("mail send achu!")
//         }
//     })
// }



// const sgMail = require('@sendgrid/mail')


router.post('/register', async (req, res) => {
    try {
        // await mailsending()

        const username = req.body.username;
        const email = req.body.email;
        const mobilenumber = req.body.mobilenumber;
        const password = req.body.password;
        const mailData = {
            to: email,
            subject: "Verify Email",
            text: "",
            fileName: "emailverification.ejs",
            details: {
              name: username,
              date: new Date(),
            //  link: `http://${results.en0}:${port}/api/v1/user/email-verify?email=${email}`
               link: `http://localhost:${port}/api/v1/user/email-verify?email=${email}`
            }
          };
       
        if (username && email && mobilenumber && password) {

            let userdetails = await schema.findOne({ 'username': username }).exec()
            let emailid = await schema.findOne({ 'email': email }).exec()
            let phn = await schema.findOne({ 'mobilenumber': mobilenumber }).exec()
            console.log("username", userdetails);
            console.log("email", emailid);
            console.log("mobileno", phn);
            const newresult = await joischema.validateAsync(req.body)

            if (userdetails) {
                return res.json({ status: "failure", message: "username already exist" })
            } else if (emailid) {
                return res.json({ status: "failure", message: "email already exist" })
            } else if (phn) {
                return res.json({ status: "failure", message: "mobileno already exist" })
            } else {

                let mailRes = mailsending(mailData)
                if(!mailRes){
                    console.log("mail not sending")
                    // return res.status(200).json({status:"success",message:"user details added  successfully",data:result})
                }else{

                let user = new schema(req.body);
                let salt = await bcrypt.genSalt(10);
                user.password = bcrypt.hashSync(password, salt);
                console.log(user.password);
                let result = await user.save();
                console.log("result", result)
                return res.status(200).json({ status: "success", message: "user details added  successfully" })
                  }


                // const authdataSchema = joi.object({
                //     username:joi.string().pattern(new RegExp(/^[A-Za-z]+[0-9]{3}+$/)).min(4).max(20).required(),
                //      email:joi.string().pattern(new RegExp(/^[a-zA-Z0-9+_.-]+@[a-zA-Z0-9.-]+$/)).required(),
                //      mobilenumber:joi.string().length(10).pattern(new RegExp(/^[0-9]{10}+$/)).required(),
                //      password:joi.string().min(3).required(),
                // });
                // let  result=authdataSchema.validate(req.body)
                // res.send(result)
            }
        }
        else {
            return res.status(400).json({ status: "failure", message: "must include all details" })
        }
    } catch (error) {
        console.log(error.message);
        return res.status(500).json({ status: "failure", message: error.message })
    }
})


router.get("/email-verify", async (req, res) => {
    try {
      const data = await schema.findOne({ email:req.query.email }).exec();
      console.log("data",data)
      if (data) {
            if(data.verifyed){
              console.log("true")
              res.render('verify.ejs',{userName: data.username,email: data.email,title: "Your Account Already Verified!"})
            }else{
              console.log("false")
              schema.updateOne({ email: req.query.email }, { verifyed: true }).exec();
              res.render('verify.ejs',{userName: data.username,email: data.email,title: "Your Account Verified Successfully!"})
            }
          } else {
            res.render('verify.ejs',{userName: data.username,email: data.email,title: "Account Verification Failed!"})
          }
    } catch (error) {
      console.log("email-verify", error);
    }
  });

//login
router.post('/loginpage', async (req, res) => {
    try {
        let username = req.body.username;
        let password = req.body.password;
        let userdetails;
        let details = await schema.findOne({ username: username }).select('-username -_id ').exec()
        if(!details.verifyed){
            return res.status(400).json({
              status: "failure",
              message: "Your accout is not verified, Please verify your account",
            });
          }else{
        if (username) {
            userdetails = await schema.findOne({ username: username }).exec()
            if (!userdetails) {
                return res.status(400).json({ status: "failure", message: "Don't have an account?please Register" });
            } else if (userdetails) {
                console.log(userdetails.password)
                let match = await bcrypt.compare(password, userdetails.password);
                console.log("match", match)
                console.log("password", password)
                if (userdetails.firstLoginStatus !== true) {
                    await schema.findOneAndUpdate({ uuid: userdetails.uuid }, { firstLoginStatus: true }, { new: true }).exec()
                }
                let payload = { uuid: userdetails.uuid, role: userdetails.role }
                // let payload = {uuid: userdetails.uuid,role:Admin}
                if (match) {
                    let userdetails = details.toObject()//to append jwt token
                    let jwttoken = jwt.sign(payload, process.env.secretKey)
                    userdetails.jwttoken = jwttoken
                    await schema.findOneAndUpdate({ uuid: userdetails.uuid }, { loginStatus: true }, { new: true }).exec()
                    return res.status(200).json({ status: "success", message: "Login successfully", data: { userdetails, jwttoken } })
                } else {
                    return res.status(200).json({ status: "failure", message: "Login failed" })
                }
            }
        }
    }
    } catch (error) {
        console.log(error.message)
        return res.status(500).json({ status: "failure", message: error.message })
    }
})

//logout
router.post("/logout/:uuid", async (req, res) => {
    try {

        let date = moment().toDate()
        console.log(date)
        await schema.findOneAndUpdate({ uuid: req.params.uuid }, { lastedVisited: date, loginStatus: false }, { new: true }).exec()
        return res.status(200).json({ status: "success", message: "Logout success" })
    } catch (error) {
        console.log(error.message)
        return res.status(500).json({ status: "failure", message: error.message })
    }
})


router.post("/sendMail", async (req, res) => {
    const link = "https://snowbelltech.com/"
    const toMail = req.body.toMail;
    const email = req.body.email;
    const mailData = {
        //   from:"snowbellplanet@gmail.com",
        to: toMail,
        subject: 'Verify Email',
        text: '',
        fileName: 'emailverification.ejs',
        // html: '<div><h2>Welcome to Snowbell Infotech</h2></br><p>click the link and verify your email id<p/></br><a href="https://snowbelltech.com/">VERIFY EMAIL HERE!</a></div>'
        details: {
            name: "sajna",
            date: new Date(),
            link: "https://snowbelltech.com/"
        }
    }

    let mailRes = mailsending(mailData)
    if (!mailRes) {
        console.log("mail not sending")
        // return res.status(200).json({status:"success",message:"user details added  successfully",data:result})
    } else {
        return res.status(200).json({ status: "success", message: "mail send success" })
    }
})

module.exports = router;
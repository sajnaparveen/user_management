const router=require('express').Router();
const bcrypt=require('bcrypt');
const jwt = require('jsonwebtoken');
const moment =require('moment');
const { Admin } = require('mongodb');



const schema=require('../model/usermodel');

router.post('/register',async(req,res)=>{
try{

const username=req.body.username;
const email=req.body.email;
const mobilenumber=req.body.mobilenumber;
const password=req.body.password;

 if(username && email && mobilenumber && password){
 let userdetails=await schema.findOne({'username':username}).exec()
 let emailid=await schema.findOne({'email':email}).exec()
 let phn=await schema.findOne({'mobilenumber':mobilenumber}).exec()
console.log("username",userdetails);
console.log("email",emailid);
console.log("mobileno",phn);
 if(userdetails){
    return res.json({status:"failure",message:"username already exist"})
  }else if(emailid){
    return res.json({status:"failure",message:"email already exist"})
  }else if(phn){
    return res.json({status:"failure",message:"mobileno already exist"})
  }else{
    let user=new schema(req.body);
    let salt = await bcrypt.genSalt(10);
    user.password = bcrypt.hashSync(password, salt);
    console.log(user.password);
    let result=await user.save();
    
    return res.status(200).json({status:"success",message:"user details added  successfully",data:result})
  }
}
 else{
        return res.status(400).json({status:"failure",message:"must include all details"})
    }    
}catch(error){
    console.log(error.message);
    return res.status(500).json({status:"failure",message:error.message})
}
})
//login
router.post('/loginpage',async(req,res)=>{
    try{
        let username = req.body.username;
        let password = req.body.password;
     let userdetails;
     let details=await schema.findOne({username:username}).select('-username -_id ').exec()
    if(username){
         userdetails=await schema.findOne({username:username}).exec()
        if(!userdetails){
            return res.status(400).json({status: "failure", message: "Don't have an account?please Register"});
        }else if(userdetails){
            console.log(userdetails.password)
            let match=await bcrypt.compare(password,userdetails.password);
            console.log("match",match)
            console.log("password",password)
            if(userdetails.firstLoginStatus !== true){
                await schema.findOneAndUpdate({uuid:userdetails.uuid},{firstLoginStatus:true},{new:true}).exec()
            }
            let payload = {uuid: userdetails.uuid,role:userdetails.role}
           // let payload = {uuid: userdetails.uuid,role:Admin}
            if(match){
               let userdetails=details.toObject()
               let jwttoken = jwt.sign(payload, process.env.secretKey)
               userdetails.jwttoken = jwttoken
                return res.status(200).json({status: "success", message: "Login successfully",data:{userdetails,jwttoken}})
            }else{
                return res.status(200).json({status: "failure", message: "Login failed"})
            }
            }
        }
    
    }catch(error){
        console.log(error.message)
        return res.status(500).json({status: "failure", message: error.message})
    }
})

//logout
router.post("/logout/:uuid",async(req,res)=>{
    try{

        let date = moment().toDate()
        console.log(date)
        await schema.findOneAndUpdate({uuid: req.params.uuid}, {lastedVisited: date,loginStatus: false}, {new:true}).exec()
        return res.status(200).json({status: "success", message: "Logout success"}) 
    }catch(error){
        console.log(error.message)
        return res.status(500).json({status: "failure", message: error.message})
    }
})
module.exports = router;
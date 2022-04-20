const router = require('express').Router();
const orderSchema = require("../model/order.model")
const userSchema=require("../model/usermodel");
const {authVerify, isAdmin} = require("../middleware/auth");

router.post('/add',authVerify,async(req,res)=>{
    try{

        return res.status(200).json({'status': 'success', "message": " successfully added", "result": result})
    }catch(error){
        console.log(error.message);
        return res.status(400).json({"status": 'failure', 'message': error.message})
    }
});

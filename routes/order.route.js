const router = require('express').Router();
const orderSchema = require("../model/order.model")
const userSchema=require("../model/usermodel");

router.post('/order',async(req,res)=>{
    try{
       const orderproduct=await new orderSchema(req.body);
       const result = await orderproduct.save();
       console.log("orderresult",result)
        return res.status(200).json({'status': 'success', "message": " successfully added", "result": result})
    }catch(error){
        console.log(error.message);
        return res.status(400).json({"status": 'failure', 'message': error.message})
    }
});
module.exports = router;
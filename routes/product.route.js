const router = require('express').Router();
const Schema = require("../model/product.model");
const category=require("../model/category.model");
const userSchema=require("../model/usermodel");
const {authVerify, isAdmin} = require("../middleware/auth");
const req = require('express/lib/request');
const res = require('express/lib/response');
//add
router.post('/add',authVerify,async(req,res)=>{
    try{
        let detail = req.body
        const data = new Schema(detail);
        const result = await data.save();
        return res.status(200).json({'status': 'success', "message": " successfully added", "result": result})
    }catch(error){
        console.log(error.message);
        return res.status(400).json({"status": 'failure', 'message': error.message})
    }
});


// get all product 
router.get("/get",authVerify, async(req,res)=>{
    try{
        const productDetails = await Schema.find().exec();
        if(productDetails.length > 0){
            return res.status(200).json({'status': 'success', message: "Product details fetched successfully", 'result': productDetails});
        }else{
            return res.status(404).json({'status': 'failure', message: "No Product details available"})
        }
    }catch(error){
        console.log(error.message);
        return res.status(400).json({"status": 'failure', 'message': error.message})
    }
});

// update 
router.put("/update",authVerify, async(req,res)=>{
    try {
        let condition = {"uuid": req.body.uuid}
        let updateData = req.body.updateData;
        let option = {new: true}
        const data = await Schema.findOneAndUpdate(condition, updateData, option).exec();
        return res.status(200).json({'status': 'success', message: "  successfully updated", 'result': data});
    } catch (error) {
        console.log(error.message);
        return res.status(400).json({"status": 'failure', 'message': error.message})
    }
});

// delete 
router.delete("/delete/:product_uuid",authVerify, async(req,res)=>{
    try {
        console.log(req.params.product_uuid)
        await Schema.findOneAndDelete({uuid: req.params.product_uuid}).exec();
        return res.status(200).json({'status': 'success', message: "successfully deleted"});
    } catch (error) {
        console.log(error.message);
        return res.status(400).json({"status": 'failure', 'message': error.message})
    }
})
// router.post("/addcategory",async(req,res)=>{
//     try{
//         let detail = req.body
//         const data = new category(detail);
//         const result = await data.save();
//         return res.status(200).json({'status': 'success', "message": " category successfully added", "result": result})
//     }catch(error){
//         console.log(error.message);
//         return res.status(400).json({"status": 'failure', 'message': error.message})
//     }
// })
router.get("/userbasedprdoucts",async(req,res)=>{
    try{
let details=await userSchema.aggregate([
    // {
    //     $match:{
    //         $and:[
    //             {"uuid": req.query.user_uuid},
    //             {"userUuid": req.query.userUuid},
               
    //         ]
    //     }
    // },
{
    
    '$lookup':{
        from:'products',
        localField: 'uuid',
        foreignField: 'userUuid',
        as: 'product_details'
            }
        },
        {
            '$lookup':{
                from:'category',
                localField:'uuid',
                foreignField:'userUuid',
                as:'category_details'
            }  
        },{
            '$unwind':{
                path:'$product_details',
                preserveNullAndEmptyArrays:true
            }
        },
        {
            '$unwind':{
                path:'$category_details',
                preserveNullAndEmptyArrays:true
            }
        },
        {
            $project: {
                "_id": 0,
                "username": 1,
                "product_details.productName": 1,
                "category_details.categoryName":1

            }
        } 
])
console.log(details)
if(details.length>0){
    return res.status(200).json({'status': 'success', message: "Product details fetched successfully", 'result': details});
}else{
    return res.status(404).json({'status': 'failure', message: "product details not available"})
}
    }catch(error){
        console.log(error.message);
        return res.status(400).json({"status": 'failure', 'message': error.message})
    }
})
router.post('/addCategory', isAdmin, async(req,res)=>{
    try{
        const data = new userSchema(req.body);
        const result = await data.save()
        return res.status(200).json({status: "success", message: 'category added successfully', result: result})
    }catch(error){
        console.log(error.message);
        return res.status(400).json({"status": 'failure', 'message': error.message})
    }
})
module.exports = router;
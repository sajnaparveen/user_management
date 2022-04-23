const router = require('express').Router();
const Schema = require("../model/product.model");
const category=require("../model/category.model");
const userSchema=require("../model/usermodel");
const {authVerify, isAdmin} = require("../middleware/auth");
const req = require('express/lib/request');
const res = require('express/lib/response');
const { schema } = require('../model/product.model');
const moment=require('moment')

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
    {
        $match:{
            $and:[
            //  {"categoryUuid": req.query.categoryUuid},
              {"uuid": req.query.userUuid}
               
            ]
        }
    },
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
        },
        {
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
        const data = new category(req.body);
        const result = await data.save()
        return res.status(200).json({status: "success", message: 'category added successfully', result: result})
    }catch(error){
        console.log(error.message);
        return res.status(400).json({"status": 'failure', 'message': error.message})
    }
})

router.get('/get-product-expire',async(req,res)=>{ //get expired product details between startDate to endDate
    try{

const {beginDate,endDate}=req.query;
console.log("begindate1",beginDate)
console.log("enddate1",endDate)
 //begindate1=moment(beginDate).startOf('day').toString()
 //endDate1=moment(endDate).endOf('day').toString()
      const condition={
     // ExpiredDate:{$gte:beginDate,$lte:endDate}
      // ExpiredDate:{$gte:beginDate,$lte:endDate}
       // ExpiredDate:{$gte: Date.parse("April 01, 2022"),$lte:Date.parse("April 12, 2022")}
       ExpiredDate:{$gte:moment(beginDate).format('YYYY-MM-DD'),$lte:moment(endDate).format('YYYY-MM-DD')} 
      }
    //   var date =await moment("2016-01-23T22:23:32.927");
    //   console.log("momentdate",date);
    //   const createcondtion={
    //     createdAt:{$gte:"2022-04-19",$lte:"2022-04-19"}
    //   }
    
      const product=await Schema.find(condition)
       
      let details=await category.aggregate([
        {
            $match:{
                $and:[
                    {"uuid": req.query.user_uuid},
                    {"userUuid": req.query.userUuid},
                   
                ]
            }
        }


      ])




     console.log("productdate",product)
     if(product){
        return res.status(200).json({"status": 'true', 'message': "fetched succussfully",result:product  })
     }else{
        return res.status(400).json({"status": 'failure'})
     }

    }catch(error){
        console.log(error.message);
        return res.status(400).json({"status": 'failure', 'message': error.message})
    }
})

router.get('/get-product-createdAt',async(req,res)=>{ //get startdate to enddate created products details 
    try{

        
        const {beginDate,endDate}=req.query;
      const createcondtion={
       // createdAt:{$gte:beginDate,$lte:endDate}
        createdAt:{$gte: moment(beginDate).format('YYYY-MM-DDT23:59:59.000Z'),$lte:moment(endDate).format('YYYY-MM-DDT23:59:59.000Z')}
       
      }

      const product=await Schema.find(createcondtion)
       
     console.log("createdAt",product)
     if(product){
        return res.status(200).json({"status": 'true', 'message': product})
     }else{
        return res.status(400).json({"status": 'failure'})
     }

    }catch(error){
        console.log(error.message);
        return res.status(400).json({"status": 'failure', 'message': error.message})
    }
})

router.get('/get-product-updated',async(req,res)=>{
    try{

        
    //    const {beginDate,endDate}=req.query;
      const condtion={
       // createdAt:{$in:[createdAt:{$ne:updatedAt}]}
      // $eq:[this.updatedAt,this.createdAt]
       //db.inventory.find( { "item.name": { $eq: "ab" } } )
       $where:"this.createdAt.toString()!==this.updatedAt.toString()"
      }

      const product=await Schema.find(condtion)
       
     console.log("createdAt",product)
     if(product){
        return res.status(200).json({"status": 'true', 'message': product})
     }else{
        return res.status(400).json({"status": 'failure'})
     }

    }catch(error){
        console.log(error.message);
        return res.status(400).json({"status": 'failure', 'message': error.message})
    }
})

module.exports = router;
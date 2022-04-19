const mongoose = require('mongoose');
const crypto = require('crypto');

const productSchema = new mongoose.Schema({
    
    uuid: {type: String, required:false},
    productName:{type: String, required: true, trim: true},
    quantity:{type: Number, required: true},
    price:{type: String, required: true},
    brand:{type: String, required: true},
    ExpiredDate:{type:Date,required:true},
    mdf:{type:Date,required:true},
    userUuid: {type: String, required: true},
    categoryUuid:{type: String, required: true},
    
    active: {type: Boolean, required: false, default: true}
},
{
    timestamps: true
});


productSchema.pre('save', function(next){
    this.uuid = 'PROD-'+crypto.pseudoRandomBytes(6).toString('hex').toUpperCase()
    console.log(this.uuid);
    next();
});

module.exports=mongoose.model('product',productSchema);
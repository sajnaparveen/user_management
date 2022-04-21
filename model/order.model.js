const mongoose = require('mongoose');
const crypto = require('crypto');

const orderSchema = new mongoose.Schema({

    
    uuid: {type: String, required:false},
    productName:{type: String, required: true, trim: true},
    amount:{type: String, required:true},                                     
    deliveryAddress:{type: String, required: true},
    productUuid: {type: String, required: true},
    
},
{
    timestamps: true
});


orderSchema.pre('save', function(next){
    this.uuid = 'ORDER-'+crypto.pseudoRandomBytes(6).toString('hex').toUpperCase()
    console.log(this.uuid);
    next();
});

module.exports=mongoose.model('order',orderSchema,'order');
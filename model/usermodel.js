const mongoose=require('mongoose')
const crypto=require('crypto');

const schema = new mongoose.Schema({
    uuid : {type: String, required : false},
    username:{type:String,required:true},
    email:{type:String,required:true,trim:true,unique:true},
    mobilenumber:{type:String,required:true},
    password:{type:String,required:true},
    //role:{type: String, enum:['admin', 'user'], required: false, default: 'user'},
    role:{type: String, enum:['admin', 'user'], required: false, default: 'admin'},
    lastedVisited: {type: String, required: false},
    loginStatus:{type: Boolean, required: false, default: false},
    firstLoginStatus:{type: Boolean, required: false, default: false}
},{
    timestamps:true
})

schema.pre('save',function(next){
    this.uuid='USER-'+crypto.pseudoRandomBytes(4).toString('hex').toUpperCase()
    next()
})

module.exports = mongoose.model('user',schema,'user');
const express=require('express')
const cors=require('cors')
const mongoose=require('mongoose')
require('dotenv').config();
//const expresslayout=require('express-ejs-layouts')

const port=process.env.port || 8080;                     //testing 

const productRouter = require('./routes/product.route');
const userrouter=require('./routes/user.route');
const orderproduct=require('./routes/order.route')


const app=express();
app.use(cors());



//mongodb con
mongoose.connect(process.env.dburl,{
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(data=>{
    console.log("database connected");
}).catch(err=>{
    console.log(err.message);
    process.exit(1);
})


app.use(express.json());
app.use(express.json());
app.set('view engine', 'ejs')

app.use('/api/v1/user',userrouter); 
app.use('/api/v2/product/', productRouter);
app.use('/api/v3/order/',orderproduct);                                              

app.listen(port, ()=>{
    console.log(`http://127.0.0.1:${port}`)
});
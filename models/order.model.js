import mongoose, { Mongoose } from "mongoose";
 const orderSchema=new mongoose.Schema({
    
    quantity:{
        type:Number
    },
    // purchaser:[String],
    productDetail:[{
        productId:String,
        quantity:Number,
        PurchaserName:String,
        price:Number,
        productName:String
    }],
    
    //productName:[{nameProduct:String}],
    // saleId:{
    //     type:mongoose.Schema.Types.ObjectId,
    //     ref:'sale'
    // }
    
    price:String
},{timestamps:true})
export const order=mongoose.model('order',orderSchema)
import mongoose, { Schema } from "mongoose";
const AdtoCart=new mongoose.Schema({
    isCheckedOut:{
        type:Boolean,
        default:false
    },
    // productId:[String],
    userId:String,
    quantity:Number
     ,
     product:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'product'
     }
     ,
     price:Number,
     productName:String
    //  products:[{
    //     productId:{type:mongoose.Schema.Types.ObjectId, ref:'product'},
    //         quantity:Number,
    //  }]
     
     
},{timestamps:true})

export const adCart=mongoose.model('adCart',AdtoCart)
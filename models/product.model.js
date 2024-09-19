import mongoose from "mongoose";
 const productSchema=new mongoose.Schema({
    name:{
        type:String,

    },
    description:{
        type:String,
        
    },
    OriginalPrice:{
        type:Number,
        
    },
    Quantity:{
        type:Number,
        
    },
    discountPrice:{
        type:Number
    },
    percentage:{
        type:Number
    },
    category:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'category'
    }
    ,
    adCart:{type:mongoose.Schema.Types.ObjectId,
        ref:'adCart'
     },
     softDelete:{
        type:Boolean,
        default:false
     }
},{timestamps:true})
export const product= mongoose.model('product',productSchema)
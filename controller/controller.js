import { user } from "../models/singup.model.js"
import { Sale} from "../models/sale.model.js"
import { category } from "../models/catagory.model.js"
import { product } from "../models/product.model.js"
import { order } from "../models/order.model.js"
import { adCart } from "../models/addToCart.js"
import Stripe from 'stripe'
const stripe=new Stripe(process.env.stripe_key,{ apiVersion: '2023-08-16'})
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import otp from "otp-generator"
import axios from "axios"
import {Client} from '../uitls/uitls.js'
import nodemailer from "nodemailer"
import Enum from "enum"
const secretKey="2155"
const timeout=10
const saltRounds=10


const signUpUser=async (req,res) => {
    try {
        const {name,email,password,role}=req.body
    
    const hasdpassword=await bcrypt.hash(password,saltRounds)
    const token=jwt.sign(email,secretKey)
    console.log(hasdpassword)
    
    const createUser= await user.create({name:name,email:email,password:hasdpassword,role:role,token:token})
    const {token:tokenfetch,...rest} = createUser._doc
    return res.status(200).json({message:'user has been created :',user:rest,token:tokenfetch})
        
    } catch (error) {
        return res.status(500).json({message:'user already excits ',error})
    }
}
const logIn=async (req,res) => {
    try {
        const {email,password,newpassword,OTP}=req.body
   
        
         const find= await user.findOne({email})
    
        if(!find){
             return res.status(500).json({message:'user not found '})
        }
         if(password===find.password){
             return res.status(200).json({message:"you have login"})

        }

         const oTp=otp.generate()
         const matchUpDate=await user.findOneAndUpdate({email},{$set:{Otp:oTp}})
       if(OTP !==matchUpDate.Otp){
            return res.status(500).json({message:'your otp incorrect'})
       }
         const token=await jwt.sign(email,secretKey)
      if(!newpassword||newpassword.trim()==='')
        {
        console.log("hbhjg")
             return res.status(500).json({message:'must be enter a newPassword'})
                  }
        
         const hash=await bcrypt.hash(newpassword,saltRounds)
         const changePwd=await user.findOneAndUpdate({email},{$set:{password:hash}})
         console.log(token)
         const transporter = nodemailer.createTransport({
             host: "smtp.gmail.com",
             port: 587,
             secure:false,
             auth: {
               user: "sardaralivirk@gmail.com",
               pass: "hqpqljmuhxtfpgmo",
             },
           });
           const info = await transporter.sendMail({
         from: '<sardaralivirk@gmail.com>', // sender address
             to: "alivirk4160@gmail.com", // list of receivers
             subject: "Hello ✔", // Subject line
             text: "Hello world?",
             html:`<h1>is this ${otp}email</h1>` // plain text body
           });
        res.json({message:'user found&& enterd newpassword for login&  send a maail :'})

    } catch (error) {
        console.log('you have a errors many reason go and find:',error)
    }
}
const Sales=async (req,res) => {
    try {
    const {productId,percentage}=req.body
   const find=await product.findOne({_id:productId})
   const price=(find.price/percentage)*100
   console.log(price)
   const addPrice=await Sale.create({price:price})

    res.status(500).json({message:'you have a create a admin',addPrice})   
} catch (error) {
    console.log(error)
    res.status(200).json({message:'you have a error go find and solve',error})
}
    
}
const createCategory=async (req,res) => {
    try {
        const {adminId,name,discretion}=req.body
        const find=await user.findOne({_id:adminId,role:'Administrator'})
        if(!find){
            return res.status(500).json({message:'user not found'})
        }
        const findCategory=await category.findOne({name:name})
        if(findCategory){
            return res.status(500).json({message:'you already enter a category'})
        }
        const createCategory=await category.create({discretion:discretion,name:name})
        res.status(500).json({message:'admin role  has been check and then crete',createCategory})
    } catch (error) {
        res.status(200).json({message:'go find error and solve it',error})
    }
    
}
const productCreate=async (req,res) => {
    try {
        console.log('gghgh')
        const {adminId,name,description,OriginalPrice,Quantity,percentage,categoryId}=req.body
        const discount_Price=(OriginalPrice*percentage)/100
        
        const discountPrice=OriginalPrice-discount_Price
        
    const find=await user.findOne({_id:adminId,role:'Administrator'})
    console.log(find)
    if(!find){
        return res.status(500).json({message:'administrator not find'})
    }
    const findCategory=await category.findById(categoryId);
    console.log(findCategory)
    const createproduct=await product.create({name:name,description:description,OriginalPrice:OriginalPrice,percentage:percentage,Quantity:Quantity,
        discountPrice:discountPrice,category:findCategory})
    return res.status(200).json({message:'administrator role verify and then create',createproduct})  
    } catch (err) {
             console.log(err)
        res.status(500).json({message:"go and find error if you have mind",err})
        
    }

    
}
    const createOrder=async (req,res) => {   
        try {
            const user=req.user
            
         const find= await adCart.find({isCheckedOut:false}).populate('product')
       //  const check =find.match/name /im;
            // console.log(check)
                find.map(async (item) => {
                    const products = await product.findById(item.product);

                    return {
                        ...item._doc, // spread the cart item details
                        productName: products ? products.name : 'Product not found',
                    };
                })
            //);
            console.log(find)
            const productDetails = detailedCartItems.map(({ productName, price, quantity }) => {
                return { productName, price, quantity };
               // return `<p>Product Name: ${productName}, Price: ${price},Quanity:${quantity}</p>`;
              });
            console.log('=============================33==',productDetails,"===========================44");
            
         let totalprice=0
           productDetails.forEach(a => {  
            if(a.price)
                {totalprice+=a.price}
        });
        
       const createOrder1=await order.create({price:totalprice,productDetail:productDetails})

       const formattedProductDetails = productDetails.map(product => {
        return `<p>Product Name: ${product.productName}, Price: ${product.price},Quanity:${product.quantity}</p>`;
      }).join(''); 
    //console.log(formattedProductDetails)
  
     const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure:false,
        auth: {
          user: "sardaralivirk@gmail.com",
          pass: "hqpqljmuhxtfpgmo",
        },
        
      });
      const info = await transporter.sendMail({
        from: '<sardaralivirk@gmail.com>', // sender address
        to: "alivirk4160@gmail.com", // list of receivers    
        subject: "Hello ✔", // Subject line
        text: "Hello world?",
        html:`<h1>  TotalPrice=${totalprice}/n${formattedProductDetails}</h1>`
      });
     //const updateAdToCart= await adCart.findOneAndUpdate({isCheckedOut:false},{$set:{isCheckedOut:true}})
     //console.log(updateAdToCart)
const session = await stripe.checkout.sessions.create({
    line_items: [
      {
        // Provide the exact Price ID (for example, pr_1234) of the product you want to sell
        price: '{{PRICE_ID}}',
        quantity: 1,
      },
    ],
    mode: 'payment',
    success_url: `${YOUR_DOMAIN}/success.html`,
    cancel_url: `${YOUR_DOMAIN}/cancel.html`,
  });

  res.redirect(303, session.url);
//});
     return res.status(200).json({message:"you have successfully ordered",createOrder1})

    } 
    catch (error) {
        console.log(error)
        return res.status(500).json({message:"go and find error",error})
        
    }
}
const AdtoCart=async (req,res) => {
try {
    const {productId,quantity}=req.body
    const user=req.user
    const findproduct=await product.findById(productId)
    console.log(findproduct)
    if(findproduct.Quantity<0){return res.status(500).json({message:'this product have not stock in store'})}
    if(findproduct.Quantity<quantity){
          return res.status(500).json({message:'please enter less quantity'})
    }
 
 console.log(findproduct.discountPrice)
const price = findproduct.discountPrice;
let Price=price*quantity 
console.log(Price)
const AdProduct = await adCart.findOneAndUpdate(
  { product:findproduct, userId: user._id },  // Query
  { $inc: { quantity: quantity, price: Price}},  // Update
  { new: true, upsert: true }  // Options
).populate({
    path:'product',
    populate:{
        path:'category'
    }
});
findproduct.Quantity -= quantity
    await findproduct.save()
console.log(AdProduct)
// if (!AdProduct) {
//   return res.status(200).json({message: 'Your product has been added to the cart',adInCart: find });
// } 
const findAll= await adCart.find({isCheckedOut:false})
let totalprice=0
 findAll.forEach(a => {
    if(a.price){
        totalprice+=a.price
    }
});
console.log(totalprice)

return res.status(200).json({message:'this produt add in your cart',AdProduct})

} catch (error) {
    console.log(error)
    return res.status(500).json({message:'go and find error and solve use our mind if you have',error})
}
    
}
const deleteApi=async (req,res) => {
    try {
        
        const{userId,categoryId}=req.body
        const find=await user.findOne({_id:userId,role:'Administrator'})
        if(!find){
            return res.status(500).json({message:'plz enter a correct user'})

        }
        const findCategory=await category.deleteOne({_id:categoryId})
        if(findCategory){
            const findProduct=await product.deleteMany({category:categoryId})
            console.log(findProduct)
            res .status(200).json({message:"category and their product delete"})
        }

        res .status(200).json({message:"user find"})
    }


     catch (error) {
        console.log(error)
        return res.status(200).json({message:'go find erroe',error})
    }
}
  const updateCategory=async (req,res) => {
    try {
        
        const{userId,categoryId}=req.body
        const find=await user.findOne({_id:userId,role:'Administrator'})
        if(!find){
            return res.status(500).json({message:'plz enter a correct user'})

        }
        const update_Category=await category.findOneAndUpdate({_id:categoryId})
        
        res .status(200).json({message:"user find"})
    }


     catch (error) {
        console.log(error)
        return res.status(200).json({message:'go find erroe',error})
    }
}
const productMinseInAdToCart=async (req,res) => {
    try {
        const {productId,quantity,isdelete}=req.body
        const find=await adCart.findOne({productId:productId})
        if(isdelete){
            console.log("jhjhgguy")
            const dlt=await adCart.deleteOne({productId:productId})
            return res.status(500).json({message:'you remove a quantity in your cart',dlt})
        }
    if(find&&find.quantity>0){
        find.quantity-=quantity
        await find.save()
        const findProduct=await product.findOne({_id:productId})
        findProduct.Quantity+=quantity
        await findProduct.save()
        return res.status(500).json({message:'you remove a quantity in your cart',find})
    }


        
        return res.status(500).json({message:'this product not exist in your cart',find})
    } catch (error) {
        console.log(error)
        return res.status(500).json({message:'go and find error',error})
    }
}
const deleteProductInAdToCard=async (req,res) => {
    try {
        const productId=req.body
        const find= await adCart.deleteOne({productId:productId})
        return res.status(200).json({message:'product has been delete',find})
    } catch (err) {
        console.log(err)
        return res.status(500).json({message:'go find and error'})
    }
    
}

const softDelete=async (req,res) => {
    try {
        const {update,productId,categoryId}=req.body
        if(categoryId){
            const findFalseCategory=await category.findOneAndUpdate({_id:categoryId},{$set:{SoftDelete:update}},{new:true})
            return res.status(200).json({message:'find a category has soft delete',findFalseCategory})
        }
       
        //return res.status(200).json({message:'find a category whose has delete value',findFalseCategory})
        else if(productId){
            const findFalseProduct=await product.findOneAndUpdate({_id:productId},{$set:{softDelete:update}},{new:true})
            return res.status(200).json({message:'find a product has soft delete',findFalseProduct}) 
        }
       return res.status(500).json({message:'please must enter Id'})
    } catch (error) {
        console.log(error)
        return res.status(500).json({message:'go and find error',error})
    }
}

// const payment=async (req,res) => {
//     try {
//         const session = await stripe.checkout.sessions.create({
//             line_items: [
//               {
//                 price: '{{RECURRING_PRICE_ID}}',
//                 quantity: 1,
//               },
//               {
//                 price: '{{ONE_TIME_PRICE_ID}}',
//                 quantity: 1,
//               },
//             ],
//             mode: 'subscription',
//             success_url: 'https://example.com/success',
//             cancel_url: 'https://example.com/cancel',
//           });
//     } catch (error) {
//         console.log(error)
//         return res.status(500).json({message:"go and find error",error})
//     }
// }
export {signUpUser,logIn,Sales,softDelete,createCategory,productCreate,createOrder,AdtoCart,deleteApi,updateCategory,productMinseInAdToCart,deleteProductInAdToCard}
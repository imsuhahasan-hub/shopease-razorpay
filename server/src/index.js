import "dotenv/config";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import Razorpay from "razorpay";

const app=express();
app.use(cors({origin:process.env.CLIENT_URL||"http://localhost:5173"}));
app.use(express.json());
const User=mongoose.model("User",new mongoose.Schema({name:String,email:{type:String,unique:true},password:String},{timestamps:true}));
const Product=mongoose.model("Product",new mongoose.Schema({name:String,description:String,category:String,price:Number,image:String,stock:Number},{timestamps:true}));
const Order=mongoose.model("Order",new mongoose.Schema({user:mongoose.Schema.Types.ObjectId,items:Array,amount:Number,status:{type:String,default:"created"},razorpayOrderId:String,razorpayPaymentId:String},{timestamps:true}));
const rzp=()=>new Razorpay({key_id:process.env.RAZORPAY_KEY_ID,key_secret:process.env.RAZORPAY_KEY_SECRET});
const tokenFor=u=>jwt.sign({id:u._id},process.env.JWT_SECRET,{expiresIn:"7d"});
async function auth(req,res,next){try{const t=(req.headers.authorization||"").replace(/^Bearer /,"");req.user=jwt.verify(t,process.env.JWT_SECRET);next()}catch{return res.status(401).json({message:"Please log in."})}}

app.get("/api/health",(_,res)=>res.json({status:"ok"}));
app.post("/api/auth/register",async(req,res)=>{try{const {name,email,password}=req.body;if(!name||!email||!password||password.length<6)return res.status(400).json({message:"Enter all details; password needs 6 characters."});const e=email.toLowerCase();if(await User.findOne({email:e}))return res.status(409).json({message:"Email already registered."});const u=await User.create({name,email:e,password:await bcrypt.hash(password,12)});res.status(201).json({token:tokenFor(u),user:{name:u.name,email:u.email}})}catch{res.status(500).json({message:"Registration failed."})}});
app.post("/api/auth/login",async(req,res)=>{const u=await User.findOne({email:(req.body.email||"").toLowerCase()});if(!u||!await bcrypt.compare(req.body.password||"",u.password))return res.status(401).json({message:"Invalid email or password."});res.json({token:tokenFor(u),user:{name:u.name,email:u.email}})});
app.get("/api/products",async(req,res)=>{const f={};if(req.query.category&&req.query.category!=="All")f.category=req.query.category;if(req.query.search)f.name={$regex:req.query.search,$options:"i"};res.json(await Product.find(f))});
app.post("/api/orders/create",auth,async(req,res)=>{try{if(!process.env.RAZORPAY_KEY_ID||!process.env.RAZORPAY_KEY_SECRET)return res.status(503).json({message:"Add Razorpay test keys in server/.env"});if(!Array.isArray(req.body.items)||!req.body.items.length)return res.status(400).json({message:"Cart is empty."});const items=[];for(const x of req.body.items){const p=await Product.findById(x.productId);const q=Math.max(1,Math.min(10,Number(x.quantity)||1));if(!p||p.stock<q)return res.status(400).json({message:"Product unavailable or insufficient stock."});items.push({productId:p._id,name:p.name,price:p.price,quantity:q,image:p.image})}const amount=items.reduce((s,x)=>s+x.price*x.quantity,0);const rp=await rzp().orders.create({amount:Math.round(amount*100),currency:"INR",receipt:"shop_"+Date.now()});await Order.create({user:req.user.id,items,amount,razorpayOrderId:rp.id});res.json({key:process.env.RAZORPAY_KEY_ID,orderId:rp.id,amount:rp.amount,currency:rp.currency})}catch(e){res.status(500).json({message:e.message})}});
app.post("/api/orders/verify",auth,async(req,res)=>{const {razorpay_order_id,razorpay_payment_id,razorpay_signature}=req.body;const order=await Order.findOne({user:req.user.id,razorpayOrderId:razorpay_order_id});if(!order)return res.status(404).json({message:"Order not found."});const expected=crypto.createHmac("sha256",process.env.RAZORPAY_KEY_SECRET).update(razorpay_order_id+"|"+razorpay_payment_id).digest("hex");if(expected!==razorpay_signature)return res.status(400).json({message:"Payment verification failed."});order.status="paid";order.razorpayPaymentId=razorpay_payment_id;await order.save();for(const i of order.items)await Product.updateOne({_id:i.productId},{$inc:{stock:-i.quantity}});res.json({message:"Payment verified",order})});
app.get("/api/orders/my",auth,async(req,res)=>res.json(await Order.find({user:req.user.id}).sort({createdAt:-1})));
await mongoose.connect(process.env.MONGO_URI);app.listen(process.env.PORT||5000,()=>console.log("API running on port "+(process.env.PORT||5000)));

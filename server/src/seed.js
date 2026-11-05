import "dotenv/config";import mongoose from "mongoose";
const Product=mongoose.model("Product",new mongoose.Schema({name:String,description:String,category:String,price:Number,image:String,stock:Number}));
await mongoose.connect(process.env.MONGO_URI);await Product.deleteMany({});
await Product.insertMany([
{name:"Wireless Headphones",description:"Comfortable headphones with rich sound.",category:"Electronics",price:2499,image:"https://images.unsplash.com/photo-1505740420928-5e560c06d30e",stock:20},
{name:"Smart Watch",description:"A smart companion for everyday activity.",category:"Electronics",price:3299,image:"https://images.unsplash.com/photo-1523275335684-37898b6baf30",stock:15},
{name:"Everyday Backpack",description:"A practical backpack for work and college.",category:"Fashion",price:1499,image:"https://images.unsplash.com/photo-1553062407-98eeb64c6a62",stock:25},
{name:"Running Shoes",description:"Lightweight shoes for daily walks.",category:"Fashion",price:2199,image:"https://images.unsplash.com/photo-1542291026-7eec264c27ff",stock:20},
{name:"Coffee Maker",description:"A compact coffee maker for your kitchen.",category:"Home",price:2899,image:"https://images.unsplash.com/photo-1495474472287-4d71bcdd2085",stock:10},
{name:"Desk Lamp",description:"A modern lamp for your workspace.",category:"Home",price:999,image:"https://images.unsplash.com/photo-1507473885765-e6ed057f782c",stock:30}
]);console.log("Demo products inserted");await mongoose.disconnect();

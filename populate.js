import dotenv from "dotenv";
dotenv.config();

import { connectDB } from "./db/connect.js";
import { Product } from "./models/product.js";
import data from "./products.json" assert { type: "json" };

// console.log(data)

const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    await Product.deleteMany(); //delete all gibberish product that might be on there so that this can do a fresh populate
    await Product.create(data)
    console.log('Success...!');
    process.exit(0);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

start();
//all imports
import express from "express";
import 'express-async-errors';
import dotenv from "dotenv";
import { connectDB } from "./db/connect.js";
import { errorHandlerMiddleware } from "./middleware/error-handler.js";
import { notFound } from "./middleware/not-found.js";
import productRoute from './routes/products.js';

//setup dotenv
dotenv.config();

//all consts
const app = express();
const port = process.env.PORT;
const url = process.env.MONGO_URI;

//middlewares
app.use(express.json());

//routes
app.get('/', (req,res) => {
    res.send('<h1>Store API</h1><a href="/api/v1/products">products route</a>');
})

//products route
app.use('/api/v1/products',productRoute);

//custom middleware
app.use(notFound)
app.use(errorHandlerMiddleware);


const start = async () => {
  try {
    await connectDB(url);
    console.log("Connected to database successfully...!");
    app.listen(port, () => {
      console.log(`Server started on http://localhost:${port}`);
    });
  } catch (error) {
    console.log(error);
  }
};

start();

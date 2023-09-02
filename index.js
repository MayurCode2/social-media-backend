const express = require("express")
const  app = express();
const mongoose =require("mongoose");
const dotenv =require("dotenv");
const helmet=require("helmet");
const morgan = require("morgan");
dotenv.config();
const userRoute= require("./routes/user")
const authRoute = require("./routes/auth")
const postRoute = require("./routes/posts")
const { v2: cloudinary } = require("cloudinary");
const fileupload = require("express-fileupload");



mongoose
  .connect("mongodb+srv://mayur2205:QSQy7kF3IKONYfKm@cluster0.mxrkwzo.mongodb.net/social?retryWrites=true&w=majority", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("DB Connetion Successfull");
  })
  .catch((err) => {
    console.log(err.message);
  });

  cloudinary.config({ 
    cloud_name: 'du1sivwqb', 
    api_key: '195941781746291', 
    api_secret: 'guQ1GyduHXQJtuXpZ9ca3OFptzM' 
  });


//middleware  
app.use(express.json())
app.use(helmet())
app.use(morgan("common"))
 
  app.use("/api/users",userRoute)
  app.use("/api/auth",authRoute)
  app.use("/api/posts",postRoute)


app.listen(8000,()=>{
    console.log("server is start ")
})  
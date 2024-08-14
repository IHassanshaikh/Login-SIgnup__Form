const mongoose = require("mongoose");

mongoose.connect("mongodb://localhost:27017/Registeration").
then(()=>{
console.log("Connection Successful");
}).
catch((err)=>{
console.log(err);
})
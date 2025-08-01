const mongoose = require("mongoose");
require("dotenv").config();

async function connecttoDB() {
  try
   {
    await mongoose.connect(process.env.MONGO_URI, 
      {
    });
    console.log("DB CONNECTED");
  } catch (err)
   {
    console.error("CONNECTION ERROR", err);

  }
}

module.exports = connecttoDB;
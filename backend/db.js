const mongoose = require('mongoose');

const mongoURI = "mongodb://localhost:27017/inotebookDb";

const connectToMongo= async()=>{
    await mongoose.connect(mongoURI)
    console.log("Mongoose is connected");
    
}

module.exports = connectToMongo
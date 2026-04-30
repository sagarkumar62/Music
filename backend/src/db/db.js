import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MongoDB_URI = process.env.MONGO_URI

console.log(MongoDB_URI)

function connectToDatabase() {
    mongoose.connect(MongoDB_URI)
    .then(() => {
        console.log("Connected to MongoDB successfully");
    })
    .catch((error) => {
        console.error("Error connecting to MongoDB:", error);
    });
    
}

export default connectToDatabase;
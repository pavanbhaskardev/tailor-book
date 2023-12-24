import mongoose from "mongoose";

const connectMongoDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI!);
    console.log("connected to MongoDB");
  } catch (error) {
    console.log("connection failed to DB", error);
  }
};

export default connectMongoDB;

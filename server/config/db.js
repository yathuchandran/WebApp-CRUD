import mongoose from "mongoose";

const connectDB = async () => {
  const res = await mongoose.connect("mongodb+srv://yatheeshbc8:4P7aRthgJtBwPGh2@cluster0.sjvvmgl.mongodb.net/Web-App-React1");
  if (res) {
    console.log('Connected Successfully');
  }
}
export default connectDB;
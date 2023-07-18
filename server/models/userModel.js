import mongoose from "mongoose";
const userSchema = new mongoose.Schema({
  name: {
    type: String
  },
  email: {
    type: String
  },
  password: {
    type: String
  },
  image: {
    type: String     
  }
});

const userModel = mongoose.model('User', userSchema);
export default userModel;
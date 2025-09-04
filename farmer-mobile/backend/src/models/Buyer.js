import mongoose from "mongoose";

const buyerSchema = new mongoose.Schema({
  firstname: {
    type: String,
    required: true,
  },
  lastname: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  phonenumber: {
    type: String,
    required: true
  },
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  pickuplocation: {
    type: String,
    required: true,
  }
}, 
    { timestamps: true }
);



const Buyer = mongoose.model("Buyer", buyerSchema);

export default Buyer;

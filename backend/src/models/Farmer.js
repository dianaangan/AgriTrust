import mongoose, { mongo } from "mongoose";

const farmerSchema = new mongoose.Schema({
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
  password: {
    type: String,
    required: true,
  },
  farmname: {
    type: String,
    required: true,
  },
  farmlocation:{
    type: String,
    required: true,
  },
  pickuplocation:{
    type: String,
    required: true,
  },
  inquiryemail:{
    type: String,
    required: true,
  },
  profileimage: {
    type: String,
    required: true,
  },
  verified: {
    type: Boolean,
    default: false
  },
  cardNumber: {
    type: String,
    required: false,
  },
  cardExpiry: {
    type: String,
    required: false,
  },
  cardCVC: {
    type: String,
    required: false,
  },
  cardEmail: {
    type: String,
    required: false,
  },
  frontIdImage: {
    type: String,
    required: false,
  },
  backIdImage: {
    type: String,
    required: false,
  },
  passwordResetCode: {
    type: String,
    required: false,
  },
  passwordResetExpires: {
    type: Date,
    required: false,
  }
}, 
    { timestamps: true }
);

const Farmer = mongoose.model("Farmer", farmerSchema);

export default Farmer;

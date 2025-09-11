import mongoose from "mongoose";

const deliveryDriverSchema = new mongoose.Schema({
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
    unique: false,
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

  profileimage: {
    type: String,
    required: true,
  },
  licensefrontimage: {
    type: String,
    required: true,
  },
  licensebackimage: {
    type: String,
    required: true,
  },
  vehiclebrand: {
    type: String,
    required: true,
  },
  vehiclemodel: {
    type: String,
    required: true,
  },
  vehicleyearmanufacture: {
    type: String,
    required: true,
  },
  vehicletype: {
    type: String,
    required: true,
  },
  vehicleplatenumber: {
    type: String,
    required: true,
  },
  vehiclecolor: {
    type: String,
    required: true,
  },
  vehicleregistrationimage: {
    type: String,
    required: true,
  },
  vehiclefrontimage: {
    type: String,
    required: true,
  },
  vehiclebackimage: {
    type: String,
    required: true,
  },
  vehicleleftimage: {
    type: String,
    required: true,
  },
  vehiclerightimage: {
    type: String,
    required: true,
  },
  licenseplateimage: {
    type: String,
    required: true,
  },
  insuranceimage: {
    type: String,
    required: true,
  },
  phonecompatibility: {
    type: Boolean,
    default: false
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
  }
}, 
    { timestamps: true }
);


const DeliveryDriver = mongoose.model("DeliveryDriver", deliveryDriverSchema);

export default DeliveryDriver;

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import cloudinary from '../config/cloudinary.js';
import DeliveryDriver from '../models/DeliveryDriver.js';

export async function getAllDeliveryDrivers(req, res) {
  try {
    const deliveryDrivers = await DeliveryDriver.find({}).select('-password -cardNumber -cardCVC');
    
    if (!deliveryDrivers || deliveryDrivers.length === 0) {
      return res.status(404).json({ message: "No delivery drivers found" });
    }
    
    res.status(200).json({
      message: "Delivery drivers retrieved successfully",
      count: deliveryDrivers.length,
      deliveryDrivers: deliveryDrivers
    });
  } catch (error) {
    console.error('Error fetching delivery drivers:', error);
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function getDeliveryDriver(req, res) {
  try {
    const { id } = req.params;
    
    const deliveryDriver = await DeliveryDriver.findById(id).select('-password -cardNumber -cardCVC');
    
    if (!deliveryDriver) {
      return res.status(404).json({ error: "Delivery driver not found" });
    }
    
    res.status(200).json({
      message: "Delivery driver retrieved successfully",
      deliveryDriver: deliveryDriver
    });
    
  } catch (error) {
    console.error('Error fetching delivery driver:', error);
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function registerDeliveryDriver(req, res) {
  try {
    const { 
      firstname, lastname, email, phonenumber, username, password, 
      profileimage, licensefrontimage, 
      licensebackimage, vehiclebrand, vehiclemodel, vehicleyearmanufacture, 
      vehicletype, vehicleplatenumber, vehiclecolor, vehicleregistrationimage, 
      vehiclefrontimage, vehiclebackimage, vehicleleftimage, vehiclerightimage, 
      licenseplateimage, insuranceimage, phonecompatibility,
      cardNumber, cardExpiry, cardCVC, cardEmail
    } = req.body;
    
    // Validate required fields
    if (!firstname || !lastname || !email || !phonenumber || !username || !password || 
        !profileimage || !licensefrontimage || 
        !licensebackimage || !vehiclebrand || !vehiclemodel || !vehicleyearmanufacture || 
        !vehicletype || !vehicleplatenumber || !vehiclecolor || !vehicleregistrationimage || 
        !vehiclefrontimage || !vehiclebackimage || !vehicleleftimage || !vehiclerightimage || 
        !licenseplateimage || !insuranceimage) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Check if delivery driver already exists
    const existingDriver = await DeliveryDriver.findOne({ 
      $or: [{ email }, { username }] 
    });
    
    if (existingDriver) {
      return res.status(400).json({
        success: false,
        message: 'Delivery driver with this email or username already exists'
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Upload all images to Cloudinary
    const [
      profileUploadResponse,
      licenseFrontUploadResponse,
      licenseBackUploadResponse,
      vehicleRegUploadResponse,
      vehicleFrontUploadResponse,
      vehicleBackUploadResponse,
      vehicleLeftUploadResponse,
      vehicleRightUploadResponse,
      licensePlateUploadResponse,
      insuranceUploadResponse
    ] = await Promise.all([
      cloudinary.uploader.upload(profileimage),
      cloudinary.uploader.upload(licensefrontimage),
      cloudinary.uploader.upload(licensebackimage),
      cloudinary.uploader.upload(vehicleregistrationimage),
      cloudinary.uploader.upload(vehiclefrontimage),
      cloudinary.uploader.upload(vehiclebackimage),
      cloudinary.uploader.upload(vehicleleftimage),
      cloudinary.uploader.upload(vehiclerightimage),
      cloudinary.uploader.upload(licenseplateimage),
      cloudinary.uploader.upload(insuranceimage)
    ]);

    // Create new delivery driver
    const deliveryDriver = new DeliveryDriver({
      firstname,
      lastname,
      email,
      phonenumber,
      username,
      password: hashedPassword,

      profileimage: profileUploadResponse.secure_url,
      licensefrontimage: licenseFrontUploadResponse.secure_url,
      licensebackimage: licenseBackUploadResponse.secure_url,
      vehiclebrand,
      vehiclemodel,
      vehicleyearmanufacture,
      vehicletype,
      vehicleplatenumber,
      vehiclecolor,
      vehicleregistrationimage: vehicleRegUploadResponse.secure_url,
      vehiclefrontimage: vehicleFrontUploadResponse.secure_url,
      vehiclebackimage: vehicleBackUploadResponse.secure_url,
      vehicleleftimage: vehicleLeftUploadResponse.secure_url,
      vehiclerightimage: vehicleRightUploadResponse.secure_url,
      licenseplateimage: licensePlateUploadResponse.secure_url,
      insuranceimage: insuranceUploadResponse.secure_url,
      phonecompatibility: phonecompatibility || false,
      cardNumber,
      cardExpiry,
      cardCVC,
      cardEmail
    });

    await deliveryDriver.save();

    // Generate token
    const token = jwt.sign(
      { deliveryDriverId: deliveryDriver._id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      message: 'Delivery driver registered successfully',
      data: {
        deliveryDriver: {
          id: deliveryDriver._id,
          email: deliveryDriver.email,
          username: deliveryDriver.username,
          firstname: deliveryDriver.firstname,
          lastname: deliveryDriver.lastname,
          verified: deliveryDriver.verified
        },
        token
      }
    });
  } catch (error) {
    console.error('Delivery driver registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
}

export async function loginDeliveryDriver(req, res) {
  try {
    const { email, password } = req.body;

    // Find delivery driver by email
    const deliveryDriver = await DeliveryDriver.findOne({ email });
    if (!deliveryDriver) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, deliveryDriver.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Generate token
    const token = jwt.sign(
      { deliveryDriverId: deliveryDriver._id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        deliveryDriver: {
          id: deliveryDriver._id,
          email: deliveryDriver.email,
          username: deliveryDriver.username,
          firstname: deliveryDriver.firstname,
          lastname: deliveryDriver.lastname,
          verified: deliveryDriver.verified
        },
        token
      }
    });
  } catch (error) {
    console.error('Delivery driver login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
}



export async function updateDeliveryDriver(req, res) {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    // Check if delivery driver exists
    const existingDeliveryDriver = await DeliveryDriver.findById(id);
    if (!existingDeliveryDriver) {
      return res.status(404).json({ error: "Delivery driver not found" });
    }
    
    // If password is being updated, hash it
    if (updateData.password) {
      const saltRounds = 10;
      updateData.password = await bcrypt.hash(updateData.password, saltRounds);
    }
    
    // Handle image updates if provided
    const imageFields = [
      'profileimage', 'licensefrontimage', 'licensebackimage', 
      'vehicleregistrationimage', 'vehiclefrontimage', 'vehiclebackimage', 
      'vehicleleftimage', 'vehiclerightimage', 'licenseplateimage', 'insuranceimage'
    ];
    
    for (const field of imageFields) {
      if (updateData[field] && updateData[field] !== existingDeliveryDriver[field]) {
        const uploadResponse = await cloudinary.uploader.upload(updateData[field]);
        updateData[field] = uploadResponse.secure_url;
      }
    }
    
    // Note: Card fields (cardNumber, cardExpiry, cardCVC, cardEmail) are handled automatically
    // In production, consider encrypting sensitive card data before storing
    
    // Update the delivery driver
    const updatedDeliveryDriver = await DeliveryDriver.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password -cardNumber -cardCVC'); // Exclude sensitive card data from response
    
    res.status(200).json({
      message: "Delivery driver updated successfully",
      deliveryDriver: updatedDeliveryDriver
    });
    
  } catch (error) {
    console.error('Error updating delivery driver:', error);
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function deleteDeliveryDriver(req, res) {
  try {
    const { id } = req.params;
    
    // Check if delivery driver exists
    const existingDeliveryDriver = await DeliveryDriver.findById(id);
    if (!existingDeliveryDriver) {
      return res.status(404).json({ error: "Delivery driver not found" });
    }
    
    // Delete the delivery driver from database
    await DeliveryDriver.findByIdAndDelete(id);
    
    res.status(200).json({ 
      message: `Delivery driver account with ID ${id} deleted successfully` 
    });
    
  } catch (error) {
    console.error('Error deleting delivery driver:', error);
    res.status(500).json({ error: "Internal server error" });
  }
}

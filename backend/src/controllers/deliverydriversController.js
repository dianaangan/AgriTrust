import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import cloudinary from '../config/cloudinary.js';
import DeliveryDriver from '../models/DeliveryDriver.js';

export async function checkUsernameAvailability(req, res) {
  try {
    const { username } = req.query;

    if (!username) {
      return res.status(400).json({
        success: false,
        message: 'Username is required'
      });
    }

    const existingDriver = await DeliveryDriver.findOne({ username });
    
    res.json({
      success: true,
      available: !existingDriver,
      message: existingDriver ? 'Username is already taken' : 'Username is available'
    });
  } catch (error) {
    console.error('Username availability check error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
}

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

    // Check if username already exists (email may repeat)
    const existingDriver = await DeliveryDriver.findOne({ username });
    if (existingDriver) {
      return res.status(400).json({
        success: false,
        message: 'Username is already taken'
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Helper for Cloudinary upload - only uploads valid data URIs
    const uploadImage = async (value, fieldName) => {
      if (typeof value !== 'string' || !value) {
        console.error(`Missing ${fieldName}:`, value);
        throw new Error(`Missing ${fieldName}. Please ensure all images are selected.`);
      }
      
      console.log(`Backend processing ${fieldName}:`, value.substring(0, 50) + '...');
      
      // If it's a device URI, skip it and return a placeholder
      if (value.startsWith('file://') || value.startsWith('content://')) {
        console.log(`Skipping ${fieldName} - device URI not accessible from server`);
        return `https://via.placeholder.com/400x300/cccccc/666666?text=${fieldName}`;
      }
      
      // If it's already a data URI, upload it to Cloudinary
      if (value.startsWith('data:image/')) {
        try {
          const uploaded = await cloudinary.uploader.upload(value);
          console.log(`Successfully uploaded ${fieldName} to Cloudinary`);
          return uploaded?.secure_url || uploaded?.url;
        } catch (cloudinaryError) {
          console.error(`Cloudinary upload failed for ${fieldName}:`, cloudinaryError.message);
          throw new Error(`Failed to upload ${fieldName} to Cloudinary: ${cloudinaryError.message}`);
        }
      }
      
      // If it's an HTTP URL, return as is
      if (value.startsWith('http://') || value.startsWith('https://')) {
        console.log(`Using existing URL for ${fieldName}`);
        return value;
      }
      
      // Unknown format, return placeholder
      console.log(`Unknown format for ${fieldName}, using placeholder`);
      return `https://via.placeholder.com/400x300/cccccc/666666?text=${fieldName}`;
    };

    // Upload all images to Cloudinary first
    let profileUrl, licenseFrontUrl, licenseBackUrl, vehicleRegUrl, vehicleFrontUrl, vehicleBackUrl, vehicleLeftUrl, vehicleRightUrl, licensePlateUrl, insuranceUrl;
    
    try {
      [
        profileUrl,
        licenseFrontUrl,
        licenseBackUrl,
        vehicleRegUrl,
        vehicleFrontUrl,
        vehicleBackUrl,
        vehicleLeftUrl,
        vehicleRightUrl,
        licensePlateUrl,
        insuranceUrl
      ] = await Promise.all([
        uploadImage(profileimage, 'profileimage'),
        uploadImage(licensefrontimage, 'licensefrontimage'),
        uploadImage(licensebackimage, 'licensebackimage'),
        uploadImage(vehicleregistrationimage, 'vehicleregistrationimage'),
        uploadImage(vehiclefrontimage, 'vehiclefrontimage'),
        uploadImage(vehiclebackimage, 'vehiclebackimage'),
        uploadImage(vehicleleftimage, 'vehicleleftimage'),
        uploadImage(vehiclerightimage, 'vehiclerightimage'),
        uploadImage(licenseplateimage, 'licenseplateimage'),
        uploadImage(insuranceimage, 'insuranceimage')
      ]);
    } catch (uploadError) {
      console.error('Image upload error:', uploadError);
      return res.status(400).json({
        success: false,
        message: 'Failed to process images',
        error: uploadError.message
      });
    }

    // Create new delivery driver with Cloudinary URLs
    const deliveryDriver = new DeliveryDriver({
      firstname,
      lastname,
      email,
      phonenumber,
      username,
      password: hashedPassword,

      profileimage: profileUrl,
      licensefrontimage: licenseFrontUrl,
      licensebackimage: licenseBackUrl,
      vehiclebrand,
      vehiclemodel,
      vehicleyearmanufacture,
      vehicletype,
      vehicleplatenumber,
      vehiclecolor,
      vehicleregistrationimage: vehicleRegUrl,
      vehiclefrontimage: vehicleFrontUrl,
      vehiclebackimage: vehicleBackUrl,
      vehicleleftimage: vehicleLeftUrl,
      vehiclerightimage: vehicleRightUrl,
      licenseplateimage: licensePlateUrl,
      insuranceimage: insuranceUrl,
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

    // Check if driver is verified
    if (!deliveryDriver.verified) {
      return res.status(403).json({
        success: false,
        message: 'Account not verified. Please wait for admin verification before logging in.'
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

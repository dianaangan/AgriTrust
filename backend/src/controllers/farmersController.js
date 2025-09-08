import Farmer from '../models/Farmer.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Check if username is available
export async function checkUsernameAvailability(req, res) {
  try {
    const { username } = req.query;

    if (!username) {
      return res.status(400).json({
        success: false,
        message: 'Username is required'
      });
    }

    // Check if username exists
    const existingFarmer = await Farmer.findOne({ username });
    
    if (existingFarmer) {
      return res.json({
        success: false,
        available: false,
        message: 'Username is already taken'
      });
    }

    return res.json({
      success: true,
      available: true,
      message: 'Username is available'
    });
  } catch (error) {
    console.error('Username check error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
}

// Register farmer
export async function registerFarmer(req, res) {
  try {
    const {
      firstname, lastname, email, phonenumber, username, password,
      farmname, farmlocation, pickuplocation, inquiryemail, profileimage,
      businessdescription, cardNumber, cardExpiry, cardCVC, cardEmail,
      frontIdImage, backIdImage
    } = req.body;

    // Validate required fields
    if (!firstname || !lastname || !email || !phonenumber || !username || !password ||
        !farmname || !farmlocation || !pickuplocation || !inquiryemail || !profileimage ||
        !businessdescription) {
      return res.status(400).json({
        success: false,
        message: 'All required fields must be provided'
      });
    }

    // Check if username already exists
    const existingFarmer = await Farmer.findOne({ username });
    
    if (existingFarmer) {
      return res.status(400).json({
        success: false,
        message: 'Username is already taken'
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new farmer
    const farmer = new Farmer({
      firstname,
      lastname,
      email,
      phonenumber,
      username,
      password: hashedPassword,
      farmname,
      farmlocation,
      pickuplocation,
      inquiryemail,
      profileimage,
      businessdescription,
      cardNumber,
      cardExpiry,
      cardCVC,
      cardEmail,
      frontIdImage,
      backIdImage
    });

    await farmer.save();

    // Generate token
    const token = jwt.sign(
      { farmerId: farmer._id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      message: 'Farmer registered successfully',
      data: {
        farmer: {
          id: farmer._id,
          email: farmer.email,
          username: farmer.username,
          firstname: farmer.firstname,
          lastname: farmer.lastname,
          verified: farmer.verified
        },
        token
      }
    });
  } catch (error) {
    console.error('Farmer registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
}

// Login farmer
export async function loginFarmer(req, res) {
  try {
    const { username, password } = req.body;

    // Find farmer by username
    const farmer = await Farmer.findOne({ username });
    if (!farmer) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, farmer.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if farmer is verified
    if (!farmer.verified) {
      return res.status(403).json({
        success: false,
        message: 'Account not verified. Please wait for admin verification before logging in.'
      });
    }

    // Generate token
    const token = jwt.sign(
      { farmerId: farmer._id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        farmer: {
          id: farmer._id,
          email: farmer.email,
          username: farmer.username,
          firstname: farmer.firstname,
          lastname: farmer.lastname,
          verified: farmer.verified
        },
        token
      }
    });
  } catch (error) {
    console.error('Farmer login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
}

// Get all farmers
export async function getAllFarmers(req, res) {
  try {
    const farmers = await Farmer.find().select('-password');
    
    res.json({
      success: true,
      data: { farmers }
    });
  } catch (error) {
    console.error('Get all farmers error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
}

// Get farmer by ID
export async function getFarmer(req, res) {
  try {
    const { id } = req.params;
    const farmer = await Farmer.findById(id).select('-password');
    
    if (!farmer) {
      return res.status(404).json({
        success: false,
        message: 'Farmer not found'
      });
    }

    res.json({
      success: true,
      data: { farmer }
    });
  } catch (error) {
    console.error('Get farmer error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
}

// Update farmer
export async function updateFarmer(req, res) {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    // Remove password from update data if present
    delete updateData.password;
    
    const farmer = await Farmer.findByIdAndUpdate(
      id, 
      updateData, 
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!farmer) {
      return res.status(404).json({
        success: false,
        message: 'Farmer not found'
      });
    }

    res.json({
      success: true,
      message: 'Farmer updated successfully',
      data: { farmer }
    });
  } catch (error) {
    console.error('Update farmer error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
}

// Delete farmer
export async function deleteFarmer(req, res) {
  try {
    const { id } = req.params;
    
    const farmer = await Farmer.findByIdAndDelete(id);
    
    if (!farmer) {
      return res.status(404).json({
        success: false,
        message: 'Farmer not found'
      });
    }

    res.json({
      success: true,
      message: 'Farmer deleted successfully'
    });
  } catch (error) {
    console.error('Delete farmer error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
}

// Verify farmer
export async function verifyFarmer(req, res) {
  try {
    const { id } = req.params;
    
    const farmer = await Farmer.findByIdAndUpdate(
      id, 
      { verified: true }, 
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!farmer) {
      return res.status(404).json({
        success: false,
        message: 'Farmer not found'
      });
    }

    res.json({
      success: true,
      message: 'Farmer verified successfully',
      data: { farmer }
    });
  } catch (error) {
    console.error('Verify farmer error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
}

// Unverify farmer
export async function unverifyFarmer(req, res) {
  try {
    const { id } = req.params;
    
    const farmer = await Farmer.findByIdAndUpdate(
      id, 
      { verified: false }, 
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!farmer) {
      return res.status(404).json({
        success: false,
        message: 'Farmer not found'
      });
    }

    res.json({
      success: true,
      message: 'Farmer unverified successfully',
      data: { farmer }
    });
  } catch (error) {
    console.error('Unverify farmer error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
}
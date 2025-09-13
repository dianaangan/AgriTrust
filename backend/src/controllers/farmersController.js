import Farmer from '../models/Farmer.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import cloudinary from '../config/cloudinary.js';
import { sendPasswordResetEmail } from '../config/email.js';

// Username checks removed; email is the unique identifier

// Register farmer
export async function registerFarmer(req, res) {
  try {
    const {
      firstname, lastname, email, phonenumber, password,
      farmname, farmlocation, pickuplocation, inquiryemail, profileimage,
      businessdescription, cardNumber, cardExpiry, cardCVC, cardEmail,
      frontIdImage, backIdImage
    } = req.body;

    // Validate required fields
    if (!firstname || !lastname || !email || !phonenumber || !password ||
        !farmname || !farmlocation || !pickuplocation || !inquiryemail || !profileimage ||
        !businessdescription) {
      return res.status(400).json({
        success: false,
        message: 'All required fields must be provided'
      });
    }

    // Check if email already exists
    const existingByEmail = await Farmer.findOne({ email: email.toLowerCase() });
    if (existingByEmail) {
      return res.status(400).json({
        success: false,
        message: 'Email is already in use'
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Helper for Cloudinary upload from data URI or URL; reject device-local
    const uploadImage = async (value, fieldName) => {
      if (typeof value !== 'string' || !value) {
        throw new Error(`Missing ${fieldName}`);
      }
      const lower = value.toLowerCase();
      if (lower.startsWith('file:') || lower.startsWith('content:')) {
        throw new Error(`Invalid ${fieldName}: device-local URI provided`);
      }
      const uploaded = await cloudinary.uploader.upload(value);
      return uploaded?.secure_url || uploaded?.url;
    };

    // Upload all images to Cloudinary first
    const [
      profileUrl,
      frontIdUrl,
      backIdUrl
    ] = await Promise.all([
      uploadImage(profileimage, 'profileimage'),
      uploadImage(frontIdImage, 'frontIdImage'),
      uploadImage(backIdImage, 'backIdImage')
    ]);

    // Create new farmer with Cloudinary URLs
    const farmer = new Farmer({
      firstname,
      lastname,
      email: email.toLowerCase(),
      phonenumber,
      password: hashedPassword,
      farmname,
      farmlocation,
      pickuplocation,
      inquiryemail,
      profileimage: profileUrl,
      businessdescription,
      cardNumber,
      cardExpiry,
      cardCVC,
      cardEmail,
      frontIdImage: frontIdUrl,
      backIdImage: backIdUrl
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
    const { email, password } = req.body;

    // Find farmer by email
    const farmer = await Farmer.findOne({ email: (email || '').toLowerCase() });
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

// Request password reset
export async function requestPasswordReset(req, res) {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    // Find farmer by email
    const farmer = await Farmer.findOne({ email: email.toLowerCase() });
    if (!farmer) {
      return res.status(404).json({
        success: false,
        message: 'No account found with this email address'
      });
    }

    // Generate 6-digit reset code
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Set expiration time (10 minutes from now)
    const resetExpires = new Date(Date.now() + 10 * 60 * 1000);

    // Update farmer with reset code and expiration
    await Farmer.findByIdAndUpdate(farmer._id, {
      passwordResetCode: resetCode,
      passwordResetExpires: resetExpires
    });

    // Send email with reset code
    const emailSent = await sendPasswordResetEmail(email, resetCode);
    
    if (!emailSent) {
      return res.status(500).json({
        success: false,
        message: 'Failed to send reset code. Please try again.'
      });
    }

    res.json({
      success: true,
      message: 'Password reset code sent to your email'
    });
  } catch (error) {
    console.error('Request password reset error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
}

// Verify reset code
export async function verifyResetCode(req, res) {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({
        success: false,
        message: 'Email and code are required'
      });
    }

    // Find farmer by email
    const farmer = await Farmer.findOne({ email: email.toLowerCase() });
    if (!farmer) {
      return res.status(404).json({
        success: false,
        message: 'No account found with this email address'
      });
    }

    // Check if reset code exists and is not expired
    if (!farmer.passwordResetCode || !farmer.passwordResetExpires) {
      return res.status(400).json({
        success: false,
        message: 'No reset code found. Please request a new one.'
      });
    }

    if (new Date() > farmer.passwordResetExpires) {
      return res.status(400).json({
        success: false,
        message: 'Reset code has expired. Please request a new one.'
      });
    }

    // Verify the code
    if (farmer.passwordResetCode !== code) {
      return res.status(400).json({
        success: false,
        message: 'Invalid reset code'
      });
    }

    res.json({
      success: true,
      message: 'Reset code verified successfully'
    });
  } catch (error) {
    console.error('Verify reset code error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
}

// Reset password
export async function resetPassword(req, res) {
  try {
    const { email, code, newPassword } = req.body;

    if (!email || !code || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Email, code, and new password are required'
      });
    }

    // Find farmer by email
    const farmer = await Farmer.findOne({ email: email.toLowerCase() });
    if (!farmer) {
      return res.status(404).json({
        success: false,
        message: 'No account found with this email address'
      });
    }

    // Check if reset code exists and is not expired
    if (!farmer.passwordResetCode || !farmer.passwordResetExpires) {
      return res.status(400).json({
        success: false,
        message: 'No reset code found. Please request a new one.'
      });
    }

    if (new Date() > farmer.passwordResetExpires) {
      return res.status(400).json({
        success: false,
        message: 'Reset code has expired. Please request a new one.'
      });
    }

    // Verify the code
    if (farmer.passwordResetCode !== code) {
      return res.status(400).json({
        success: false,
        message: 'Invalid reset code'
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password and clear reset code
    await Farmer.findByIdAndUpdate(farmer._id, {
      password: hashedPassword,
      passwordResetCode: undefined,
      passwordResetExpires: undefined
    });

    res.json({
      success: true,
      message: 'Password reset successfully'
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
}

// Check if email exists
export async function checkEmail(req, res) {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    // Check if email exists in database
    const existingFarmer = await Farmer.findOne({ email: email.toLowerCase() });
    
    res.status(200).json({
      success: true,
      exists: !!existingFarmer
    });
  } catch (error) {
    console.error('Error checking email:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
}
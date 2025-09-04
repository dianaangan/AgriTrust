import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import cloudinary from '../config/cloudinary.js';
import Farmer from '../models/Farmer.js';

export async function getAllFarmers (req, res) {
  try {
    const farmers = await Farmer.find({}).select('-password -cardNumber -cardCVC');
    
    if (!farmers || farmers.length === 0) {
      return res.status(404).json({ message: "No farmers found" });
    }
    
    res.status(200).json({
      message: "Farmers retrieved successfully",
      count: farmers.length,
      farmers: farmers
    });
  } catch (error) {
    console.error('Error fetching farmers:', error);
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function getFarmer(req, res) {
  try {
    const { id } = req.params;
    
    const farmer = await Farmer.findById(id).select('-password -cardNumber -cardCVC');
    
    if (!farmer) {
      return res.status(404).json({ error: "Farmer not found" });
    }
    
    res.status(200).json({
      message: "Farmer retrieved successfully",
      farmer: farmer
    });
    
  } catch (error) {
    console.error('Error fetching farmer:', error);
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function registerFarmer(req, res) {
  try {


    const { 
      firstname, lastname, email, phonenumber, username, password, 
      farmname, farmlocation, pickuplocation, inquiryemail, profileimage, 
      cardNumber, cardExpiry, cardCVC, cardEmail,
      frontIdImage, backIdImage 
    } = req.body;
    
    // Validate required fields
    if (!firstname || !lastname || !email || !phonenumber || !username || !password || !farmname || !farmlocation || !pickuplocation || !inquiryemail || !profileimage) {

      return res.status(400).json({ 
        success: false,
        message: "All basic fields are required" 
      });
    }



    // Check if farmer already exists
    const existingFarmer = await Farmer.findOne({ 
      $or: [{ email }, { username }] 
    });
    
    if (existingFarmer) {
      return res.status(400).json({
        success: false,
        message: 'Farmer with this email or username already exists'
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Upload profile image to Cloudinary
    let imageUrl;
    try {

      
      // Check if Cloudinary is configured
      if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {

        return res.status(500).json({
          success: false,
          message: 'Image upload service not configured. Please contact administrator.'
        });
      }
      
      // Handle different image formats
      if (profileimage.startsWith('data:image/')) {
        // It's a base64 data URI - upload directly to Cloudinary

        const uploadResponse = await cloudinary.uploader.upload(profileimage, {
          resource_type: 'auto',
          folder: 'agritrust/profile-images',
          public_id: `profile_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        });
        imageUrl = uploadResponse.secure_url;

      }
      // If it's already a URL, use it directly
      else if (profileimage.startsWith('http')) {
        imageUrl = profileimage;

      }
      // If it's a file URI, try to upload it directly to Cloudinary
      else if (profileimage.startsWith('file://') || profileimage.startsWith('content://')) {

        try {
          const uploadResponse = await cloudinary.uploader.upload(profileimage, {
            resource_type: 'auto',
            folder: 'agritrust/profile-images',
            public_id: `profile_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
          });
          imageUrl = uploadResponse.secure_url;
        } catch (fileUploadError) {
          imageUrl = 'https://via.placeholder.com/300x300?text=Profile+Image';
        }
      }
      // If it's other format, use placeholder
      else {
        imageUrl = 'https://via.placeholder.com/300x300?text=Profile+Image';
      }
    } catch (uploadError) {
      
      // Check if it's a Cloudinary configuration error
      if (uploadError.message.includes('Invalid cloud_name') || uploadError.message.includes('401')) {
        return res.status(500).json({
          success: false,
          message: 'Image upload service configuration error. Please check Cloudinary setup.'
        });
      }
      
      return res.status(400).json({
        success: false,
        message: 'Failed to upload profile image: ' + uploadError.message
      });
    }

    // Upload ID images to Cloudinary
    let frontIdImageUrl = null;
    let backIdImageUrl = null;
    
    if (frontIdImage) {
      try {

        
        // Handle different image formats for front ID
        if (frontIdImage.startsWith('data:image/')) {
          // It's a base64 data URI - upload directly to Cloudinary
          const frontUploadResponse = await cloudinary.uploader.upload(frontIdImage, {
            resource_type: 'auto',
            folder: 'agritrust/id-images',
            public_id: `front_id_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
          });
          frontIdImageUrl = frontUploadResponse.secure_url;

        } else if (frontIdImage.startsWith('http')) {
          frontIdImageUrl = frontIdImage;

        } else if (frontIdImage.startsWith('file://') || frontIdImage.startsWith('content://')) {

          try {
            const frontUploadResponse = await cloudinary.uploader.upload(frontIdImage, {
              resource_type: 'auto',
              folder: 'agritrust/id-images',
              public_id: `front_id_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
            });
            frontIdImageUrl = frontUploadResponse.secure_url;

          } catch (fileUploadError) {

            frontIdImageUrl = 'https://via.placeholder.com/300x300?text=Front+ID';
          }
        } else {

          frontIdImageUrl = 'https://via.placeholder.com/300x300?text=Front+ID';
        }
      } catch (uploadError) {
        console.error('Front ID image upload error:', uploadError);
        return res.status(400).json({
          success: false,
          message: 'Failed to upload front ID image: ' + uploadError.message
        });
      }
    }
    
    if (backIdImage) {
      try {

        
        // Handle different image formats for back ID
        if (backIdImage.startsWith('data:image/')) {
          // It's a base64 data URI - upload directly to Cloudinary
          const backUploadResponse = await cloudinary.uploader.upload(backIdImage, {
            resource_type: 'auto',
            folder: 'agritrust/id-images',
            public_id: `back_id_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
          });
          backIdImageUrl = backUploadResponse.secure_url;

        } else if (backIdImage.startsWith('http')) {
          backIdImageUrl = backIdImage;

        } else if (backIdImage.startsWith('file://') || backIdImage.startsWith('content://')) {

          try {
            const backUploadResponse = await cloudinary.uploader.upload(backIdImage, {
              resource_type: 'auto',
              folder: 'agritrust/id-images',
              public_id: `back_id_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
            });
            backIdImageUrl = backUploadResponse.secure_url;

          } catch (fileUploadError) {

            backIdImageUrl = 'https://via.placeholder.com/300x300?text=Back+ID';
          }
        } else {

          backIdImageUrl = 'https://via.placeholder.com/300x300?text=Back+ID';
        }
      } catch (uploadError) {
        console.error('Back ID image upload error:', uploadError);
        return res.status(400).json({
          success: false,
          message: 'Failed to upload back ID image: ' + uploadError.message
        });
      }
    }



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
      profileimage: imageUrl,
      cardNumber,
      cardExpiry,
      cardCVC,
      cardEmail,
      frontIdImage: frontIdImageUrl,
      backIdImage: backIdImageUrl,
    });

    // Save farmer to database
    try {
    await farmer.save();

    } catch (saveError) {

      return res.status(500).json({
        success: false,
        message: 'Failed to save farmer data',
        error: saveError.message
      });
    }

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
          lastname: farmer.lastname
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

export async function loginFarmer(req, res) {
  try {
    const { email, password } = req.body;

    // Find farmer by email
    const farmer = await Farmer.findOne({ email });
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
          lastname: farmer.lastname
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



export async function updateFarmer(req, res) {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    // Check if farmer exists
    const existingFarmer = await Farmer.findById(id);
    if (!existingFarmer) {
      return res.status(404).json({ error: "Farmer not found" });
    }
    
    // If password is being updated, hash it
    if (updateData.password) {
      const saltRounds = 10;
      updateData.password = await bcrypt.hash(updateData.password, saltRounds);
    }
    
    // If profile image is being updated, upload to Cloudinary
    if (updateData.profileimage && updateData.profileimage !== existingFarmer.profileimage) {
      const uploadResponse = await cloudinary.uploader.upload(updateData.profileimage);
      updateData.profileimage = uploadResponse.secure_url;
    }
    
    // Note: Card fields (cardNumber, cardExpiry, cardCVC, cardEmail) are handled automatically
    // In production, consider encrypting sensitive card data before storing
    
    // Update the farmer
    const updatedFarmer = await Farmer.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password -cardNumber -cardCVC'); // Exclude sensitive card data from response
    
    res.status(200).json({
      message: "Farmer updated successfully",
      farmer: updatedFarmer
    });
    
  } catch (error) {
    console.error('Error updating farmer:', error);
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function deleteFarmer(req, res) {
  try {
    const { id } = req.params;
    
    // Check if farmer exists
    const existingFarmer = await Farmer.findById(id);
    if (!existingFarmer) {
      return res.status(404).json({ error: "Farmer not found" });
    }
    
    // Delete the farmer from database
    await Farmer.findByIdAndDelete(id);
    
    res.status(200).json({ 
      message: `Farmer account with ID ${id} deleted successfully` 
    });
    
  } catch (error) {
    console.error('Error deleting farmer:', error);
    res.status(500).json({ error: "Internal server error" });
  }
}
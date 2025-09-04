import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Buyer from '../models/Buyer.js';

export async function getAllBuyers(req, res) {
  try {
    const buyers = await Buyer.find({}).select('-password');
    
    if (!buyers || buyers.length === 0) {
      return res.status(404).json({ message: "No buyers found" });
    }
    
    res.status(200).json({
      message: "Buyers retrieved successfully",
      count: buyers.length,
      buyers: buyers
    });
  } catch (error) {
    console.error('Error fetching buyers:', error);
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function getBuyer(req, res) {
  try {
    const { id } = req.params;
    
    const buyer = await Buyer.findById(id).select('-password');
    
    if (!buyer) {
      return res.status(404).json({ error: "Buyer not found" });
    }
    
    res.status(200).json({
      message: "Buyer retrieved successfully",
      buyer: buyer
    });
    
  } catch (error) {
    console.error('Error fetching buyer:', error);
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function registerBuyer(req, res) {
  try {
    const { firstname, lastname, email, phonenumber, pickuplocation, username, password } = req.body;
    
    // Validate required fields
    if (!firstname || !lastname || !email || !phonenumber || !pickuplocation || !username || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Check if buyer already exists
    const existingBuyer = await Buyer.findOne({ 
      $or: [{ email }, { username }] 
    });
    
    if (existingBuyer) {
      return res.status(400).json({
        success: false,
        message: 'Buyer with this email or username already exists'
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new buyer
    const buyer = new Buyer({
      firstname,
      lastname,
      email,
      phonenumber,
      pickuplocation,
      username,
      password: hashedPassword
    });

    await buyer.save();

    // Generate token
    const token = jwt.sign(
      { buyerId: buyer._id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      message: 'Buyer registered successfully',
      data: {
        buyer: {
          id: buyer._id,
          email: buyer.email,
          username: buyer.username,
          firstname: buyer.firstname,
          lastname: buyer.lastname,
          verified: buyer.verified
        },
        token
      }
    });
  } catch (error) {
    console.error('Buyer registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
}

export async function loginBuyer(req, res) {
  try {
    const { email, password } = req.body;

    // Find buyer by email
    const buyer = await Buyer.findOne({ email });
    if (!buyer) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, buyer.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Generate token
    const token = jwt.sign(
      { buyerId: buyer._id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        buyer: {
          id: buyer._id,
          email: buyer.email,
          username: buyer.username,
          firstname: buyer.firstname,
          lastname: buyer.lastname,
          verified: buyer.verified
        },
        token
      }
    });
  } catch (error) {
    console.error('Buyer login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
}



export async function updateBuyer(req, res) {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    // Check if buyer exists
    const existingBuyer = await Buyer.findById(id);
    if (!existingBuyer) {
      return res.status(404).json({ error: "Buyer not found" });
    }
    
    // If password is being updated, hash it
    if (updateData.password) {
      const saltRounds = 10;
      updateData.password = await bcrypt.hash(updateData.password, saltRounds);
    }
    
    // Update the buyer
    const updatedBuyer = await Buyer.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');
    
    res.status(200).json({
      message: "Buyer updated successfully",
      buyer: updatedBuyer
    });
    
  } catch (error) {
    console.error('Error updating buyer:', error);
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function deleteBuyer(req, res) {
  try {
    const { id } = req.params;
    
    // Check if buyer exists
    const existingBuyer = await Buyer.findById(id);
    if (!existingBuyer) {
      return res.status(404).json({ error: "Buyer not found" });
    }
    
    // Delete the buyer from database
    await Buyer.findByIdAndDelete(id);
    
    res.status(200).json({ 
      message: `Buyer account with ID ${id} deleted successfully` 
    });
    
  } catch (error) {
    console.error('Error deleting buyer:', error);
    res.status(500).json({ error: "Internal server error" });
  }
}

import jwt from "jsonwebtoken";
import Farmer from "../models/Farmer.js";
import Buyer from "../models/Buyer.js";
import DeliveryDriver from "../models/DeliveryDriver.js";

// Simple authentication middleware for farmers
export const protectFarmerRoute = async (req, res, next) => {
    try {
        //get token from header
        const token = req.header("Authorization").replace("Bearer ", "");
        if(!token) {
            return res.status(401).json({ message: "No token, authorization denied" });
        }

        //verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        //find user
        const farmer = await Farmer.findById(decoded.farmerId).select("-password");

        if(!farmer) {
            return res.status(401).json({ message: "User not found, authorization denied" });
        }

        req.farmer = farmer;
        next();

    } catch (error) {
        console.error("Authentication", error.message);
        res.status(401).json({ message: "Token is not valid" });
    }
};

// Simple authentication middleware for buyers
export const protectBuyerRoute = async (req, res, next) => {
    try {
        //get token from header
        const token = req.header("Authorization").replace("Bearer ", "");
        if(!token) {
            return res.status(401).json({ message: "No token, authorization denied" });
        }

        //verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        //find user
        const buyer = await Buyer.findById(decoded.buyerId).select("-password");

        if(!buyer) {
            return res.status(401).json({ message: "User not found, authorization denied" });
        }

        req.buyer = buyer;
        next();

    } catch (error) {
        console.error("Authentication", error.message);
        res.status(401).json({ message: "Token is not valid" });
    }
};

// Simple authentication middleware for delivery drivers
export const protectDeliveryDriverRoute = async (req, res, next) => {
    try {
        //get token from header
        const token = req.header("Authorization").replace("Bearer ", "");
        if(!token) {
            return res.status(401).json({ message: "No token, authorization denied" });
        }

        //verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        //find user
        const deliveryDriver = await DeliveryDriver.findById(decoded.deliveryDriverId).select("-password");

        if(!deliveryDriver) {
            return res.status(401).json({ message: "User not found, authorization denied" });
        }

        req.deliveryDriver = deliveryDriver;
        next();

    } catch (error) {
        console.error("Authentication", error.message);
        res.status(401).json({ message: "Token is not valid" });
    }
};
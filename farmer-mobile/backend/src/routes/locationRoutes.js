import express from "express";
import { 
  searchPlaces, 
  getAutocompleteSuggestions, 
  getPlaceDetails 
} from "../controllers/locationController.js";

const router = express.Router();

// Google Places API search endpoint
router.get("/search", searchPlaces);

// Google Places API autocomplete endpoint
router.get("/autocomplete", getAutocompleteSuggestions);

// Get place details by place_id
router.get("/details/:placeId", getPlaceDetails);

export default router;

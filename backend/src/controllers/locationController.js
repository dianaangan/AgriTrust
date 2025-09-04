import axios from "axios";

// Google Places API search endpoint
export const searchPlaces = async (req, res) => {
  try {
    const { query, type = "establishment" } = req.query;
    
    if (!query || query.trim().length < 2) {
      return res.status(400).json({ 
        success: false,
        error: "Query must be at least 2 characters long" 
      });
    }

    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ 
        success: false,
        error: "Google API key not configured" 
      });
    }

    // Google Places API endpoint for text search
    const url = `https://maps.googleapis.com/maps/api/place/textsearch/json`;
    const params = {
      query: query.trim(),
      key: apiKey,
      type: type,
      language: "en"
    };

    const response = await axios.get(url, { params });
    
    if (response.data.status === "OK") {
      const places = response.data.results.map(place => ({
        id: place.place_id,
        name: place.name,
        address: place.formatted_address,
        location: place.geometry?.location,
        types: place.types
      }));
      
      res.json({ 
        success: true,
        message: "Places retrieved successfully",
        places 
      });
    } else {
      res.status(400).json({ 
        success: false,
        error: "Failed to fetch places", 
        status: response.data.status 
      });
    }
  } catch (error) {
    console.error("Google Places API error:", error);
    res.status(500).json({ 
      success: false,
      error: "Internal server error" 
    });
  }
};

// Google Places API autocomplete endpoint
export const getAutocompleteSuggestions = async (req, res) => {
  try {
    const { input, type = "establishment" } = req.query;
    
    if (!input || input.trim().length < 2) {
      return res.status(400).json({ 
        success: false,
        error: "Input must be at least 2 characters long" 
      });
    }

    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ 
        success: false,
        error: "Google API key not configured" 
      });
    }

    // Google Places API endpoint for autocomplete
    const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json`;
    const params = {
      input: input.trim(),
      key: apiKey,
      types: type,
      language: "en"
    };

    const response = await axios.get(url, { params });
    
    if (response.data.status === "OK") {
      const predictions = response.data.predictions.map(prediction => ({
        id: prediction.place_id,
        description: prediction.description,
        structured_formatting: prediction.structured_formatting
      }));
      
      res.json({ 
        success: true,
        message: "Autocomplete suggestions retrieved successfully",
        predictions 
      });
    } else {
      res.status(400).json({ 
        success: false,
        error: "Failed to fetch autocomplete suggestions", 
        status: response.data.status 
      });
    }
  } catch (error) {
    console.error("Google Places Autocomplete API error:", error);
    res.status(500).json({ 
      success: false,
      error: "Internal server error" 
    });
  }
};

// Get place details by place_id
export const getPlaceDetails = async (req, res) => {
  try {
    const { placeId } = req.params;
    
    if (!placeId) {
      return res.status(400).json({ 
        success: false,
        error: "Place ID is required" 
      });
    }

    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ 
        success: false,
        error: "Google API key not configured" 
      });
    }

    // Google Places API endpoint for place details
    const url = `https://maps.googleapis.com/maps/api/place/details/json`;
    const params = {
      place_id: placeId,
      key: apiKey,
      fields: "place_id,name,formatted_address,geometry,types"
    };

    const response = await axios.get(url, { params });
    
    if (response.data.status === "OK") {
      const place = response.data.result;
      res.json({
        success: true,
        message: "Place details retrieved successfully",
        place: {
          id: place.place_id,
          name: place.name,
          address: place.formatted_address,
          location: place.geometry?.location,
          types: place.types
        }
      });
    } else {
      res.status(400).json({ 
        success: false,
        error: "Failed to fetch place details", 
        status: response.data.status 
      });
    }
  } catch (error) {
    console.error("Google Places Details API error:", error);
    res.status(500).json({ 
      success: false,
      error: "Internal server error" 
    });
  }
};

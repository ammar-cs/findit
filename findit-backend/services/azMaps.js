const axios = require('axios');

const geocodeAddress = async (address) => {
  try {
    const mapboxToken = process.env.MAPBOX_TOKEN;
    if (!mapboxToken) {
      console.error('MAPBOX_TOKEN not found in environment variables');
      return null;
    }

    const response = await axios.get(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json`, {
      params: {
        access_token: mapboxToken,
        limit: 1
      }
    });

    if (response.data && response.data.features && response.data.features.length > 0) {
      const result = response.data.features[0];
      const [lng, lat] = result.center;
      return {
        lat: parseFloat(lat),
        lng: parseFloat(lng)
      };
    }
    return null;
  } catch (error) {
    console.error('Mapbox geocoding error:', error.message);
    return null;
  }
};

module.exports = { geocodeAddress };

// Test function (commented out) - uncomment to test geocoding
/*
const testGeocoding = async () => {
  console.log('Testing Mapbox geocoding...');
  const result = await geocodeAddress('New York City');
  console.log('Result:', result);
};

testGeocoding();
*/

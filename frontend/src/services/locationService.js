import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: false, // Disable credentials for this API
  headers: { "Content-Type": "application/json" },
});

/**
 * Identify NYC neighborhood from coordinates using AI
 * @param {number} lat - Latitude coordinate
 * @param {number} lng - Longitude coordinate
 * @returns {Promise<{success: boolean, neighborhood?: string, error?: string}>}
 */
export const identifyNeighborhood = async (lat, lng) => {
  try {
    console.log(`Attempting to identify neighborhood for coordinates: [${lat}, ${lng}]`);
    
    const response = await api.get('/api/identify-neighborhood/', {
      params: { lat, lng },
      timeout: 10000 // 10 second timeout
    });

    console.log('API response:', response.data);

    if (response.data.status === 'success') {
      return {
        success: true,
        neighborhood: response.data.neighborhood,
        coordinates: response.data.coordinates
      };
    } else {
      return {
        success: false,
        error: response.data.message || 'Failed to identify neighborhood'
      };
    }
  } catch (error) {
    console.error('Error identifying neighborhood:', error);
    
    // If it's a network error, try a fallback approach
    if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
      console.log('Network error detected, trying fallback...');
      return await fallbackNeighborhoodDetection(lat, lng);
    }
    
    return {
      success: false,
      error: error.response?.data?.message || error.message || 'Network error occurred'
    };
  }
};

/**
 * Fallback neighborhood detection using simple coordinate mapping
 * @param {number} lat - Latitude coordinate
 * @param {number} lng - Longitude coordinate
 * @returns {Promise<{success: boolean, neighborhood?: string, error?: string}>}
 */
const fallbackNeighborhoodDetection = async (lat, lng) => {
  // Simple fallback based on coordinate ranges
  const neighborhoods = [
    { name: 'Times Square', latMin: 40.75, latMax: 40.77, lngMin: -73.99, lngMax: -73.98 },
    { name: 'Central Park', latMin: 40.76, latMax: 40.80, lngMin: -73.98, lngMax: -73.95 },
    { name: 'Battery Park City', latMin: 40.70, latMax: 40.72, lngMin: -74.02, lngMax: -74.00 },
    { name: 'Chelsea', latMin: 40.74, latMax: 40.76, lngMin: -74.01, lngMax: -73.99 },
    { name: 'Greenwich Village', latMin: 40.73, latMax: 40.74, lngMin: -74.01, lngMax: -73.99 },
    { name: 'SoHo', latMin: 40.72, latMax: 40.73, lngMin: -74.01, lngMax: -73.99 },
    { name: 'Financial District', latMin: 40.70, latMax: 40.72, lngMin: -74.02, lngMax: -74.00 },
    { name: 'Upper East Side', latMin: 40.77, latMax: 40.80, lngMin: -73.96, lngMax: -73.93 },
    { name: 'Upper West Side', latMin: 40.78, latMax: 40.80, lngMin: -73.98, lngMax: -73.95 },
    { name: 'Harlem', latMin: 40.80, latMax: 40.82, lngMin: -73.95, lngMax: -73.93 }
  ];

  for (const neighborhood of neighborhoods) {
    if (lat >= neighborhood.latMin && lat <= neighborhood.latMax &&
        lng >= neighborhood.lngMin && lng <= neighborhood.lngMax) {
      return {
        success: true,
        neighborhood: neighborhood.name,
        coordinates: { lat, lng }
      };
    }
  }

  return {
    success: false,
    error: 'Unable to determine neighborhood from coordinates'
  };
};

/**
 * Test the neighborhood identification with sample coordinates
 */
export const testNeighborhoodIdentification = async () => {
  const testCoordinates = [
    { lat: 40.7580, lng: -73.9855, expected: 'Times Square' },
    { lat: 40.763272, lng: -73.979352, expected: 'Central Park' },
    { lat: 40.70390676017579, lng: -74.01372957903186, expected: 'Battery Park City' }
  ];

  console.log('Testing neighborhood identification...');
  
  for (const coord of testCoordinates) {
    const result = await identifyNeighborhood(coord.lat, coord.lng);
    console.log(`Coordinates: [${coord.lat}, ${coord.lng}]`);
    console.log(`Expected: ${coord.expected}`);
    console.log(`Result: ${result.success ? result.neighborhood : result.error}`);
    console.log('---');
  }
};

export default api;

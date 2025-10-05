import { client } from '../Supabase/client';

// Get closest hydrants using PostGIS spatial query
export const getClosestHydrants = async (lat, lng, radiusMiles = 0.5) => {
  try {
    const radiusMeters = radiusMiles * 1609.34; // Convert miles to meters
    
    const { data, error } = await client.rpc('closest_hydrants', {
      user_lat: lat,
      user_lng: lng,
      radius_meters: radiusMeters
    });

    if (error) {
      console.error('Error fetching closest hydrants:', error);
      throw error;
    }

    return {
      success: true,
      data: data || [],
      count: data?.length || 0
    };
  } catch (error) {
    console.error('Error in getClosestHydrants:', error);
    return {
      success: false,
      error: error.message,
      data: [],
      count: 0
    };
  }
};

// Get hydrants within map bounds (alternative approach)
export const getHydrantsInBounds = async (bounds) => {
  try {
    const { data, error } = await client
      .from('hydrants')
      .select('*')
      .gte('lat', bounds.south)
      .lte('lat', bounds.north)
      .gte('lon', bounds.west)
      .lte('lon', bounds.east);

    if (error) {
      console.error('Error fetching hydrants in bounds:', error);
      throw error;
    }

    return {
      success: true,
      data: data || [],
      count: data?.length || 0
    };
  } catch (error) {
    console.error('Error in getHydrantsInBounds:', error);
    return {
      success: false,
      error: error.message,
      data: [],
      count: 0
    };
  }
};

// Calculate distance between two points (frontend fallback)
export const calculateDistance = (lat1, lng1, lat2, lng2) => {
  const R = 3959; // Earth's radius in miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

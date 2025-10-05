// Badge API service for Django backend
const API_BASE_URL = 'http://localhost:8000/api/badges';

/**
 * Add points to a user and award badges at milestones
 * @param {string} userId - User ID
 * @param {number} points - Points to add
 * @param {number} latitude - User's latitude
 * @param {number} longitude - User's longitude
 * @returns {Promise} Response with new points and badges
 */
export const addPoints = async (userId, points, latitude, longitude) => {
  try {
    const response = await fetch(`${API_BASE_URL}/add-points`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_id: userId,
        points: points,
        latitude: latitude,
        longitude: longitude,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Points added successfully:', data);

    return {
      success: true,
      data: data,
    };
  } catch (error) {
    console.error('Error adding points:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Get user's badge progress
 * @param {string} userId - User ID
 * @returns {Promise} Progress data
 */
export const getBadgeProgress = async (userId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/badge-progress/${userId}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch progress: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      success: true,
      data: data,
    };
  } catch (error) {
    console.error('Error fetching badge progress:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Get all badges earned by a user
 * @param {string} userId - User ID
 * @returns {Promise} User badges
 */
export const getUserBadges = async (userId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/user-badges/${userId}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch badges: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      success: true,
      data: data,
    };
  } catch (error) {
    console.error('Error fetching user badges:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

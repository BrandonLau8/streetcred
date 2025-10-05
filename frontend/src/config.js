// API Configuration
// This file centralizes all API endpoint configurations
// Uses environment variables with fallback to localhost for development

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export { API_BASE_URL };

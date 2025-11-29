const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Get token from localStorage
const getToken = () => {
  return localStorage.getItem('token');
};

// API request helper
const apiRequest = async (endpoint, options = {}) => {
  try {
    const token = getToken();
    const headers = {
      ...options.headers,
    };

    // Add auth token if available
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // Don't set Content-Type for FormData (browser will set it with boundary)
    if (!(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    // Check if response is JSON
    const contentType = response.headers.get('content-type');
    let data;
    
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      const text = await response.text();
      throw new Error(text || 'Server error');
    }

    if (!response.ok) {
      throw new Error(data.message || 'Request failed');
    }

    return data;
  } catch (error) {
    // Handle network errors
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Cannot connect to server. Please make sure the backend is running.');
    }
    throw error;
  }
};

// Auth API
export const authAPI = {
  signup: async (name, email, password) => {
    return apiRequest('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });
  },

  login: async (email, password) => {
    return apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },
};

// Items API
export const itemsAPI = {
  getItems: async () => {
    return apiRequest('/items');
  },

  getAllItems: async () => {
    return apiRequest('/items/all');
  },

  addItem: async (formData) => {
    return apiRequest('/items/add', {
      method: 'POST',
      body: formData, // FormData with image file
    });
  },

  claimItem: async (itemId) => {
    return apiRequest(`/items/claim/${itemId}`, {
      method: 'PUT',
    });
  },

  approveItem: async (itemId) => {
    return apiRequest(`/items/approve/${itemId}`, {
      method: 'PUT',
    });
  },

  deleteItem: async (itemId) => {
    return apiRequest(`/items/delete/${itemId}`, {
      method: 'DELETE',
    });
  },
};

export default { authAPI, itemsAPI };

import axios from 'axios';

const API_BASE_URL = import.meta.env.PROD 
  ? '/api'
  : 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  }
});

export const saveEmailConfig = async (config) => {
  try {
    const { data } = await axios.post(`${API_BASE_URL}/email-config`, config);
    return data;
  } catch (error) {
    if (error.response) {
      throw error.response.data;
    }
    throw new Error('Network error occurred');
  }
};

export const getEmailLayout = async () => {
  try {
    const { data } = await axios.get(`${API_BASE_URL}/email-layout`);
    return data;
  } catch (error) {
    if (error.response) {
      throw error.response.data;
    }
    throw new Error('Failed to get email layout');
  }
};

export const uploadImage = async (formData) => {
  try {
    const { data } = await axios.post(`${API_BASE_URL}/upload-image`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      }
    });
    return data;
  } catch (error) {
    if (error.response) {
      throw error.response.data;
    }
    throw new Error('Failed to upload image');
  }
};

export const renderTemplate = async (config) => {
  try {
    const { data } = await axios.post(`${API_BASE_URL}/render-template`, config);
    return data;
  } catch (error) {
    if (error.response) {
      throw error.response.data;
    }
    throw new Error('Failed to render template');
  }
};

export default api;
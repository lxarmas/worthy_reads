import axios from 'axios';

// Use environment variables to determine the base URL
const baseURL = process.env.REACT_APP_API_URL || 'http://localhost:3000'; // Default to localhost in development

const api = axios.create({
  baseURL, // Use HTTPS if you're in production
  withCredentials: true, // Enable credentials for cross-origin requests
});

// Function to register a new user
export const registerUser = async (userData) => {
  try {
    const response = await api.post('/api/register', userData);
    return response.data;
  } catch (error) {
    console.error('Error registering user:', error);
    throw error;
  }
};

// Function to login a user
export const loginUser = async (userData) => {
  try {
    const response = await api.post('/api/login', userData);
    return response.data;
  } catch (error) {
    console.error('Error logging in:', error);
    throw error;
  }
};

// Function to fetch books for a specific user
export const fetchBooks = async (userId) => {
  try {
    const response = await api.get(`/api/books/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching books:', error);
    throw error;
  }
};

// Function to add a new book
export const addBook = async (bookData) => {
  try {
    const response = await api.post('/api/books', bookData);
    return response.data;
  } catch (error) {
    console.error('Error adding book:', error);
    throw error;
  }
};

// Function to delete a book
export const deleteBook = async (bookId) => {
  try {
    const response = await api.delete(`/api/books/${bookId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting book:', error);
    throw error;
  }
};

// Function to fetch books by category
export const fetchBooksByCategory = async (category) => {
  try {
    const response = await api.get(`/api/books/category/${encodeURIComponent(category)}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching books by category:', error);
    throw error;
  }
};
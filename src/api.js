import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3001', // Adjust the baseURL as per your backend server's URL
  withCredentials: true, // Include credentials with requests if needed
});

export const registerUser = async (userData) => {
  return await api.post('/api/register', userData);
};

export const loginUser = async (userData) => {
  return await api.post('/api/login', userData);
};

export const fetchBooks = async (userId) => {
  return await api.get(`/api/books/${userId}`);
};

export const addBook = async (bookData) => {
  return await api.post('/api/books', bookData);
};

export const deleteBook = async (bookId) => {
  return await api.delete(`/api/books/${bookId}`);
};


// api.js
import axios from 'axios';

const api = axios.create({
  baseURL:
    process.env.REACT_APP_API_URL ||
    (process.env.NODE_ENV === 'development'
      ? 'http://localhost:3000'
      : 'https://worthy-reads.onrender.com'), // 👈 add this
  withCredentials: true,
});


export const loginUser = async ({ email, password }) => {
  try {
    const res = await api.post('/api/login', { email, password });
    return res; // LogIn.js uses res.data.user.id
  } catch (error) {
    const apiError =
      error.response?.data?.error ||
      error.message ||
      'Login failed. Please try again.';
    throw new Error(apiError);
  }
};

export const registerUser = async (data) => {
  const res = await axios.post(
    'https://worthy-reads.onrender.com/api/register',
    {
      first_name: data.first_name,
      last_name: data.last_name,
      email: data.email,
      password: data.password,
    },
    { withCredentials: true }
  );
  return res;
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

export const fetchBooksByCategory = async (category) => {
  try {
    const response = await api.get(`/api/books/category/${encodeURIComponent(category)}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching books by category:', error);
    throw error;
  }
};

export const sendResetEmail = async (data) => {
  return await api.post('/api/forgot-password', data);
};

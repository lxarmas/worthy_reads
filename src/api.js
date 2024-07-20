import axios from 'axios';

const API_URL = 'http://localhost:3001/api'; // Assuming the backend server runs on the same origin or adjust accordingly

export const registerUser = async (data) => {
    return axios.post(`${API_URL}/register`, data);
};

export const loginUser = async (data) => {
    return axios.post(`${API_URL}/login`, data);
};

export const fetchBooks = async (userId) => {
    return axios.get(`${API_URL}/books`, { params: { userId } });
};

export const addBook = async (data) => {
    return axios.post(`${API_URL}/books`, data);
};

export const deleteBook = async (bookId) => {
    return axios.delete(`${API_URL}/books/${bookId}`);
};

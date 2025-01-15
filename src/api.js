

import axios from 'axios';

const api = axios.create( {
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3000', // Default to local during development
  withCredentials: true,
} );


export const registerUser = async ( userData ) => {
  return await api.post( '/api/register', userData );
};

export const loginUser = async ( userData ) => {
  return await api.post( '/api/login', userData );
};

export const fetchBooks = async ( userId ) => {
  return await api.get( `/api/books/${userId}` );
};

export const addBook = async ( bookData ) => {
  return await api.post( '/api/books', bookData );
};

export const deleteBook = async ( bookId ) => {
  return await api.delete( `/api/books/${bookId}` );
};

export const fetchBooksByCategory = async ( category ) => {
  try {
    const response = await api.get( `/api/books/category/${encodeURIComponent( category )}` );
    return response.data;
  } catch ( error ) {
    console.error( 'Error fetching books by category:', error );
    throw error;
  }
};

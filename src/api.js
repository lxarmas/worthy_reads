import axios from 'axios';

const api = axios.create({
  baseURL:
    process.env.REACT_APP_API_URL ||
    (process.env.NODE_ENV === 'development'
      ? ''
      : 'https://worthy-reads-1.onrender.com'),
  withCredentials: true,
});

export const loginUser = async ({ email, password }) => {
  try {
    const res = await api.post('/api/login', { email, password });
    return res;
  } catch (error) {
    const apiError =
      error.response?.data?.error ||
      error.message ||
      'Login failed. Please try again.';
    throw new Error(apiError);
  }
};

export const registerUser = async (data) => {
  try {
    const res = await api.post('/api/register', {
      first_name: data.first_name,
      last_name: data.last_name,
      email: data.email,
      password: data.password,
    });
    return res;
  } catch (error) {
    const apiError =
      error.response?.data?.error ||
      error.message ||
      'Registration failed. Please try again.';
    throw new Error(apiError);
  }
};

export const logoutUser = async () => {
  try {
    const res = await api.post('/api/logout');
    return res.data;
  } catch (error) {
    const apiError =
      error.response?.data?.error ||
      error.message ||
      'Logout failed.';
    throw new Error(apiError);
  }
};

export const fetchCurrentUser = async () => {
  try {
    const res = await api.get('/api/me');
    return res.data;
  } catch (error) {
    const apiError =
      error.response?.data?.error ||
      error.message ||
      'Failed to fetch current user.';
    throw new Error(apiError);
  }
};

export const fetchBooks = async (userId) => {
  try {
    const res = await api.get(`/api/books/${userId}`);
    return res.data;
  } catch (error) {
    const apiError =
      error.response?.data?.error ||
      error.message ||
      'Failed to fetch books.';
    throw new Error(apiError);
  }
};

export const fetchHomeBooks = async () => {
  try {
    const res = await api.get('/api/home-books');
    return res.data;
  } catch (error) {
    if (error.response?.status === 429) {
      throw new Error('rate_limit');
    }

    const apiError =
      error.response?.data?.error ||
      error.message ||
      'Failed to fetch home books.';
    throw new Error(apiError);
  }
};

export const addBook = async (bookData) => {
  try {
    const res = await api.post('/api/books', bookData);
    return res.data;
  } catch (error) {
    const apiError =
      error.response?.data?.error ||
      error.message ||
      'Failed to add book.';
    throw new Error(apiError);
  }
};

export const deleteBook = async (bookId) => {
  try {
    const res = await api.delete(`/api/books/${bookId}`);
    return res.data;
  } catch (error) {
    const apiError =
      error.response?.data?.error ||
      error.message ||
      'Failed to delete book.';
    throw new Error(apiError);
  }
};

export const updateBookRating = async (bookId, rating) => {
  try {
    const res = await api.put(`/api/books/${bookId}/rating`, { rating });
    return res.data;
  } catch (error) {
    const apiError =
      error.response?.data?.error ||
      error.message ||
      'Failed to update rating.';
    throw new Error(apiError);
  }
};

export const fetchBooksByCategory = async (category) => {
  try {
    const res = await api.get(
      `/api/books/category/${encodeURIComponent(category)}`
    );
    return res.data;
  } catch (error) {
    const apiError =
      error.response?.data?.error ||
      error.message ||
      'Failed to fetch books by category.';
    throw new Error(apiError);
  }
};

export const sendResetEmail = async (data) => {
  try {
    const res = await api.post('/api/forgot-password', data);
    return res.data;
  } catch (error) {
    const apiError =
      error.response?.data?.error ||
      error.message ||
      'Failed to send reset email.';
    throw new Error(apiError);
  }
};

// Friend APIs
export const searchUsers = async (query) => {
  try {
    const res = await api.get(
      `/api/users/search?q=${encodeURIComponent(query)}`
    );
    return res.data;
  } catch (error) {
    const apiError =
      error.response?.data?.error ||
      error.message ||
      'Failed to search users.';
    throw new Error(apiError);
  }
};
export const sendFriendRequestApi = async (receiverId) => {
  try {
    const res = await api.post('/api/friends/request', { receiverId });
    return res.data;
  } catch (error) {
    const apiError =
      error.response?.data?.error ||
      error.message ||
      'Failed to send friend request.';
    throw new Error(apiError);
  }
};

export const fetchFriends = async () => {
  try {
    const res = await api.get('/api/friends');
    return res.data;
  } catch (error) {
    const apiError =
      error.response?.data?.error ||
      error.message ||
      'Failed to fetch friends.';
    throw new Error(apiError);
  }
};


export const fetchPendingRequests = async () => {
  try {
    const res = await api.get('/api/friends/requests');
    return res.data;
  } catch (error) {
    const apiError =
      error.response?.data?.error ||
      error.message ||
      'Failed to fetch pending friend requests.';
    throw new Error(apiError);
  }
};

export const acceptFriendRequestApi = async (requestId) => {
  try {
    const res = await api.post(`/api/friends/accept/${requestId}`);
    return res.data;
  } catch (error) {
    const apiError =
      error.response?.data?.error ||
      error.message ||
      'Failed to accept friend request.';
    throw new Error(apiError);
  }
};

export const rejectFriendRequestApi = async (requestId) => {
  try {
    const res = await api.post(`/api/friends/reject/${requestId}`);
    return res.data;
  } catch (error) {
    const apiError =
      error.response?.data?.error ||
      error.message ||
      'Failed to reject friend request.';
    throw new Error(apiError);
  }
};

export default api;
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Nav from './components/Nav';

import HomePage from './components/HomePage';
import About from './components/About';
import Footer from './components/Footer';
import LogIn from './components/LogIn';
import Register from './components/Register';
import Books from './components/BooksPage';
import CategoryPage from './components/CategoryPage';
import ForgotPassword from './components/ForgotPassword';
import { fetchCurrentUser } from './api';

function App() {
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const data = await fetchCurrentUser();
        setUser(data.user || null);
      } catch (error) {
        setUser(null);
      } finally {
        setLoadingUser(false);
      }
    };

    loadUser();
  }, []);

  if (loadingUser) {
    return <div>Loading...</div>;
  }

  return (
    <Router>
      <Nav user={user} setUser={setUser} />

      <Routes>
        <Route path="/" element={<HomePage user={user} />} />
        <Route path="/about" element={<About />} />
        <Route path="/login" element={<LogIn setUser={setUser} />} />
        <Route path="/register" element={<Register setUser={setUser} />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/books" element={<Books user={user} />} />
        <Route path="/category/:categoryName" element={<CategoryPage user={user} />} />
      </Routes>

      <Footer />
    </Router>
  );
}

export default App;
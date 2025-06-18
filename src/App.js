import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Nav from './components/Nav';
import Header from './components/Header';
import HomePage from './components/HomePage';
import About from './components/About';
import Footer from './components/Footer';
import LogIn from './components/LogIn';
import Register from './components/Register';
import Books from './components/Books';
import CategoryPage from './components/CategoryPage';

function App() {
  return (
    <Router>
      <Nav />
      <Header />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path='/about' element={<About />} />
        <Route path='/login' element={<LogIn />} />
        <Route path='/register' element={<Register />} />
        <Route path='/books' element={<Books />} />
        <Route path='/category/:categoryName' element={<CategoryPage />} />
      </Routes>
      <Footer />
    </Router>
  );
}

export default App;

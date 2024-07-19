
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
 import Header from './components/Header';
import HomePage from './components/HomePage';
import About from './components/About';
import Footer from './components/Footer';
import LogIn from './components/LogIn';
import Register from './components/Register';
function App() {
  return (
     <Router>
      <Header/>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path='/about' element={<About />} />
        <Route path='/login' element={<LogIn />} />
        <Route path='/register' element={<Register />} />

      </Routes>
      <Footer/>
    </Router>
  );
}

export default App;

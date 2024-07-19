
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
 import Header from './Header';
 import Nav from './Nav';
import HomePage from './HomePage';
import About from './About';
import Footer from './Footer';
import LogIn from './LogIn';
import Register from './Register';


function Main() {
    return (
        <Router>
      <Header/>
      <Nav />
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

export default Main;

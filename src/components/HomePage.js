import './HomePage.css';
import Nav from './Nav';

function HomePage() {
  return (
    <main className="container mt-5">
      <Nav />
      <div className="jumbotron text-center p-5" style={{ background: 'linear-gradient(135deg, #2c7a6e, #3ba599)', color: 'white', borderRadius: '10px' }}>
        <div className="container">
          <div className="book-icon mb-4">
            <i className="fas fa-book fa-7x" style={{ color: '#ffffffb3', animation: 'bounce 2s infinite' }}></i>
          </div>
          <h1 className="display-4 font-weight-bold mb-3" style={{ fontFamily: 'Georgia, serif', letterSpacing: '2px' }}>Welcome to Worthy Reads</h1>
          <p className="lead mb-4" style={{ fontFamily: 'Arial, sans-serif' }}>
            Discover, share, and cherish the books you love most.
          </p>
          <hr className="my-4" style={{ borderColor: 'rgba(255, 255, 255, 0.6)' }} />
          <div className="row justify-content-center">
            <div className="col-md-4">
              <a
                className="btn btn-lg btn-block mb-2"
                href="/register"
                role="button"
                style={{
                  backgroundColor: '#ffffff',
                  color: '#2c7a6e',
                  border: '2px solid #ffffff',
                  fontWeight: 'bold',
                  borderRadius: '50px',
                }}
              >
                Get Started
              </a>
            </div>
            <div className="col-md-4">
              <a
                className="btn btn-lg btn-block"
                href="/login"
                role="button"
                style={{
                  backgroundColor: '#ffffff',
                  color: '#2c7a6e',
                  border: '2px solid #ffffff',
                  fontWeight: 'bold',
                  borderRadius: '50px',
                }}
              >
                Login
              </a>
            </div>
          </div>
        </div>
      </div>
      <div className="home-background" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: -1, backgroundImage: 'url("/path-to-your-background.jpg")', backgroundSize: 'cover', backgroundPosition: 'center', filter: 'brightness(0.8)' }}></div>
      <div className="intro-home mt-5 text-center p-4" style={{ backgroundColor: 'rgba(44, 122, 110, 0.8)', color: 'white', borderRadius: '10px', fontFamily: 'Georgia, serif', fontSize: '18px', lineHeight: '1.8' }}>
        <p>
          This page is dedicated to the books that you love most and want to have
          at your disposal. Our love for books inspired this website, offering a
          space to cherish the books that bring us pleasure, pain, and everything
          in between. If you're a book lover too, we invite you to be part of our
          Worthy Reads community—for free!
        </p>
      </div>
    </main>
  );
}

export default HomePage;

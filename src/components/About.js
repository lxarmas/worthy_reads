import React from 'react';
import { motion } from 'framer-motion';
import Nav from './Nav';

function About() {
  const quotes = [
    "A room without books is like a body without a soul. – Cicero",
    "So many books, so little time. – Frank Zappa",
    "A reader lives a thousand lives before he dies. – George R.R. Martin",
    "Books are a uniquely portable magic. – Stephen King",
  ];

  return (
    <div className="container mt-5" style={{ position: 'relative', overflow: 'hidden' }}>
      <Nav />
      <motion.div
        className="background-image"
        style={{
          backgroundImage: "url('/path/to/background.jpg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          height: '100vh',
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          zIndex: -1,
          filter: 'brightness(0.7)',
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      />
      <div className="row justify-content-center text-light" style={{ zIndex: 1 }}>
        <div className="col-md-8 text-center">
          <motion.h1
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="mb-4"
          >
            Welcome to Worthy Reads
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1 }}
          >
            This is a space dedicated to books that inspire, educate, and entertain.
            Join us in exploring the stories that shape our lives and connect us with the world.
          </motion.p>
          <motion.div
            className="d-flex justify-content-center gap-3 mt-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1.5 }}
          >
            <button
              className="btn btn-primary"
              onClick={() => window.location.href = '/books'}
            >
              Explore Books
            </button>

            <button
              className="btn btn-outline-light"
              onClick={() => window.location.href = '/register'}
            >
              Join the Community
            </button>

          </motion.div>
        </div>
      </div>
      <div className="row justify-content-center mt-5">
        <motion.div
          className="col-md-6 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 2 }}
        >
          <h5 className="text-light">Quotes We Love</h5>
          <div className="quote-slider">
            {quotes.map( ( quote, index ) => (
              <motion.p
                key={index}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5, delay: index * 2 }}
              >
                {quote}
              </motion.p>
            ) )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default About;

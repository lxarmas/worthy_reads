import React from 'react';
import { motion } from 'framer-motion';
import Nav from './Nav';
import { Row, Col, Card, Spinner, Alert } from 'react-bootstrap';
import './About.css'

function About() {
  const quotes = [
    "A room without books is like a body without a soul. – Cicero",
    "So many books, so little time. – Frank Zappa",
    "A reader lives a thousand lives before he dies. – George R.R. Martin",
    "Books are a uniquely portable magic. – Stephen King",
  ];

  return (
    <div style={{ overflowY: 'scroll', height: '100vh' }}>
      <Nav />
      <motion.div
        className="background-image"
        style={{
          backgroundImage: "url('/path/to/background.jpg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: -1,
          filter: 'brightness(0.7)',
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      />
      <div className="container mt-5 text-light" style={{ zIndex: 1 }}>
        <div className="row justify-content-center">
          <div className="col-md-8 text-center">
            <motion.h1
              initial={{ y: -70, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 1, delay: 0.5 }}
              className="mb-4"
            >
              ABOUT US
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
            <Row className="align-items-center justify-content-center my-4">
              <Col md={5} className="text-center">
                <img
                  src="/images/image.jpg"
                  alt="Your Name"
                  className="my-picture img-fluid rounded-circle"
                />
              </Col>
              <Col md={6} className="text-center">

                <p>
                  My love and Passion started from a true love for learning and the art of story telling
                </p>
                <blockquote className="testimonial">
                  "Our job is to pave a better future"
                </blockquote>
              </Col>
            </Row>
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
    </div>
  );
}

export default About;

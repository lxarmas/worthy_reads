import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Spinner, Alert, } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import Rating from './Rating';
import './HomePage.css';
import axios from 'axios';

function HomePage() {
  const [books, setBooks] = useState( [] );
  const [loading, setLoading] = useState( true );
  const [error, setError] = useState( null );

  useEffect( () => {
    const fetchBooks = async () => {
      try {
        const searchKeywords = ['new', 'bestsellers', 'fiction', 'history', 'science', 'fantasy', 'romance', 'computers'];
        const randomKeyword = searchKeywords[Math.floor( Math.random() * searchKeywords.length )];

        const response = await axios.get( 'https://www.googleapis.com/books/v1/volumes', {
          params: {
            q: randomKeyword,
            maxResults: 4,
          },
        } );

        setBooks( response.data.items || [] );
      } catch ( error ) {
        console.error( 'Error fetching books:', error );
        setError( 'Failed to fetch books. Please try again.' );
      } finally {
        setLoading( false );
      }
    };

    fetchBooks();
  }, [] );

  return (
    <main className="container mt-5">

      <div className="jumbotron text-center p-5 bg-light shadow">
        <div className="container">


          <Row className="align-items-center justify-content-center my-2">

            <h2 className="section-title text-primary  pb-5 fs-1">
              Welcome to Worthy Reads
            </h2>


            <Col md={6} className="text-center">
              <img
                src="/images/manreading.jpeg"
                alt="Your Name"
                className="img-fluid rounded shadow-lg"
              />
            </Col>
            <Col md={6} className="d-flex flex-column justify-content-center">
              <p className="lead gradient-lead  fst-italic fs-3">
                " Books have always been a source of inspiration and knowledge in my life.
                I wanted to create a space where readers can not only find their next great read
                but also connect with a community of like-minded individuals."
                <br />
                <strong className="text-primary pb-5">Alejandro Armas</strong>
              </p>

            </Col>
          </Row>


          <Row className="align-items-center justify-content-center my-4">
            <Col md={6}>
              <p className="lead graient-lead text-black fs-2">
                This site was created for the love of books. I hope you enjoy it and share it with family and friends.
              </p>
            </Col>
            <Col md={6}>
              <img
                src="/images/woman_reading.jpeg"
                alt="Woman Reading"
                className="img-fluid rounded shadow-sm"
              />
            </Col>
          </Row>

          <div className="features-section my-5">
            <h2 className="section-title text-primary pb-5 fs-1">Join the Club</h2>
            <Row className="text-center pb-5">
              <Col md={4}>
                <i className="fas fa-search feature-icon text-primary mb-3"></i>
                <h5 className='fw-bold text-white'>Search Books</h5>
                <p className="lead graient-lead fs-4">Find your favorite books by title or author.</p>
              </Col>
              <Col md={4}>
                <i className="fas fa-users feature-icon text-primary mb-3"></i>
                <h5 className='fw-bold text-white'>Community</h5>
                <p className="lead graient-lead fs-4">Connect with other book lovers and share reviews.</p>
              </Col>
              <Col md={4}>
                <i className="fas fa-bookmark feature-icon text-primary mb-3"></i>
                <h5 className='fw-bold text-white'>Bookmarks</h5>
                <p className="lead graient-lead fs-4">Save books to your personal collection.</p>
              </Col>
            </Row>
          </div>
        </div>
      </div>

      <div className="book-section row mt-4">
        {loading ? (
          <Col xs={12} className="text-center">
            <Spinner animation="border" variant="primary" />
            <p>Loading books...</p>
          </Col>
        ) : error ? (
          <Col xs={12} className="text-center">
            <Alert variant="danger">{error}</Alert>
          </Col>
        ) : (
          books.map( ( book, index ) => (
            <Col sm={6} md={4} lg={3} key={index} className="mb-3">
              <Card className="shadow-sm h-100">
                <Card.Body>
                  <Card.Img
                    variant="top"
                    src={
                      book.volumeInfo.imageLinks?.extraLarge ||
                      book.volumeInfo.imageLinks?.large ||
                      book.volumeInfo.imageLinks?.medium ||
                      book.volumeInfo.imageLinks?.thumbnail ||
                      'https://via.placeholder.com/300'
                    }
                    alt={book.volumeInfo.title}
                    className="img-fluid clickable-image mb-6"
                    onClick={() => book.volumeInfo.previewLink && window.open( book.volumeInfo.previewLink, '_blank' )}
                  />

                  <Card.Title>{book.volumeInfo.title}</Card.Title>
                  <Card.Subtitle className="text-muted">
                    By {book.volumeInfo.authors ? book.volumeInfo.authors.join( ', ' ) : 'Unknown'}
                  </Card.Subtitle>
                  <div className="rating-stars my-2">
                    <Rating initialRating={book.volumeInfo.averageRating || 0} />
                  </div>
                  {book.volumeInfo.categories && (
                    <div className="book-categories mt-2">
                      <strong>Categories: </strong>
                      {book.volumeInfo.categories.map( ( category, index ) => (
                        <React.Fragment key={category}>
                          <Link to={`/category/${category}`} className="text-info">
                            {category}
                          </Link>
                          {index < book.volumeInfo.categories.length - 1 && ', '}
                        </React.Fragment>
                      ) )}
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Col>
          ) )
        )}
      </div>

      <div className="testimonials-section my-5 text-center">
        <h2 className="section-title text-primary">What Readers Say</h2>
        <blockquote className="blockquote">
          <p>"Worthy Reads has completely transformed the way I find and organize my books."</p>
          <footer className="blockquote-footer">Noam Chomsky</footer>
        </blockquote>
        <blockquote className="blockquote">
          <p>"I love the community aspect! Sharing reviews is so easy."</p>
          <footer className="blockquote-footer">Barack Obama</footer>
        </blockquote>
      </div>
    </main>
  );
}

export default HomePage;

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Card, Container, Row, Col } from 'react-bootstrap';
import { fetchBooksByCategory } from '../api';
import Rating from './Rating';
import Nav from './Nav';
import BookDescription from './BookDescription';
import BookCount from './BookCount';
import './Books.css'; // Reuse the styles

const CategoryPage = () => {
  const { categoryName } = useParams();
  const [books, setBooks] = useState( [] );
  const [selectedBookId, setSelectedBookId] = useState( null );
 
  const navigate = useNavigate();

  useEffect( () => {
    const fetchBooks = async () => {
      try {
        const response = await fetchBooksByCategory( categoryName );
        setBooks( response );
      } catch ( error ) {
        console.error( 'Error fetching books:', error );
      }
    };

    if ( categoryName ) {
      fetchBooks();
    }
  }, [categoryName] );

  const toggleDescription = ( bookId ) => {
    setSelectedBookId( ( prevSelectedBookId ) =>
      prevSelectedBookId === bookId ? null : bookId
    );
  };

  return (
    <Container>
      <Nav />
      <h2 className="category-title">
        <BookCount count={bookCount || books.length} categoryName={categoryName} />

      </h2>
      <Button className="back-button mb-3" onClick={() => navigate( '/books' )}>
        Back to Books
      </Button>

      <Row>
        {books.map( ( book ) => (
          <Col sm={6} md={4} lg={3} key={book.book_id} className="mb-3">
            <Card className="book-container">
              <Card.Body className="card-body">
                <div className="book-info">
                  <div className="d-flex justify-content-between align-items-center">
                    <div className="title-author">
                      <Card.Title>{book.title}</Card.Title>
                      <Card.Subtitle className="author-name">
                        By {book.author}
                      </Card.Subtitle>
                    </div>
                    <Button
                      className="question-button"
                      onClick={() => toggleDescription( book.book_id )}
                      style={{ all: 'unset' }}
                    >
                      ?
                    </Button>
                  </div>

                  <img
                    srcSet={`
                      ${book.image_link}-small.jpg 500w,
                      ${book.image_link}-medium.jpg 1000w,
                      ${book.image_link}-large.jpg 1500w,
                      ${book.image_link}-xlarge.jpg 3000w
                    `}
                    sizes="(max-width: 600px) 500px, (max-width: 1200px) 1000px, 1500px"
                    src={`${book.image_link}-x-large.jpg`}
                    alt={book.title}
                    className="img-fluid clickable-image"
                    onClick={() =>
                      book.previewLink && window.open( book.previewLink, '_blank' )
                    }
                  />

                  <div className="rating-title-author">
                    <Rating
                      initialRating={book.rating || 0}
                      onChange={( rate ) => console.log( `Rated ${book.title}: ${rate}` )}
                    />
                  </div>

                  {selectedBookId === book.book_id && (
                    <div className="book-description-wrapper">
                      <BookDescription
                        description={book.description_book}
                        onClick={() => toggleDescription( book.book_id )}
                      />
                    </div>
                  )}
                </div>
              </Card.Body>
            </Card>
          </Col>
        ) )}
      </Row>
    </Container>
  );
};

export default CategoryPage;

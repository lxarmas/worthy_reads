import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Card, Container, Row, Col } from 'react-bootstrap';
import { fetchBooksByCategory } from '../api';
import Rating from './Rating';
import Nav from './Nav';
import BookCount from './BookCount';
import './Books.css';

const CategoryPage = () => {
  const { categoryName } = useParams();
  const [books, setBooks] = useState([]);
  const [selectedBookId, setSelectedBookId] = useState(null);
  const [bookCount, setBookCount] = useState(0);

  const navigate = useNavigate();

  useEffect(() => {
    const loadBooks = async () => {
      try {
        const response = await fetchBooksByCategory(categoryName);
        const data = Array.isArray(response) ? response : response.data || [];
        setBooks(data);
        setBookCount(data.length);
      } catch (error) {
        console.error('Error fetching books:', error);
      }
    };

    if (categoryName) {
      loadBooks();
    }
  }, [categoryName]);

  const toggleDescription = (bookId) => {
    setSelectedBookId((prevSelectedBookId) =>
      prevSelectedBookId === bookId ? null : bookId
    );
  };

  return (
    <Container>
      <Nav />
      <h2 className="category-title">
        <BookCount count={bookCount || books.length} categoryName={categoryName} />
      </h2>

      <Button className="back-button mb-3" onClick={() => navigate('/books')}>
        Back to Books
      </Button>

      <Row>
        {books.map((book) => (
          <Col sm={6} md={4} lg={3} key={book.id} className="mb-3">
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
                  </div>

                  <div className="rating-title-author mt-2">
                    <Rating
                      initialRating={book.rating || 0}
                      onChange={(rate) =>
                        console.log(`Rated ${book.title}: ${rate}`)
                      }
                    />
                  </div>

                  {book.category && (
                    <div className="book-categories mt-2">
                      <strong>Category: </strong>
                      {book.category}
                    </div>
                  )}

                  {selectedBookId === book.id && (
                    <div className="book-description-wrapper">
                      {/* description_book is not in current schema,
                          so you can add it later when the column exists */}
                      <p>No description available.</p>
                    </div>
                  )}

                  <div className="button-group mt-2">
                    <Button
                      className="custom-button custom-button-primary"
                      onClick={() => toggleDescription(book.id)}
                    >
                      {selectedBookId === book.id ? 'Hide' : 'Details'}
                    </Button>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
};

export default CategoryPage;

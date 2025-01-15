import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchBooksByCategory } from '../api';
import { Button } from 'react-bootstrap';
import './CategoryPage.css';
import Nav from './Nav';
import BookDescription from './BookDescription';

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
    <div className="category-page">
      <Nav />
      <h1 className="category-title">Books in "{categoryName}" Category</h1>

      {books && books.length > 0 ? (
        <div className="book-list">
          {books.map( ( book ) => (
            <div className="book-card-category" key={book.book_id}>
              <div className="book-card-header">
                <Button
                  className="question-button"
                  onClick={() => toggleDescription( book.book_id )}
                >
                  ?
                </Button>
                <h2 className="book-title">{book.title}</h2>
                <p className="book-author">by {book.author}</p>
              </div>
              <div className="book-card-content">
                <img
                  srcSet={`
        ${book.image_link}-small.jpg 500w,
        ${book.image_link}-medium.jpg 1000w,
        ${book.image_link}-large.jpg 1500w,
        ${book.image_link}-xlarge.jpg 3000w
      `}
                  sizes="(max-width: 600px) 500px, (max-width: 1200px) 1000px, 1500px"
                  src={`${book.image_link}-medium.jpg`}
                  alt={book.title}
                  className="book-image"
                  onClick={() => {
                    if ( book.previewLink ) window.open( book.previewLink, '_blank' );
                  }}
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

          ) )}
        </div>
      ) : (
        <p>No books found.</p>
      )}
      <button className="back-button" onClick={() => navigate( '/books' )}>
        Back to Books
      </button>
    </div>
  );
};

export default CategoryPage;

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchBooksByCategory } from '../api';
import './CategoryPage.css';

const CategoryPage = () => {
  const { categoryName } = useParams();
  const [books, setBooks] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const response = await fetchBooksByCategory(categoryName);
        setBooks(response);
      } catch (error) {
        console.error('Error fetching books:', error);
      }
    };

    if (categoryName) {
      fetchBooks();
    }
  }, [categoryName]);

  return (
    <div className="category-one">
      <h1>Books in "{categoryName}" Category</h1>
      {books && books.length > 0 ? (
        <div className="book-list">
          {books.map((book) => (
            <div className="book-card-category" key={book.id}>
              <h2 className="book-title">{book.title}</h2>
              <p className="book-author">by {book.author}</p>
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
                  console.log(book.previewLink);
                  if (book.previewLink) window.open(book.previewLink, '_blank');
                }}
                
              />
              <p className="book-description">{book.description}</p>
            </div>
          ))}
        </div>
      ) : (
        <p>No books found.</p>
      )}
      <button className="back-button" onClick={() => navigate('/books')}>Back to Books</button>
    </div>
  );
};

export default CategoryPage;

import React, { useEffect, useState } from 'react';



import { useParams } from 'react-router-dom';
import { fetchBooksByCategory } from '../api'; // Adjust path as necessary

function CategoryPage() {
  const { category } = useParams(); // Extract category from URL parameters
  const [books, setBooks] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (category) { // Ensure category is not undefined
      const getBooks = async () => {
        try {
          const response = await fetchBooksByCategory(category);
          setBooks(response.data);
        } catch (err) {
          console.error('Error fetching books by category:', err);
          setError('Failed to fetch books. Please try again.');
        }
      };

      getBooks();
    } else {
      setError('Category not specified.');
    }
  }, [category]);

  return (
    <div>
      <h1>Books in {category}</h1>
      {error && <p>{error}</p>}
      {books.length > 0 ? (
        <ul>
          {books.map((book) => (
            <li key={book.book_id}>
              <strong>{book.title}</strong> by {book.author}
            </li>
          ))}
        </ul>
      ) : (
        <p>No books found in this category.</p>
      )}
    </div>
  );
}

export default CategoryPage;


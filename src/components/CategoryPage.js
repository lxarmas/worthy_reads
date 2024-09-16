import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { fetchBooksByCategory } from '../api'; // Adjust the import path if necessary

const CategoryPage = () => {
  const { categoryName } = useParams();
  const [books, setBooks] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const booksData = await fetchBooksByCategory(categoryName);
        setBooks(booksData);
      } catch (err) {
        console.error('Error fetching books:', err);
        setError('Failed to fetch books. Please try again later.');
      }
    };

    if (categoryName) {
      fetchBooks();
    }
  }, [categoryName]);

  return (
    <div>
      <h1>Books in {categoryName} Category</h1>
      {error && <p>{error}</p>}
      {Array.isArray(books) && books.length > 0 ? (
        <ul>
          {books.map((book) => (
            <li key={book.id}>{book.title}</li>
          ))}
        </ul>
      ) : (
        <p>No books found.</p>
      )}
    </div>
  );
};

export default CategoryPage;

import React, { useState, useEffect } from 'react';
import {
  fetchCurrentUser,
  fetchBooks,
  addBook,
  deleteBook,
} from '../api';
import Rating from './Rating';
import BookCount from './BookCount';
import marbleImg from '../assets/marble.png';
import './Books.css';

const TRUNCATE_LENGTH = 140;

function BookDescription({ text }) {
  const [expanded, setExpanded] = useState(false);
  if (!text) return null;
  const isLong = text.length > TRUNCATE_LENGTH;

  return (
    <div className="bp-desc-wrap">
      <p className="bp-description">
        {expanded || !isLong ? text : text.slice(0, TRUNCATE_LENGTH) + '…'}
      </p>
      {isLong && (
        <button
          className="bp-desc-toggle"
          onClick={() => setExpanded((e) => !e)}
        >
          {expanded ? 'Show less ↑' : 'Read more ↓'}
        </button>
      )}
    </div>
  );
}

function Books() {
  const [books, setBooks] = useState([]);
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [userId, setUserId] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [bookCount, setBookCount] = useState(0);

  useEffect(() => {
    document.documentElement.style.setProperty(
      '--marble-bg',
      `url(${marbleImg})`
    );
  }, []);

  const normalizeBooks = (data) => {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.books)) return data.books;
    if (Array.isArray(data?.items)) return data.items;
    return [];
  };

  // Load current user (from session) and then books
  useEffect(() => {
    const loadUserAndBooks = async () => {
      try {
        setLoading(true);
        setError(null);

        // Prefer session-based user from API
        const me = await fetchCurrentUser();
        const currentUserId = me?.user?.id;

        if (!currentUserId) {
          setError('No user found. Please log in again.');
          setLoading(false);
          return;
        }

        setUserId(String(currentUserId));

        const booksData = await fetchBooks(currentUserId);
        const rows = normalizeBooks(booksData);
        setBooks(rows);
        setBookCount(rows.length);
      } catch (err) {
        console.error('Error loading user/books:', err.message);
        setError('Could not verify session or load books.');
        setBooks([]);
        setBookCount(0);
      } finally {
        setLoading(false);
      }
    };

    loadUserAndBooks();
  }, []);

  const handleAddBook = async (e) => {
    e.preventDefault();
    if (!userId) {
      setError('No user found. Please log in again.');
      return;
    }

    try {
      setAdding(true);
      setError(null);

      await addBook({ title, author, user_id: userId });

      const booksData = await fetchBooks(userId);
      const rows = normalizeBooks(booksData);
      setBooks(rows);
      setBookCount(rows.length);
      setTitle('');
      setAuthor('');
    } catch (err) {
      console.error('Add book error:', err.message);
      setError('Failed to add book.');
    } finally {
      setAdding(false);
    }
  };

  const handleDeleteBook = async (bookId) => {
    try {
      setError(null);
      const res = await deleteBook(bookId);

      if (res?.success || res?.bookCount !== undefined) {
        setBooks((prev) => prev.filter((b) => b.book_id !== bookId));
        if (typeof res.bookCount === 'number') {
          setBookCount(res.bookCount);
        } else {
          setBookCount((prev) => Math.max(prev - 1, 0));
        }
      }
    } catch (err) {
      console.error('Delete book error:', err.message);
      setError('Failed to delete book.');
    }
  };

  const handleRatingChange = (bookId, rate) => {
    setBooks((prev) =>
      prev.map((b) =>
        b.book_id === bookId ? { ...b, rating: rate } : b
      )
    );
  };

  return (
    <div className="bp-root">
      {/* ── HEADER ── */}
      <div className="bp-header">
        <div className="bp-header-marble" />
        <div className="bp-header-veil" />
        <div className="bp-header-content">
          <span className="bp-eyebrow">Your Collection</span>
          <h1 className="bp-header-h1">My Library</h1>
          <BookCount count={bookCount || books.length} />
        </div>
      </div>

      {/* ── ADD BOOK FORM ── */}
      <div className="bp-form-wrap">
        <div className="bp-form-inner">
          <h2 className="bp-form-title">Add a Book</h2>
          <form className="bp-form" onSubmit={handleAddBook}>
            <div className="bp-field">
              <label className="bp-label">Title</label>
              <input
                className="bp-input"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. One Hundred Years of Solitude"
                required
              />
            </div>
            <div className="bp-field">
              <label className="bp-label">Author</label>
              <input
                className="bp-input"
                type="text"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="e.g. Gabriel García Márquez"
                required
              />
            </div>
            <button className="bp-btn-add" type="submit" disabled={adding}>
              {adding ? 'Adding…' : '+ Add to Library'}
            </button>
          </form>
        </div>
      </div>

      {/* ── ERROR ── */}
      {error && (
        <div className="bp-error">
          <span>{error}</span>
          <button
            className="bp-error-close"
            onClick={() => setError(null)}
          >
            ✕
          </button>
        </div>
      )}

      {/* ── BOOK LIST ── */}
      <div className="bp-list-wrap">
        {loading ? (
          <div className="bp-loading">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="bp-skel"
                style={{ animationDelay: `${i * 0.12}s` }}
              />
            ))}
          </div>
        ) : books.length === 0 ? (
          <div className="bp-empty">
            <div className="bp-empty-icon">📚</div>
            <h3>Your library is empty</h3>
            <p>Add your first book using the form above.</p>
          </div>
        ) : (
          <div className="bp-grid">
            {books.map((book) => (
              <div key={book.book_id} className="bp-card">
                {/* Cover */}
                <div className="bp-cover-wrap">
                  <img
                    className="bp-cover"
                    src={
                      book.image_link
                        ? book.image_link.replace(/^http:/, 'https:')
                        : 'https://placehold.co/300x450/2c7a6e/f8f3e8?text=No+Cover'
                    }
                    alt={book.title}
                    onClick={() =>
                      book.preview_link &&
                      window.open(book.preview_link, '_blank')
                    }
                    onError={(e) => {
                      e.currentTarget.src =
                        'https://placehold.co/300x450/2c7a6e/f8f3e8?text=No+Cover';
                    }}
                  />
                  {book.preview_link && (
                    <div className="bp-cover-hint">Preview →</div>
                  )}
                </div>

                {/* Info */}
                <div className="bp-card-body">
                  <h3 className="bp-book-title">{book.title}</h3>
                  <p className="bp-book-author">By {book.author}</p>

                  {book.categories && (
                    <div className="bp-categories">
                      {(Array.isArray(book.categories)
                        ? book.categories
                        : [book.categories]
                      )
                        .slice(0, 2)
                        .map((cat, i) => (
                          <span key={i} className="bp-cat-pill">
                            {cat}
                          </span>
                        ))}
                    </div>
                  )}

                  <BookDescription text={book.description_book} />

                  <div className="bp-rating-row">
                    <Rating
                      initialRating={book.rating || 0}
                      onChange={(rate) =>
                        handleRatingChange(book.book_id, rate)
                      }
                    />
                  </div>

                  <button
                    className="bp-btn-delete"
                    onClick={() => handleDeleteBook(book.book_id)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Books;
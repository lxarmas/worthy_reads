import React from 'react';
import './Books.css';

const BookDescription = ({ description }) => {
  const trimmedDescription = description ? description.trim() : '';

  return (
    <div className="book-description-pop">
      <div className="book-description-content">
        {trimmedDescription !== '' 
          ? trimmedDescription 
          : 'Worthy Reads apologizes, no information about this book at the moment'}
      </div>
    </div>
  );
};

export default BookDescription;

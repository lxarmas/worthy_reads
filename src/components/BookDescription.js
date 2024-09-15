import React from 'react';
import { Button } from 'react-bootstrap';
import './Books.css';

const BookDescription = ({ description, onClick }) => {
  const trimmedDescription = description ? description.trim() : '';

  return (
    <div className="book-description-pop">
      <div className="book-description-content">
        {trimmedDescription !== ''
          ? trimmedDescription
          : 'Worthy Reads apologizes, no information about this book at the moment'}
      </div>

      {/* Info button inside the description */}
      <Button
        className="custom-button custom-button-primary mt-2"
        onClick={onClick}  // Handle the info button click
      >
        Back
      </Button>
    </div>
  );
};

export default BookDescription;

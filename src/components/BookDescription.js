import React from 'react';
import './Books.css'

const BookDescription = ({ description }) => {
  const trimmedDescription = description ? description.trim() : '';

  return (
    <div className='test'>
      {trimmedDescription !== '' 
        ? trimmedDescription 
        : 'Worthy Reads apologizes, no information about this book at the moment'}
    </div>
  );
};

export default BookDescription;

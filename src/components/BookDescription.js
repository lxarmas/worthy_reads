import React from 'react';

const BookDescription = ({ description }) => {
  const trimmedDescription = description ? description.trim() : '';

  return (
    <div>
      {trimmedDescription !== '' 
        ? trimmedDescription 
        : 'Worthy Reads apologizes, no information about this book at the moment'}
    </div>
  );
};

export default BookDescription;

// src/components/BookCount.js
import React from 'react';

function BookCount({ count }) {
  return (
    <h2 className="countBook">
      You have read <span id="bookCount">{count}</span> books, keep up the good work, friend!
    </h2>
  );
}

export default BookCount;

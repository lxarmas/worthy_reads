
import React, { useState } from 'react';
import { motion } from 'framer-motion';

const Star = ({ filled, onClick }) => (
  <motion.i
    className={`fa fa-star${filled ? '' : '-o'} fa-2x`}
    onClick={onClick}
    whileHover={{ scale: 1.3, rotate: 15, boxShadow: "0px 6px 12px rgba(0, 0, 0, 0.5)" }}
    whileTap={{ scale: 1.5, rotate: 0 }}
    style={{ color: filled ? 'gold' : 'lightgray', cursor: 'pointer' }}
  />
);

const Rating = ({ initialRating = 0, onChange }) => {
  const [rating, setRating] = useState(initialRating);

  const handleClick = (newRating) => {
    setRating(newRating);
    if (onChange) {
      onChange(newRating);
    }
  };

  return (
    <div>
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          filled={star <= rating}
          onClick={() => handleClick(star)}
        />
      ))}
    </div>
  );
};

export default Rating;

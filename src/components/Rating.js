import React, { useState } from 'react';
import { motion } from 'framer-motion';

// SVG star icons without borders
const StarIcon = ({ filled, onClick }) => (
  <motion.svg
    onClick={onClick}
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    width="24"
    height="24"
    whileHover={{ scale: 1.2, rotate: [0, 5, -5, 0], transition: { duration: 0.2 } }}
    whileTap={{ scale: 1.3, transition: { duration: 0.1 } }}
    style={{ cursor: 'pointer', margin: '0 1px', outline: 'none' }} // Slight margin between stars
  >
    <path
      d={filled ? 
        "M12 17.27L18.18 21 16.54 14.87 22 10.27H15.81L12 4 8.19 10.27H2L7.46 14.87 5.82 21z" :
        "M12 17.27L18.18 21 16.54 14.87 22 10.27H15.81L12 4 8.19 10.27H2L7.46 14.87 5.82 21z"}
      fill={filled ?  '#FFB74D' : 'grey'} // Darker yellow for filled stars
      stroke="none" // Ensure no stroke or border
    />
  </motion.svg>
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
    <div style={{ display: 'flex', alignItems: 'center' }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <StarIcon
          key={star}
          filled={star <= rating}
          onClick={() => handleClick(star)}
        />
      ))}
    </div>
  );
};

export default Rating;

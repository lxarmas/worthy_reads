import { Link } from 'react-router-dom';
import React from 'react';

const CategoryLink = ({ categories}) => {
  return (
    <Link to={`/category/${categories}`} className="category-link">
      {categories}
    </Link>
  );
};

export default CategoryLink;

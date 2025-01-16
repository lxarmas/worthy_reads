function BookCount( { count, categoryName } ) {
  const countStyle = {
    color: count > 10 ? 'darkblue' : 'blue', // Dark blue if more than 10 books, blue otherwise
    fontWeight: 'bold',
    fontSize: '1.2em',
  };

  const categoryStyle = {
    color: 'blue', // Set the color for the category name
    fontStyle: 'italic',
    fontWeight: 'bold'
  };

  return (
    <h2 className="countBook">
      You have read <span style={countStyle}>{count}</span> books
      {categoryName && (
        <>
          {' in '}
          <span style={categoryStyle}>{categoryName}</span>
        </>
      )}
      , keep up the good work!
    </h2>
  );
}

export default BookCount;

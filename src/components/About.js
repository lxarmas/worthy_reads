import React from 'react';
import Nav from './Nav';

function About() {
  return (
    <div className="container mt-5">
      <Nav />
      <div className="row justify-content-center">
        <div className="col-md-8">
          <h3 className="text-center">
            This page is dedicated to the books that you love most and you want to have them
            at hand at your disposal. We made this website based on our love for all books
            that bring us pleasure, pain, and beyond. We love books, and if you are a lover
            too, we want you to be part of our worthy reads for free!
          </h3>
        </div>
      </div>
    </div>
  );
}

export default About;

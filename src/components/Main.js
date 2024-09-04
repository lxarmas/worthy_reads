
document.addEventListener('DOMContentLoaded', function() {
  const bookImages = document.querySelectorAll('.book-image');
  bookImages.forEach(image => {
    image.addEventListener('click', function() {
      const descriptionContainer = this.parentElement.nextElementSibling.querySelector( '.description-container' );
      descriptionContainer.style.display = descriptionContainer.style.display === 'none' ? 'block' : 'none';
        descriptionContainer.classList.toggle('zoomed');
    });
  });
});

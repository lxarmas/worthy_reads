
import './HomePage.css'

function HomePage() {
    return (
        <main>
<div className="jumbotron text-center">
  <div className="container">
    <div className="book-icon">
      <i className="fas fa-book fa-7x"></i>
    </div>

    <hr className="my-4" />
    <div className="row justify-content-center">
      <div className="col-md-4">
        <a
        className="btn btn-primary btn-lg btn-block mb-2"
        href="/register"
        role="button"
        style={{
        backgroundColor: 'rgb( 44, 122, 110 )',
        borderColor: 'rgb( 44, 122, 110 )',
                                }}
          >Get Started</a
        >
      </div>
      <div className="col-md-4">
        <a
          className="btn btn-primary btn-lg btn-block"
          href="/login"
          role="button"
          style={{
            backgroundColor: 'rgb(44, 122, 110)',
            borderColor: 'rgb(44, 122, 110)',
          }}
          >Login</a
        >
      </div>
    </div>
  </div>
</div>
</main>
)

}
export default HomePage;
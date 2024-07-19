function LogIn() {
    return (
      <div class="container mt-5">
  <h1 className="text-center">Login</h1>

  <div className="row justify-content-center">
    <div className="col-md-6">
      <div className="card">
        <div className="card-body">
        {/* makes post request */}
          <form action="/login" method="POST">
            <div className="form-group">
              <label for="email">Email</label>
              <input
                type="email"
                className="form-control"
                name="username"
                placeholder="Enter your email"
                required
              />
            </div>
            <div className="form-group">
              <label for="password">Password</label>
              <input
                type="password"
                className="form-control"
                name="password"
                placeholder="Enter your password"
                required
              />
            </div>
            <button
            type="submit"
            className="btn btn-primary btn-block"
            style={{
            backgroundColor: 'rgb(44, 122, 110)',
            borderColor: ' rgb(44, 122, 110)',
            }}
            >
              Login
            </button>
          </form>
          <div class="text-center mt-3">
            <p>Don't have an account? <a href="/register">Register here</a></p>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
    )
}
export default LogIn;
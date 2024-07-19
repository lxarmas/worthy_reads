

function Register() {
    return (
        <div class="container mt-5">
  <h1 class="text-center">Register</h1>

  <div class="row justify-content-center">
    <div class="col-md-6">
      <div class="card">
        <div class="card-body">
        {/* makes post for register */}
          <form action="/register" method="POST">
            <div class="form-group">
              <label for="first_name">First Name</label>
              <input
                type="first_name"
                class="form-control"
                name="first_name"
                placeholder="Enter your first name"
                required
              />
            </div>

            <div class="form-group">
              <label for="last_name">Last Name</label>
              <input
                type="last_name"
                class="form-control"
                name="last_name"
                placeholder="Enter your last name"
                required
              />
            </div>

            <div class="form-group">
              <label for="username">Email</label>
              <input
                type="email"
                class="form-control"
                name="username"
                placeholder="Enter your email"
                required
              />
            </div>

            <div class="form-group">
              <label for="password">Password</label>
              <input
                type="password"
                class="form-control"
                name="password"
                placeholder="Enter your password"
                required
              />
            </div>
            <button
            type="submit"
            class="btn btn-primary btn-block"
            style={{
            backgroundColor: 'rgb(44, 122, 110)',
            borderColor: 'rgb(44, 122, 110)',
                                    }}
            >
              Register
            </button>
          </form>
          <div class="text-center mt-3">
            <p>Already have an account? <a href="/login">Login here</a></p>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
    )
}
export default Register;
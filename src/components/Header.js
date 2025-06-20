import './header.css';


function Header() {
  return (
    <header className="header">

      <div className="header-content">
        <img
          src="/images/logo.png"
          alt="Worthy Reads Logo"
          className="header-logo"
        />
        <div className="header-text">
          <h1 className="headerTitle">WORTHY READS</h1>
          <h2 className="headerTagline">“A library is a hospital for the mind.”</h2>
        </div>
      </div>
    </header>
  );
}

export default Header;

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
          <p className="headerTitle">WORTHY READS</p>
          <p className="headerTagline">“A library is a hospital for the mind.”</p>
        </div>
      </div>
    </header>
  );
}

export default Header;

import './Footer.css';

function Footer() {
    return (
        <footer className="footer mt-auto py-4">
            <div className="container text-center">
                <div className="footer-content">
                    <div className="book-icon">
                        <img
                            src="/images/logo.png"
                            alt="Worthy Reads Logo"
                            className="footer-logo"
                        />


                    </div>
                    <span style={{ color: 'black', marginRight: '4rem' }}>© 2025 WORTHY READS</span>

                </div>
            </div>
        </footer>
    );
}

export default Footer
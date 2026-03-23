import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import Rating from './Rating';
import axios from 'axios';
import './HomePage.css';

function BookCard({ book, index }) {
  const cardRef = useRef(null);

  const handleMouseMove = (e) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const rx = ((y - cy) / cy) * -6;
    const ry = ((x - cx) / cx) * 6;
    card.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) scale(1.03)`;
    card.style.boxShadow = `${-ry * 2}px ${rx * 2}px 40px rgba(44,122,110,0.18), 0 20px 60px rgba(0,0,0,0.12)`;
  };

  const handleMouseLeave = () => {
    if (cardRef.current) {
      cardRef.current.style.transform = 'perspective(900px) rotateX(0) rotateY(0) scale(1)';
      cardRef.current.style.boxShadow = '';
    }
  };

  const info = book.volumeInfo || {};
  const img =
    info.imageLinks?.extraLarge ||
    info.imageLinks?.large ||
    info.imageLinks?.medium ||
    info.imageLinks?.thumbnail ||
    'https://placehold.co/300x450/2c7a6e/f2ead8?text=No+Cover';

  return (
    <div className="bc-wrap" style={{ animationDelay: `${index * 0.13}s` }}>
      <div
        ref={cardRef}
        className="bc"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={() => info.previewLink && window.open(info.previewLink, '_blank')}
      >
        <div className="bc-shine" />
        <img src={img} alt={info.title} className="bc-img" />
        <div className="bc-overlay">
          <p className="bc-author">{info.authors ? info.authors.join(', ') : 'Unknown'}</p>
          <h4 className="bc-title">{info.title}</h4>
          <div className="bc-rating"><Rating initialRating={info.averageRating || 0} /></div>
          {info.categories?.[0] && (
            <Link to={`/category/${info.categories[0]}`} className="bc-cat">
              {info.categories[0]}
            </Link>
          )}
          <div className="bc-cta">Preview →</div>
        </div>
      </div>
    </div>
  );
}

function Counter({ end, label, prefix = '' }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !started.current) {
        started.current = true;
        let cur = 0;
        const step = (end / 1600) * 16;
        const t = setInterval(() => {
          cur += step;
          if (cur >= end) { setCount(end); clearInterval(t); }
          else setCount(Math.floor(cur));
        }, 16);
      }
    }, { threshold: 0.5 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [end]);
  return (
    <div ref={ref} className="stat-block">
      <span className="stat-num">{prefix}{count.toLocaleString()}+</span>
      <span className="stat-lbl">{label}</span>
    </div>
  );
}

export default function HomePage() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [visible, setVisible] = useState(false);
  const hasFetched = useRef(false);

  useEffect(() => {
    setTimeout(() => setVisible(true), 80);
    if (hasFetched.current) { setLoading(false); return; }
    hasFetched.current = true;
    const ctrl = new AbortController();
    axios.get('/api/home-books', { signal: ctrl.signal })
      .then(r => {
        const d = r.data;
        setBooks(Array.isArray(d) ? d : Array.isArray(d?.items) ? d.items : []);
      })
      .catch(err => {
        if (!axios.isCancel(err)) {
          setError(err.response?.status === 429
            ? 'Taking a short break. Check back soon.'
            : 'Could not load books right now.');
          setBooks([]);
        }
      })
      .finally(() => setLoading(false));
    return () => ctrl.abort();
  }, []);

  return (
    <div className="wr-root">

      {/* ── HERO ── */}
      <section className={`wr-hero ${visible ? 'vis' : ''}`}>
        <div className="hero-marble" />
        <div className="hero-veil" />
        <div className="hero-content">
          <div className="hero-badge">A Curated Reading Experience</div>
          <h1 className="hero-h1">
            <span className="h1-thin">Worthy</span>
            <span className="h1-bold">Reads</span>
          </h1>
          <p className="hero-p">
            Your personal library, beautifully organized.<br />
            Discover, collect, and celebrate the books that move you.
          </p>
          <div className="hero-actions">
            <Link to="/register" className="btn-gold">Begin Your Collection</Link>
            <Link to="/login" className="btn-ghost">Sign In</Link>
          </div>
        </div>
        <div className="hero-scroll">
          <span className="scroll-txt">Scroll</span>
          <div className="scroll-bar" />
        </div>
      </section>

      {/* ── MARQUEE ── */}
      <div className="marquee-strip">
        <div className="marquee-track">
          {['Fiction', 'Poetry', 'History', 'Science', 'Philosophy', 'Biography', 'Fantasy', 'Essays', 'Fiction', 'Poetry', 'History', 'Science', 'Philosophy', 'Biography', 'Fantasy', 'Essays'].map((t, i) => (
            <span key={i} className="marquee-item">
              <span className="marquee-dot">◆</span> {t}
            </span>
          ))}
        </div>
      </div>

      {/* ── INTRO ── */}
      <section className="wr-intro">
        <div className="intro-left">
          <div className="section-eyebrow">Our Philosophy</div>
          <h2 className="section-h2">Books deserve a beautiful home.</h2>
          <p className="intro-body">
            Worthy Reads was built on the belief that your reading life should be as rich as
            the books themselves. We combine the warmth of a personal library with the power
            of modern search — so every book you love is one tap away.
          </p>
          <Link to="/register" className="btn-teal">Explore the Shelves</Link>
        </div>
        <div className="intro-right">
          <div className="intro-card marble-card">
            <div className="marble-overlay" />
            <div className="intro-card-inner">
              <span className="intro-icon">📖</span>
              <h3>10,000+</h3>
              <p>Books catalogued with rich metadata, covers, and previews.</p>
            </div>
          </div>
          <div className="intro-card glass-card">
            <span className="intro-icon">⭐</span>
            <h3>Your ratings</h3>
            <p>Track every book you've read and how it moved you.</p>
          </div>
          <div className="intro-card gold-card">
            <span className="intro-icon">🌿</span>
            <h3>Always growing</h3>
            <p>Powered by Google Books. Always fresh, always complete.</p>
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="wr-stats">
        <div className="stats-marble" />
        <Counter end={10000} label="Books catalogued" />
        <div className="stats-div" />
        <Counter end={2400} label="Active readers" />
        <div className="stats-div" />
        <Counter end={180} label="Genres covered" />
        <div className="stats-div" />
        <Counter end={99} label="Satisfaction" prefix="" />
      </section>

      {/* ── BOOKS ── */}
      <section className="wr-books">
        <div className="wr-books-header">
          <div className="section-eyebrow">From the collection</div>
          <h2 className="section-h2">What's being discovered</h2>
        </div>
        {loading ? (
          <div className="books-skel-row">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="skel" style={{ animationDelay: `${i * 0.1}s` }} />
            ))}
          </div>
        ) : error ? (
          <p className="books-err">{error}</p>
        ) : books.length === 0 ? (
          <p className="books-err">No books found. Try refreshing.</p>
        ) : (
          <div className="books-row">
            {books.map((b, i) => <BookCard key={i} book={b} index={i} />)}
          </div>
        )}
      </section>

      {/* ── FEATURES ── */}
      <section className="wr-features">
        <div className="features-marble" />
        <div className="features-inner">
          <div className="section-eyebrow center">Everything you need</div>
          <h2 className="section-h2 center">Built for serious readers.</h2>
          <div className="feat-grid">
            {[
              { n: '01', icon: '🔍', t: 'Discover', d: 'Search millions of titles by author, genre, or mood.' },
              { n: '02', icon: '📚', t: 'Collect', d: 'Build a personal library that reflects your taste.' },
              { n: '03', icon: '⭐', t: 'Rate & reflect', d: 'Track what moved you. Build your reading history.' },
              { n: '04', icon: '🖼️', t: 'Beautiful covers', d: 'Every book enriched with covers and previews.' },
            ].map(f => (
              <div key={f.n} className="feat-card">
                <div className="feat-num">{f.n}</div>
                <div className="feat-icon">{f.icon}</div>
                <h3 className="feat-title">{f.t}</h3>
                <p className="feat-desc">{f.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── QUOTE ── */}
      <section className="wr-quote">
        <div className="quote-inner">
          <div className="quote-ornament">❧</div>
          <blockquote className="quote-text">
            "Not all those who wander are lost — but all those who read, find themselves."
          </blockquote>
          <cite className="quote-cite">— A Reader's Creed</cite>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="wr-testi">
        <div className="section-eyebrow center">Reader voices</div>
        <h2 className="section-h2 center">Loved by book lovers</h2>
        <div className="testi-grid">
          {[
            { q: 'Worthy Reads completely transformed how I organize my books. It feels like a personal librarian.', a: 'Sofia M.', r: 'Avid reader' },
            { q: 'The Google Books integration means every cover looks gorgeous. My shelf has never looked better.', a: 'Daniel R.', r: 'Book blogger' },
            { q: 'Finally an app that feels designed for people who actually care deeply about books.', a: 'Amara T.', r: 'Literature professor' },
          ].map(t => (
            <div key={t.a} className="testi-card">
              <div className="testi-stars">★★★★★</div>
              <p className="testi-q">"{t.q}"</p>
              <div className="testi-author">
                <strong>{t.a}</strong>
                <span>{t.r}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── BANNER ── */}
      <section className="wr-banner">
        <div className="banner-marble" />
        <div className="banner-inner">
          <div className="banner-ornament">◆ ◆ ◆</div>
          <h2 className="banner-h2">Your next great read is waiting.</h2>
          <p className="banner-sub">Join thousands of readers building their perfect library.</p>
          <Link to="/register" className="btn-gold large">Create Your Library</Link>
        </div>
      </section>

    </div>
  );
}

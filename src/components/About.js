import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import './About.css';

const quotes = [
  { text: "A room without books is like a body without a soul.", author: "Cicero" },
  { text: "So many books, so little time.", author: "Frank Zappa" },
  { text: "A reader lives a thousand lives before he dies.", author: "George R.R. Martin" },
  { text: "Books are a uniquely portable magic.", author: "Stephen King" },
];

function QuoteCarousel() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const t = setInterval(() => {
      setActive(prev => (prev + 1) % quotes.length);
    }, 3800);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="ab-carousel">
      <div className="ab-carousel-track">
        {quotes.map((q, i) => (
          <div
            key={i}
            className={`ab-quote-slide ${i === active ? 'active' : ''}`}
          >
            <div className="ab-quote-mark">"</div>
            <p className="ab-quote-text">{q.text}</p>
            <cite className="ab-quote-author">— {q.author}</cite>
          </div>
        ))}
      </div>
      <div className="ab-carousel-dots">
        {quotes.map((_, i) => (
          <button
            key={i}
            className={`ab-dot ${i === active ? 'active' : ''}`}
            onClick={() => setActive(i)}
            aria-label={`Quote ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

function RevealSection({ children, delay = 0, className = '' }) {
  const ref = useRef(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVis(true); obs.disconnect(); } },
      { threshold: 0.15 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return (
    <div
      ref={ref}
      className={`reveal-block ${vis ? 'revealed' : ''} ${className}`}
      style={{ transitionDelay: `${delay}s` }}
    >
      {children}
    </div>
  );
}

export default function About() {
  const [heroVis, setHeroVis] = useState(false);
  useEffect(() => { setTimeout(() => setHeroVis(true), 80); }, []);

  return (
    <div className="ab-root">

      {/* ── HERO ── */}
      <section className={`ab-hero ${heroVis ? 'vis' : ''}`}>
        <div className="ab-hero-marble" />
        <div className="ab-hero-veil" />
        <div className="ab-hero-content">
          <motion.div
            className="ab-eyebrow"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: heroVis ? 1 : 0, y: heroVis ? 0 : 14 }}
            transition={{ duration: 0.7, delay: 0.1 }}
          >
            Our Story
          </motion.div>
          <motion.h1
            className="ab-hero-h1"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: heroVis ? 1 : 0, y: heroVis ? 0 : 30 }}
            transition={{ duration: 1, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
          >
            <span className="ab-h1-thin">About</span>
            <span className="ab-h1-bold">Worthy Reads</span>
          </motion.h1>
          <motion.p
            className="ab-hero-p"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: heroVis ? 1 : 0, y: heroVis ? 0 : 16 }}
            transition={{ duration: 0.8, delay: 0.55 }}
          >
            Built from a deep love of stories and the belief that every reader
            deserves a beautiful space to call their own.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: heroVis ? 1 : 0, y: heroVis ? 0 : 16 }}
            transition={{ duration: 0.8, delay: 0.7 }}
          >
            <div className="ab-hero-scroll">
              <span className="ab-scroll-txt">Discover</span>
              <div className="ab-scroll-bar" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── MISSION ── */}
      <section className="ab-mission">
        <RevealSection className="ab-mission-left" delay={0}>
          <span className="ab-section-eyebrow">Our Mission</span>
          <h2 className="ab-section-h2">A sanctuary for readers.</h2>
          <p className="ab-body-text">
            Worthy Reads was born from a simple truth — books change lives. We created
            this space to honour that truth, giving every reader a beautiful, personal
            library that reflects who they are and the worlds they've explored.
          </p>
          <p className="ab-body-text">
            Our love and passion started from a true love for learning and the art of
            storytelling. Every feature we build is guided by one question: does this
            make the reading life richer?
          </p>
          <blockquote className="ab-pull-quote">
            "Our job is to pave a better future — one book at a time."
          </blockquote>
        </RevealSection>

        <RevealSection className="ab-mission-right" delay={0.15}>
          <div className="ab-portrait-frame">
            <div className="ab-portrait-marble" />
            <img
              src="/images/image.jpg"
              alt="Alejandro Armas"
              className="ab-portrait"
              onError={e => { e.currentTarget.style.display = 'none'; }}
            />
            <div className="ab-portrait-caption">
              <strong>Alejandro Armas</strong>
              <span>Founder, Worthy Reads</span>
            </div>
          </div>
        </RevealSection>
      </section>

      {/* ── VALUES ── */}
      <section className="ab-values">
        <div className="ab-values-marble" />
        <div className="ab-values-inner">
          <RevealSection>
            <span className="ab-section-eyebrow center">What we believe</span>
            <h2 className="ab-section-h2 center">Our guiding principles.</h2>
          </RevealSection>
          <div className="ab-values-grid">
            {[
              { icon: '📖', t: 'Every book matters', d: 'From classic literature to genre fiction — we treat every book as worthy of a beautiful home.' },
              { icon: '🌿', t: 'Beauty in simplicity', d: 'An interface that gets out of the way so your books can take centre stage.' },
              { icon: '✦', t: 'Crafted with care', d: 'Every detail — typography, layout, interaction — is considered and intentional.' },
              { icon: '🌍', t: 'Community first', d: 'Readers are better together. We build for connection and shared discovery.' },
            ].map((v, i) => (
              <RevealSection key={v.t} delay={i * 0.1}>
                <div className="ab-value-card">
                  <div className="ab-value-icon">{v.icon}</div>
                  <h3 className="ab-value-title">{v.t}</h3>
                  <p className="ab-value-desc">{v.d}</p>
                </div>
              </RevealSection>
            ))}
          </div>
        </div>
      </section>

      {/* ── QUOTES CAROUSEL ── */}
      <section className="ab-quotes-section">
        <RevealSection>
          <span className="ab-section-eyebrow center">Words that move us</span>
          <h2 className="ab-section-h2 center">Quotes we love.</h2>
        </RevealSection>
        <RevealSection delay={0.1}>
          <QuoteCarousel />
        </RevealSection>
      </section>

      {/* ── CTA ── */}
      <section className="ab-cta">
        <div className="ab-cta-marble" />
        <div className="ab-cta-inner">
          <div className="ab-cta-ornament">◆ ◆ ◆</div>
          <h2 className="ab-cta-h2">Ready to start your collection?</h2>
          <p className="ab-cta-sub">Join a community that celebrates the written word.</p>
          <Link to="/register" className="ab-btn-gold">Build Your Library</Link>
        </div>
      </section>

    </div>
  );
}

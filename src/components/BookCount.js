import React, { useEffect, useRef, useState } from 'react';

function BookCount({ count, categoryName }) {
  const [displayed, setDisplayed] = useState(0);
  const started = useRef(false);

  useEffect(() => {
    if (!count || started.current) return;
    started.current = true;
    let cur = 0;
    const step = Math.max(1, Math.floor(count / 30));
    const t = setInterval(() => {
      cur += step;
      if (cur >= count) { setDisplayed(count); clearInterval(t); }
      else setDisplayed(cur);
    }, 40);
    return () => clearInterval(t);
  }, [count]);

  const getEmoji = () => {
    if (count >= 50) return '🏆';
    if (count >= 25) return '🔥';
    if (count >= 10) return '⭐';
    if (count >= 1)  return '📖';
    return '✨';
  };

  const getMessage = () => {
    if (count >= 50) return 'Legendary. Truly.';
    if (count >= 25) return 'You are on fire.';
    if (count >= 10) return 'Keep turning those pages.';
    if (count >= 5)  return 'The collection is growing.';
    if (count >= 1)  return 'Every great library starts here.';
    return 'Your collection awaits.';
  };

  return (
    <div style={{ padding: '0.4rem 0' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', flexWrap: 'wrap' }}>
        <span style={{
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          fontSize: 'clamp(2.4rem, 7vw, 3.8rem)',
          fontWeight: 700,
          color: '#ffffff',
          lineHeight: 1,
          letterSpacing: '-0.02em',
        }}>
          {displayed}
        </span>
        <span style={{
          fontFamily: "'Jost', system-ui, sans-serif",
          fontSize: '0.82rem',
          fontWeight: 400,
          color: 'rgba(242,234,216,0.65)',
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          paddingBottom: '0.3rem',
        }}>
          {count === 1 ? 'book' : 'books'}
          {categoryName && (
            <span style={{ color: '#e8c96a', fontStyle: 'italic', textTransform: 'none', letterSpacing: 0 }}>
              {' '}in {categoryName}
            </span>
          )}
        </span>
        <span style={{ fontSize: '1.3rem', paddingBottom: '0.1rem' }}>{getEmoji()}</span>
      </div>
      <p style={{
        fontFamily: "'Jost', system-ui, sans-serif",
        fontSize: '0.8rem',
        fontWeight: 300,
        color: 'rgba(242,234,216,0.5)',
        letterSpacing: '0.06em',
        marginTop: '0.3rem',
      }}>
        {getMessage()}
      </p>
    </div>
  );
}

export default BookCount;

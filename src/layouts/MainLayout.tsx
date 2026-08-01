import { useEffect, useRef, useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useOwnedCards } from '../hooks/useCards';
import styles from './MainLayout.module.css';

export function MainLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { data: ownedCards } = useOwnedCards();
  const totalOwned = (ownedCards ?? []).reduce((sum, c) => sum + c.quantity, 0);

  const [bounce, setBounce] = useState(false);
  const prevTotal = useRef(totalOwned);

  useEffect(() => {
    if (totalOwned !== prevTotal.current) {
      setBounce(true);
      const timer = window.setTimeout(() => setBounce(false), 600);
      prevTotal.current = totalOwned;
      return () => window.clearTimeout(timer);
    }
  }, [totalOwned]);

  const isSearch = location.pathname === '/';
  const isBinder = location.pathname === '/binder';

  return (
    <div className={styles.root}>
      <nav className={`nav ${styles.header}`}>
        <span className="nav-brand">
          CardPriceTracker<span className={styles.brandAccent}> — Field Catalog</span>
        </span>
        <div className={`seg ${styles.viewToggle}`} role="radiogroup" aria-label="View">
          <label className="seg-opt">
            <input type="radio" name="view-toggle" checked={isSearch} onChange={() => navigate('/')} />
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
            Search
          </label>
          <label className="seg-opt">
            <input type="radio" name="view-toggle" checked={isBinder} onChange={() => navigate('/binder')} />
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 7v14" />
              <path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z" />
            </svg>
            Binder
          </label>
        </div>
        <Link to="/binder" className={`btn btn-secondary blueprint ${styles.binderLink}`}>
          <i className="corner tl" />
          <i className="corner tr" />
          <i className="corner bl" />
          <i className="corner br" />
          <span className={`${styles.badge} ${bounce ? 'badge-bounce' : ''}`}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 7v14" />
              <path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z" />
            </svg>
            {totalOwned} catalogued
          </span>
        </Link>
      </nav>
      <main>
        <Outlet />
      </main>
    </div>
  );
}

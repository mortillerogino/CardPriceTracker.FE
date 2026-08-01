import { useEffect, useRef, useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useOwnedCards } from '../hooks/useCards';
import styles from './MainLayout.module.css';

type View = 'search' | 'binder';

const LOADING_DURATION_MS = 3000;
const COVER_DURATION_MS = Math.min(1400, Math.max(700, LOADING_DURATION_MS * 0.6));
const OVERLAY_FADE_MS = 180;

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

  const [switching, setSwitching] = useState<View | null>(null);
  const [direction, setDirection] = useState<'left' | 'right'>('right');
  const switchTimer = useRef<number>();
  const navigateTimer = useRef<number>();

  useEffect(() => () => {
    window.clearTimeout(switchTimer.current);
    window.clearTimeout(navigateTimer.current);
  }, []);

  function switchTo(target: View) {
    const path = target === 'binder' ? '/binder' : '/';
    if (location.pathname === path || switching) return;
    setSwitching(target);
    setDirection(target === 'binder' ? 'right' : 'left');
    window.clearTimeout(switchTimer.current);
    window.clearTimeout(navigateTimer.current);
    navigateTimer.current = window.setTimeout(() => {
      navigate(path);
    }, OVERLAY_FADE_MS);
    switchTimer.current = window.setTimeout(() => {
      setSwitching(null);
    }, LOADING_DURATION_MS);
  }

  const activeToggle: View = switching ?? (isBinder ? 'binder' : 'search');

  return (
    <div className={styles.root}>
      <nav className={`nav ${styles.header}`}>
        <span className="nav-brand">
          Betsy's Binder<span className={styles.brandAccent}> — Personal Card Library</span>
        </span>
        <div className={styles.controls}>
          <div className={`seg ${styles.viewToggle}`} role="radiogroup" aria-label="View">
            <label className="seg-opt">
              <input type="radio" name="view-toggle" checked={activeToggle === 'search'} onChange={() => switchTo('search')} />
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
              Search
            </label>
            <label className="seg-opt">
              <input type="radio" name="view-toggle" checked={activeToggle === 'binder'} onChange={() => switchTo('binder')} />
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
        </div>
      </nav>
      <main style={{ position: 'relative', minHeight: 600 }}>
        <div
          key={location.pathname}
          style={{ animation: `${direction === 'right' ? 'panelInRight' : 'panelInLeft'} 420ms cubic-bezier(0.22, 1, 0.36, 1) both` }}
        >
          <Outlet />
        </div>

        {switching && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 20,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'var(--color-bg)',
              animation: `overlayIn ${OVERLAY_FADE_MS}ms ease both`,
              perspective: '1200px',
            }}
          >
            <div
              style={{
                position: 'relative',
                width: 210,
                aspectRatio: '3 / 4',
                transformStyle: 'preserve-3d',
                animation: `cardFlip ${COVER_DURATION_MS}ms cubic-bezier(0.45, 0, 0.2, 1) both`,
              }}
            >
              <div
                className="blueprint"
                style={{
                  position: 'absolute',
                  inset: 0,
                  backfaceVisibility: 'hidden',
                  background: 'var(--color-accent-900)',
                  border: '1px solid var(--color-divider)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <i className="corner tl" />
                <i className="corner tr" />
                <i className="corner bl" />
                <i className="corner br" />
                <span style={{ fontFamily: 'var(--font-heading)', fontSize: 34, fontWeight: 700, letterSpacing: '0.02em', color: 'var(--color-accent)' }}>
                  BB
                </span>
              </div>
              <div
                className="blueprint"
                style={{
                  position: 'absolute',
                  inset: 0,
                  backfaceVisibility: 'hidden',
                  transform: 'rotateY(180deg)',
                  background: 'var(--color-surface)',
                  border: '1px solid var(--color-divider)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 'var(--space-4)',
                  textAlign: 'center',
                }}
              >
                <i className="corner tl" />
                <i className="corner tr" />
                <i className="corner bl" />
                <i className="corner br" />
                <div className="card-kicker" style={{ letterSpacing: '0.08em' }}>
                  PERSONAL CARD LIBRARY
                </div>
                <div
                  style={{
                    fontFamily: 'var(--font-heading)',
                    fontSize: 14,
                    color: 'var(--color-text-h)',
                    margin: '8px 0',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                  }}
                >
                  {switching === 'binder' ? 'ACCESSING BINDER' : 'ACCESSING CATALOG'}
                  <span style={{ animation: 'blinkCursor 900ms step-end infinite' }}>_</span>
                </div>
                <div style={{ width: '80%', height: 3, background: 'var(--color-divider)', borderRadius: 2, overflow: 'hidden', marginTop: 'var(--space-3)' }}>
                  <div style={{ height: '100%', background: 'var(--color-accent)', animation: `barFill ${LOADING_DURATION_MS}ms ease forwards` }} />
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

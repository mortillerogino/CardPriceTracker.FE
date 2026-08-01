import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { getOwnedCards } from '../api/cards';
import { useDecrementCardQuantity, useOwnedCards, useRefreshPrices } from '../hooks/useCards';
import type { Card } from '../types/card';
import styles from './BinderPage.module.css';

const POCKETS_PER_PAGE = 9;
const RING_HOLES = 6;
const SCAN_TICK_MS = 120;
const SUCCESS_DISPLAY_MS = 1900;

type ScanPhase = 'idle' | 'confirm' | 'scanning' | 'success';

interface ScanResult {
  total: number;
  up: number;
  down: number;
  unchanged: number;
}

export function BinderPage() {
  const { data: ownedCards, isLoading, isError } = useOwnedCards();
  const decrementQuantity = useDecrementCardQuantity();
  const refreshPrices = useRefreshPrices();
  const [page, setPage] = useState(0);

  const [scanPhase, setScanPhase] = useState<ScanPhase>('idle');
  const [scanIndex, setScanIndex] = useState(0);
  const [scanTotal, setScanTotal] = useState(0);
  const [scanCardName, setScanCardName] = useState('');
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);
  const [highlightedIds, setHighlightedIds] = useState<Set<string>>(new Set());

  const tickTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const successTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const clearGlowTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(
    () => () => {
      clearTimeout(tickTimerRef.current);
      clearTimeout(successTimerRef.current);
      clearTimeout(clearGlowTimerRef.current);
    },
    [],
  );

  const flatPockets = useMemo(() => {
    const pockets: Card[] = [];
    (ownedCards ?? []).forEach((card) => {
      for (let i = 0; i < card.quantity; i++) pockets.push(card);
    });
    return pockets;
  }, [ownedCards]);

  const startScan = () => setScanPhase('confirm');
  const cancelScan = () => setScanPhase('idle');

  // Purely cosmetic — cycles through pockets while the real refresh request is in flight, since
  // its duration depends on the API (near-instant once card ids are cached, slower on first run).
  const tick = (pockets: Card[], index: number) => {
    tickTimerRef.current = setTimeout(() => {
      const next = (index + 1) % pockets.length;
      setScanIndex(next);
      setScanCardName(pockets[next].name);
      tick(pockets, next);
    }, SCAN_TICK_MS);
  };

  const showResult = (result: ScanResult, changedIds: string[]) => {
    setScanResult(result);
    setHighlightedIds(new Set(changedIds));
    setScanPhase('success');

    successTimerRef.current = setTimeout(() => {
      setScanPhase('idle');
      clearGlowTimerRef.current = setTimeout(() => setHighlightedIds(new Set()), SUCCESS_DISPLAY_MS);
    }, SUCCESS_DISPLAY_MS);
  };

  const confirmScan = async () => {
    const previousPrices = new Map((ownedCards ?? []).map((card) => [card.id, card.price]));

    setScanError(null);
    setScanPhase('scanning');
    setScanIndex(0);
    setScanTotal(flatPockets.length);
    setScanCardName(flatPockets[0]?.name ?? '');
    tick(flatPockets, 0);

    try {
      await refreshPrices.mutateAsync();
      const refreshedCards = await getOwnedCards();
      clearTimeout(tickTimerRef.current);

      let up = 0;
      let down = 0;
      let unchanged = 0;
      const changedIds: string[] = [];

      refreshedCards.forEach((card) => {
        const previousPrice = previousPrices.get(card.id) ?? null;
        const newPrice = card.price;

        if (newPrice == null || previousPrice === newPrice) {
          unchanged++;
        } else if (previousPrice == null || newPrice > previousPrice + 0.004) {
          up++;
          changedIds.push(card.id);
        } else if (newPrice < previousPrice - 0.004) {
          down++;
          changedIds.push(card.id);
        } else {
          unchanged++;
        }
      });

      showResult({ total: refreshedCards.length, up, down, unchanged }, changedIds);
    } catch {
      clearTimeout(tickTimerRef.current);
      setScanPhase('idle');
      setScanError('Failed to refresh prices. Check that the API is running and try again.');
    }
  };

  const totalOwned = flatPockets.length;
  const totalPages = Math.max(1, Math.ceil(totalOwned / POCKETS_PER_PAGE));
  const currentPage = Math.min(page, totalPages - 1);
  const start = currentPage * POCKETS_PER_PAGE;
  const visiblePockets = flatPockets.slice(start, start + POCKETS_PER_PAGE);

  const slots: Array<{ card: Card | null; slotLabel: string }> = Array.from({ length: POCKETS_PER_PAGE }, (_, i) => ({
    card: visiblePockets[i] ?? null,
    slotLabel: String(start + i + 1).padStart(2, '0'),
  }));

  if (isLoading) {
    return (
      <div className="page page-narrow">
        <div className={`blueprint ${styles.loadingPanel}`}>
          <i className="corner tl" />
          <i className="corner tr" />
          <i className="corner bl" />
          <i className="corner br" />
          <div className="card-kicker">Binder</div>
          <p className={styles.loadingText}>
            LOADING BINDER<span className={styles.loadingCursor}>_</span>
          </p>
          <div className={styles.loadingBar}>
            <div className={styles.loadingBarFill} />
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="page page-narrow">
        <div className={`blueprint ${styles.errorPanel}`}>
          <i className="corner tl" />
          <i className="corner tr" />
          <i className="corner bl" />
          <i className="corner br" />
          <div className="card-kicker">Binder</div>
          <h3 className={styles.errorTitle}>Connection lost</h3>
          <p className={`card-body ${styles.errorBody}`}>Couldn't reach the catalog service. Check that the API is running and try again.</p>
        </div>
      </div>
    );
  }

  if (totalOwned === 0) {
    return (
      <div className="page page-narrow">
        <div className={`blueprint ${styles.emptyPanel}`}>
          <i className="corner tl" />
          <i className="corner tr" />
          <i className="corner bl" />
          <i className="corner br" />
          <div className="card-kicker">Binder</div>
          <h3 className={styles.emptyTitle}>No specimens catalogued yet</h3>
          <p className={`card-body ${styles.emptyBody}`}>
            Search the field catalog and add specimens — they'll fill this binder automatically.
          </p>
          <Link to="/" className={`btn btn-primary blueprint ${styles.emptyCta}`}>
            <i className="corner tl" />
            <i className="corner tr" />
            <i className="corner bl" />
            <i className="corner br" />
            Go to search
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14" />
              <path d="m12 5 7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page page-narrow">
      <div className={styles.toolbar}>
        <div>
          <div className="card-kicker">Binder</div>
          <h2 className={styles.toolbarHeading}>{totalOwned} specimens catalogued</h2>
        </div>
        <button type="button" className="btn btn-primary blueprint" onClick={startScan}>
          <i className="corner tl" />
          <i className="corner tr" />
          <i className="corner bl" />
          <i className="corner br" />
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
            <path d="M11 8v3M11 14v.01" />
          </svg>
          Scan prices
        </button>
      </div>

      {scanError && <p className="text-error">{scanError}</p>}

      <div className={styles.binderFrame}>
        <div className={`blueprint ${styles.binderPanel}`}>
          <i className="corner tl" />
          <i className="corner tr" />
          <i className="corner bl" />
          <i className="corner br" />
          <div className={styles.ringHoles}>
            {Array.from({ length: RING_HOLES }, (_, i) => (
              <span key={i} className={styles.ringHole} />
            ))}
          </div>
          <div className={styles.pocketGrid}>
            {slots.map((slot, i) => {
              const card = slot.card;
              if (!card) {
                return (
                  <div key={`empty-${i}`} className={styles.emptyPocket}>
                    <span className={styles.emptyPocketLabel}>{slot.slotLabel}</span>
                  </div>
                );
              }
              const displayPrice = card.price;
              return (
                <div key={`${card.id}-${i}`} className={styles.pocket}>
                  <div className={`blueprint ${styles.priceTag} ${highlightedIds.has(card.id) ? styles.priceTagGlow : ''}`}>
                    <i className="corner tl" />
                    <i className="corner tr" />
                    <i className="corner bl" />
                    <i className="corner br" />
                    <span className={styles.priceTagText}>{displayPrice != null ? `$${displayPrice.toFixed(2)}` : '—'}</span>
                  </div>
                  <div className={`duotone ${styles.pocketArt}`}>
                    {card.imageUrl ? <img src={card.imageUrl} alt={card.name} className="cover-image" /> : 'Art'}
                  </div>
                  <button
                    type="button"
                    className={`btn btn-secondary btn-icon ${styles.removeBtn}`}
                    aria-label="Remove one"
                    onClick={() => decrementQuantity.mutate(card.id)}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14" />
                    </svg>
                  </button>
                  <span className={styles.pocketLabel}>{card.cardNumber}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className={styles.pager}>
        <button type="button" className="btn btn-ghost" onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={currentPage <= 0}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="m15 18-6-6 6-6" />
          </svg>
          Prev
        </button>
        <span className={styles.pagerLabel}>
          Page {String(currentPage + 1).padStart(2, '0')} / {String(totalPages).padStart(2, '0')}
        </span>
        <button type="button" className="btn btn-ghost" onClick={() => setPage((p) => p + 1)} disabled={currentPage >= totalPages - 1}>
          Next
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="m9 18 6-6-6-6" />
          </svg>
        </button>
      </div>

      {scanPhase === 'confirm' && (
        <div className={styles.overlay}>
          <div className={`blueprint ${styles.modal}`}>
            <i className="corner tl" />
            <i className="corner tr" />
            <i className="corner bl" />
            <i className="corner br" />
            <div className="card-kicker">Price scan</div>
            <h3 className={styles.modalTitle}>Scan prices from external source?</h3>
            <p className={`card-body ${styles.modalBody}`}>
              This checks the latest market price for all {totalOwned} cards in your binder.
            </p>
            <div className={styles.modalActions}>
              <button type="button" className="btn btn-ghost" onClick={cancelScan}>
                Cancel
              </button>
              <button type="button" className="btn btn-primary blueprint" onClick={confirmScan}>
                <i className="corner tl" />
                <i className="corner tr" />
                <i className="corner bl" />
                <i className="corner br" />
                Confirm scan
              </button>
            </div>
          </div>
        </div>
      )}

      {scanPhase === 'scanning' && (
        <div className={`${styles.overlay} ${styles.overlayDark}`}>
          <div className={`blueprint ${styles.modal}`}>
            <i className="corner tl" />
            <i className="corner tr" />
            <i className="corner bl" />
            <i className="corner br" />
            <div className="card-kicker">Price scan</div>
            <div className={styles.scanCounter}>
              Scanning {Math.min(scanIndex + 1, scanTotal)} / {scanTotal}
              <span className={styles.scanCursor}>_</span>
            </div>
            <p className={`card-body ${styles.scanSubtext}`}>Checking {scanCardName}…</p>
            <div className={styles.progressTrack}>
              <div
                className={styles.progressFill}
                style={{ width: `${scanTotal > 0 ? Math.round(((scanIndex + 1) / scanTotal) * 100) : 0}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {scanPhase === 'success' && scanResult && (
        <div className={`${styles.overlay} ${styles.overlayDark}`}>
          <div className={`blueprint ${styles.modal}`}>
            <i className="corner tl" />
            <i className="corner tr" />
            <i className="corner bl" />
            <i className="corner br" />
            <div className={styles.checkBadge}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12l5 5L20 7" />
              </svg>
            </div>
            <div className="card-kicker">Scan complete</div>
            <h3 className={styles.successTitle}>{scanResult.total} prices updated</h3>
            <div className={styles.resultTags}>
              <span className="tag tag-accent">▲ {scanResult.up} up</span>
              <span className="tag tag-accent-2">▼ {scanResult.down} down</span>
              <span className="tag tag-outline">= {scanResult.unchanged} unchanged</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

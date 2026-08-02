import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { getOwnedCards } from '../api/cards';
import { useDecrementCardQuantity, useDeleteCard, useOwnedCards, useRefreshPrices } from '../hooks/useCards';
import type { Card } from '../types/card';
import styles from './BinderPage.module.css';

const POCKETS_PER_PAGE = 9;
const RING_HOLES = 6;
const SUCCESS_DISPLAY_MS = 1900;
const LONG_PRESS_MS = 550;
const TOAST_DURATION_MS = 6000;
const TOAST_TICK_MS = 100;
const MENU_WIDTH = 208;
const MENU_HEIGHT = 140;

type ScanPhase = 'idle' | 'confirm' | 'scanning' | 'success';

interface ScanResult {
  total: number;
  up: number;
  down: number;
  unchanged: number;
}

interface MenuState {
  card: Card;
  x: number;
  y: number;
}

interface ToastState {
  card: Card;
  progress: number;
}

export function BinderPage() {
  const { data: ownedCards, isLoading, isError } = useOwnedCards();
  const decrementQuantity = useDecrementCardQuantity();
  const refreshPrices = useRefreshPrices();
  const deleteCard = useDeleteCard();
  const [page, setPage] = useState(0);
  const [menu, setMenu] = useState<MenuState | null>(null);
  const [toast, setToast] = useState<ToastState | null>(null);

  const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const toastIntervalRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);
  const pendingDeleteRef = useRef<{ id: string; quantity: number } | null>(null);
  const deleteCardRef = useRef(deleteCard);
  const decrementQuantityRef = useRef(decrementQuantity);

  useEffect(() => {
    deleteCardRef.current = deleteCard;
  }, [deleteCard]);

  useEffect(() => {
    decrementQuantityRef.current = decrementQuantity;
  }, [decrementQuantity]);

  // A stack of duplicates is one Card record with a quantity field, so removing a single
  // pocket must decrement the count rather than delete the whole record (which would take
  // every duplicate with it). Only the last copy actually hits the hard-delete endpoint.
  const commitPendingDelete = useCallback((pending: { id: string; quantity: number }) => {
    if (pending.quantity > 1) {
      decrementQuantityRef.current.mutate(pending.id);
    } else {
      deleteCardRef.current.mutate(pending.id);
    }
  }, []);

  useEffect(() => {
    return () => {
      clearTimeout(longPressTimerRef.current);
      clearInterval(toastIntervalRef.current);
      // Navigating away (this page unmounts on route change) must not silently drop a
      // delete that's already been shown to the user as done — commit it instead of losing it.
      if (pendingDeleteRef.current) {
        commitPendingDelete(pendingDeleteRef.current);
        pendingDeleteRef.current = null;
      }
    };
  }, [commitPendingDelete]);

  const finalizePendingDelete = useCallback(() => {
    const pending = pendingDeleteRef.current;
    if (pending) {
      clearInterval(toastIntervalRef.current);
      pendingDeleteRef.current = null;
      commitPendingDelete(pending);
    }
    setToast(null);
  }, [commitPendingDelete]);

  const openMenu = useCallback(
    (card: Card, x: number, y: number) => {
      finalizePendingDelete();
      setMenu({
        card,
        x: Math.min(Math.max(x, 8), window.innerWidth - MENU_WIDTH),
        y: Math.min(Math.max(y, 8), window.innerHeight - MENU_HEIGHT),
      });
    },
    [finalizePendingDelete],
  );

  const closeMenu = useCallback(() => setMenu(null), []);

  const clearLongPress = useCallback(() => clearTimeout(longPressTimerRef.current), []);

  const startLongPress = useCallback(
    (card: Card, x: number, y: number) => {
      clearLongPress();
      longPressTimerRef.current = setTimeout(() => openMenu(card, x, y), LONG_PRESS_MS);
    },
    [clearLongPress, openMenu],
  );

  const handleDeleteCard = useCallback(
    (card: Card) => {
      finalizePendingDelete();
      pendingDeleteRef.current = { id: card.id, quantity: card.quantity };
      setToast({ card, progress: 100 });
      setMenu(null);
      let elapsedMs = 0;
      toastIntervalRef.current = setInterval(() => {
        elapsedMs += TOAST_TICK_MS;
        const progress = Math.max(0, 100 - (100 * elapsedMs) / TOAST_DURATION_MS);
        if (progress <= 0) {
          clearInterval(toastIntervalRef.current);
          const pending = pendingDeleteRef.current;
          pendingDeleteRef.current = null;
          setToast(null);
          if (pending) commitPendingDelete(pending);
          return;
        }
        setToast((current) => (current ? { ...current, progress } : current));
      }, TOAST_TICK_MS);
    },
    [commitPendingDelete, finalizePendingDelete],
  );

  const handleUndo = useCallback(() => {
    clearInterval(toastIntervalRef.current);
    pendingDeleteRef.current = null;
    setToast(null);
  }, []);

  const displayedCards = useMemo(() => {
    const cards = ownedCards ?? [];
    if (!toast) return cards;
    // Only the one pocket being removed should disappear from the preview — not every
    // duplicate of that card — so drop the stack's quantity by one instead of filtering it out.
    return cards
      .map((c) => (c.id === toast.card.id ? { ...c, quantity: c.quantity - 1 } : c))
      .filter((c) => c.quantity > 0);
  }, [ownedCards, toast]);

  const [scanPhase, setScanPhase] = useState<ScanPhase>('idle');
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);
  const [highlightedIds, setHighlightedIds] = useState<Set<string>>(new Set());

  const successTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const clearGlowTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(
    () => () => {
      clearTimeout(successTimerRef.current);
      clearTimeout(clearGlowTimerRef.current);
    },
    [],
  );

  const flatPockets = useMemo(() => {
    const pockets: Card[] = [];
    displayedCards.forEach((card) => {
      for (let i = 0; i < card.quantity; i++) pockets.push(card);
    });
    return pockets;
  }, [displayedCards]);

  const startScan = () => setScanPhase('confirm');
  const cancelScan = () => setScanPhase('idle');

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

    try {
      await refreshPrices.mutateAsync();
      const refreshedCards = await getOwnedCards();

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

  const overlays = (
    <>
      {menu && (
        <>
          <div className={styles.menuBackdrop} onClick={closeMenu} />
          <div className={`blueprint ${styles.contextMenu}`} style={{ left: menu.x, top: menu.y }}>
            <i className="corner tl" />
            <i className="corner tr" />
            <i className="corner bl" />
            <i className="corner br" />
            <div className={styles.contextMenuHeader}>
              <span className="card-kicker">Card options</span>
              <div className={styles.contextMenuCardName}>{menu.card.name}</div>
            </div>
            <button type="button" className={`text-error ${styles.contextMenuItem}`} onClick={() => handleDeleteCard(menu.card)}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 6h18" />
                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                <path d="M10 11v6" />
                <path d="M14 11v6" />
                <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              </svg>
              Delete card
            </button>
          </div>
        </>
      )}
      {toast && (
        <div className={`blueprint ${styles.toast}`}>
          <i className="corner tl" />
          <i className="corner tr" />
          <i className="corner bl" />
          <i className="corner br" />
          <div className={styles.toastRow}>
            <span className={`card-body ${styles.toastText}`}>
              Removed <strong className={styles.toastCardName}>{toast.card.name}</strong> from catalog
            </span>
            <button type="button" className="btn btn-secondary" onClick={handleUndo}>
              Undo
            </button>
          </div>
          <div className={styles.toastBar}>
            <div className={styles.toastBarFill} style={{ width: `${toast.progress}%` }} />
          </div>
        </div>
      )}
    </>
  );

  if (totalOwned === 0 && !toast) {
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
        {overlays}
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
                <div
                  key={`${card.id}-${i}`}
                  className={styles.pocket}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    openMenu(card, e.clientX, e.clientY);
                  }}
                  onPointerDown={(e) => startLongPress(card, e.clientX, e.clientY)}
                  onPointerUp={clearLongPress}
                  onPointerLeave={clearLongPress}
                >
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
                    className={`btn btn-secondary btn-icon ${styles.menuBtn}`}
                    aria-label="Card options"
                    title="Card options"
                    onClick={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      openMenu(card, rect.left, rect.bottom + 6);
                    }}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                      <circle cx="12" cy="5" r="1.8" />
                      <circle cx="12" cy="12" r="1.8" />
                      <circle cx="12" cy="19" r="1.8" />
                    </svg>
                  </button>
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
              This checks the latest market price for all {displayedCards.length} cards in your binder
              {totalOwned > displayedCards.length ? ` (${totalOwned} specimens counting duplicates)` : ''}.
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
              Scanning binder
              <span className={styles.scanCursor}>_</span>
            </div>
            <p className={`card-body ${styles.scanSubtext}`}>Fetching the latest prices — this can take a moment.</p>
            <div className={styles.progressTrack}>
              <div className={styles.progressSweep} />
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

      {overlays}
    </div>
  );
}

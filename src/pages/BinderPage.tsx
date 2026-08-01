import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDecrementCardQuantity, useOwnedCards } from '../hooks/useCards';
import type { Card } from '../types/card';
import styles from './BinderPage.module.css';

const POCKETS_PER_PAGE = 9;
const RING_HOLES = 6;

export function BinderPage() {
  const { data: ownedCards, isLoading, isError } = useOwnedCards();
  const decrementQuantity = useDecrementCardQuantity();
  const [page, setPage] = useState(0);

  const flatPockets = useMemo(() => {
    const pockets: Card[] = [];
    (ownedCards ?? []).forEach((card) => {
      for (let i = 0; i < card.quantity; i++) pockets.push(card);
    });
    return pockets;
  }, [ownedCards]);

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
            {slots.map((slot, i) =>
              slot.card ? (
                <div key={`${slot.card.id}-${i}`} className={styles.pocket}>
                  <div className={`blueprint ${styles.priceTag}`}>
                    <i className="corner tl" />
                    <i className="corner tr" />
                    <i className="corner bl" />
                    <i className="corner br" />
                    <span className={styles.priceTagText}>
                      {slot.card.price != null ? `$${slot.card.price.toFixed(2)}` : '—'}
                    </span>
                  </div>
                  <div className={`duotone ${styles.pocketArt}`}>
                    {slot.card.imageUrl ? (
                      <img src={slot.card.imageUrl} alt={slot.card.name} className="cover-image" />
                    ) : (
                      'Art'
                    )}
                  </div>
                  <button
                    type="button"
                    className={`btn btn-secondary btn-icon ${styles.removeBtn}`}
                    aria-label="Remove one"
                    onClick={() => decrementQuantity.mutate(slot.card!.id)}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14" />
                    </svg>
                  </button>
                  <span className={styles.pocketLabel}>{slot.card.cardNumber}</span>
                </div>
              ) : (
                <div key={`empty-${i}`} className={styles.emptyPocket}>
                  <span className={styles.emptyPocketLabel}>{slot.slotLabel}</span>
                </div>
              ),
            )}
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
    </div>
  );
}

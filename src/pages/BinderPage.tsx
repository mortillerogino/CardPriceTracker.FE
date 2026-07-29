import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDecrementCardQuantity, useOwnedCards } from '../hooks/useCards';
import type { Card } from '../types/card';

const POCKETS_PER_PAGE = 9;
const RING_HOLES = 6;

export function BinderPage() {
  const { data: ownedCards, isLoading } = useOwnedCards();
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
      <div style={{ maxWidth: 900, margin: '0 auto', padding: 'var(--space-8) var(--space-4)' }}>
        <p className="text-muted">Loading binder...</p>
      </div>
    );
  }

  if (totalOwned === 0) {
    return (
      <div style={{ maxWidth: 900, margin: '0 auto', padding: 'var(--space-8) var(--space-4)' }}>
        <div
          className="blueprint"
          style={{ background: 'var(--color-bg)', padding: 'var(--space-8)', textAlign: 'center', maxWidth: 480, margin: '0 auto', border: '1px solid var(--color-divider)' }}
        >
          <i className="corner tl" />
          <i className="corner tr" />
          <i className="corner bl" />
          <i className="corner br" />
          <div className="card-kicker">Binder</div>
          <h3 style={{ margin: '6px 0 var(--space-2)' }}>No specimens catalogued yet</h3>
          <p className="card-body" style={{ maxWidth: '38ch', margin: '0 auto var(--space-4)' }}>
            Search the field catalog and add specimens — they'll fill this binder automatically.
          </p>
          <Link to="/" className="btn btn-primary blueprint" style={{ display: 'inline-flex', textDecoration: 'none' }}>
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
    <div style={{ maxWidth: 900, margin: '0 auto', padding: 'var(--space-8) var(--space-4)' }}>
      <div style={{ background: 'var(--color-accent-900)', padding: 'var(--space-6)' }}>
        <div className="blueprint" style={{ background: 'var(--color-bg)', padding: 'var(--space-6)', display: 'flex', gap: 'var(--space-4)', border: '1px solid var(--color-divider)' }}>
          <i className="corner tl" />
          <i className="corner tr" />
          <i className="corner bl" />
          <i className="corner br" />
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '2px 0' }}>
            {Array.from({ length: RING_HOLES }, (_, i) => (
              <span key={i} style={{ width: 13, height: 13, borderRadius: '50%', border: '1px solid var(--color-divider)', display: 'block' }} />
            ))}
          </div>
          <div style={{ flex: 1, minWidth: 0, display: 'grid', gridTemplateColumns: 'repeat(3,minmax(0,1fr))', gap: 'var(--space-3)' }}>
            {slots.map((slot, i) =>
              slot.card ? (
                <div key={`${slot.card.id}-${i}`} style={{ position: 'relative', aspectRatio: '3 / 4' }}>
                  <div className="duotone" style={{ width: '100%', height: '100%', border: '1px solid var(--color-divider)' }}>
                    {slot.card.imageUrl ? (
                      <img src={slot.card.imageUrl} alt={slot.card.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      'Art'
                    )}
                  </div>
                  <button
                    type="button"
                    className="btn btn-secondary btn-icon"
                    aria-label="Remove one"
                    onClick={() => decrementQuantity.mutate(slot.card!.id)}
                    style={{ position: 'absolute', top: 4, right: 4, width: 22, height: 22, background: 'var(--color-bg)' }}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14" />
                    </svg>
                  </button>
                  <span
                    style={{
                      position: 'absolute',
                      bottom: 3,
                      left: 4,
                      fontSize: 9,
                      letterSpacing: '0.04em',
                      color: '#fff',
                      textShadow: '0 0 3px rgba(0,0,0,0.6)',
                    }}
                  >
                    {slot.card.cardNumber}
                  </span>
                </div>
              ) : (
                <div
                  key={`empty-${i}`}
                  style={{ aspectRatio: '3 / 4', border: '1px dashed var(--color-neutral-400)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <span style={{ fontFamily: 'var(--font-heading)', fontSize: 11, letterSpacing: '0.05em', color: 'var(--color-neutral-500)' }}>{slot.slotLabel}</span>
                </div>
              ),
            )}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-4)', marginTop: 'var(--space-4)' }}>
        <button type="button" className="btn btn-ghost" onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={currentPage <= 0}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="m15 18-6-6 6-6" />
          </svg>
          Prev
        </button>
        <span style={{ fontFamily: 'var(--font-heading)', letterSpacing: '0.08em', fontSize: 12, textTransform: 'uppercase' }}>
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

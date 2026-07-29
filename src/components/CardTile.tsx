import type { Card } from '../types/card';

interface CardTileProps {
  card: Card;
  onAdd: (id: string) => void;
  isPulsing: boolean;
}

export function CardTile({ card, onAdd, isPulsing }: CardTileProps) {
  return (
    <div className="card blueprint elev-sm" style={{ padding: 0, overflow: 'visible' }}>
      <i className="corner tl" />
      <i className="corner tr" />
      <i className="corner bl" />
      <i className="corner br" />
      <div className="duotone" style={{ width: '100%', aspectRatio: '3 / 4' }}>
        No art
      </div>
      <div style={{ padding: 'var(--space-3)', display: 'flex', flexDirection: 'column', gap: 6 }}>
        <span className="card-kicker">{card.cardNumber}</span>
        <div className="card-title">{card.name}</div>
        <p className="card-body" style={{ margin: 0 }}>
          {card.setName}
        </p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8, marginTop: 6 }}>
          {card.quantity > 0 && <span className="tag tag-outline">×{card.quantity} in binder</span>}
          <button
            type="button"
            className={`btn btn-primary btn-icon blueprint${isPulsing ? ' pulse-add' : ''}`}
            aria-label="Add to binder"
            onClick={() => onAdd(card.id)}
          >
            <i className="corner tl" />
            <i className="corner tr" />
            <i className="corner bl" />
            <i className="corner br" />
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14" />
              <path d="M12 5v14" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

const RARITY_TAG_CLASS: Record<string, string> = {
  common: 'tag-neutral',
  uncommon: 'tag-outline',
  rare: 'tag-accent',
  epic: 'tag-accent-2',
};

interface CardTileProps {
  name: string;
  setName: string;
  cardNumber: string;
  imageUrl: string | null;
  rarity: string | null;
  quantity: number;
  onAdd: () => void;
  isPulsing: boolean;
}

export function CardTile({ name, setName, cardNumber, imageUrl, rarity, quantity, onAdd, isPulsing }: CardTileProps) {
  const rarityTagClass = rarity ? (RARITY_TAG_CLASS[rarity.toLowerCase()] ?? 'tag-neutral') : null;

  return (
    <div className="card blueprint elev-sm" style={{ padding: 0, overflow: 'visible' }}>
      <i className="corner tl" />
      <i className="corner tr" />
      <i className="corner bl" />
      <i className="corner br" />
      <div className="duotone" style={{ width: '100%', aspectRatio: '3 / 4' }}>
        {imageUrl ? (
          <img src={imageUrl} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          'No art'
        )}
      </div>
      <div style={{ padding: 'var(--space-3)', display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
          <span className="card-kicker">{cardNumber}</span>
          {rarity && <span className={`tag ${rarityTagClass}`}>{rarity}</span>}
        </div>
        <div className="card-title">{name}</div>
        <p className="card-body" style={{ margin: 0 }}>
          {setName}
        </p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8, marginTop: 6 }}>
          {quantity > 0 && <span className="tag tag-outline">×{quantity} in binder</span>}
          <button
            type="button"
            className={`btn btn-primary btn-icon blueprint${isPulsing ? ' pulse-add' : ''}`}
            aria-label="Add to binder"
            onClick={onAdd}
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

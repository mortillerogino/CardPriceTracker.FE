import styles from './CardTile.module.css';

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
  justAdded: boolean;
}

export function CardTile({ name, setName, cardNumber, imageUrl, rarity, quantity, onAdd, justAdded }: CardTileProps) {
  const rarityTagClass = rarity ? (RARITY_TAG_CLASS[rarity.toLowerCase()] ?? 'tag-neutral') : null;

  return (
    <div className={`card blueprint elev-sm ${styles.root}`}>
      <i className="corner tl" />
      <i className="corner tr" />
      <i className="corner bl" />
      <i className="corner br" />
      <div className={`duotone ${styles.art}`}>
        {imageUrl ? <img src={imageUrl} alt={name} className="cover-image" /> : 'No art'}
      </div>
      <div className={styles.info}>
        <div className={styles.infoTop}>
          <span className="card-kicker">
            {setName} · {cardNumber}
          </span>
          {rarity && <span className={`tag ${rarityTagClass}`}>{rarity}</span>}
        </div>
        <div className="card-title">{name}</div>
        <div className={styles.actions}>
          {quantity > 0 && <span className={`tag tag-outline${justAdded ? ' pulse-add' : ''}`}>×{quantity} in binder</span>}
          <button
            type="button"
            className={`btn btn-primary btn-icon blueprint${justAdded ? ' add-success' : ''}`}
            aria-label={justAdded ? 'Added to binder' : 'Add to binder'}
            onClick={onAdd}
          >
            <i className="corner tl" />
            <i className="corner tr" />
            <i className="corner bl" />
            <i className="corner br" />
            {justAdded ? (
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12l5 5L20 7" />
              </svg>
            ) : (
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14" />
                <path d="M12 5v14" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

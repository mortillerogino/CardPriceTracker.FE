import { useState } from 'react';
import { CardForm } from '../components/CardForm';
import { CardTile } from '../components/CardTile';
import { useCards, useCreateCard, useIncrementCardQuantity } from '../hooks/useCards';

export function SearchPage() {
  const [query, setQuery] = useState('');
  const { data: cards, isLoading, isError } = useCards(query);
  const createCard = useCreateCard();
  const incrementQuantity = useIncrementCardQuantity();
  const [pulsingId, setPulsingId] = useState<string | null>(null);

  function handleAdd(id: string) {
    incrementQuantity.mutate(id);
    setPulsingId(id);
    window.setTimeout(() => setPulsingId(null), 600);
  }

  return (
    <div style={{ maxWidth: 1180, margin: '0 auto', padding: 'var(--space-8) var(--space-4)' }}>
      <div className="field" style={{ maxWidth: 420, marginBottom: 'var(--space-6)' }}>
        <label htmlFor="search-input">Search specimens</label>
        <div style={{ position: 'relative' }}>
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', opacity: 0.5, pointerEvents: 'none' }}
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <input
            id="search-input"
            className="input"
            placeholder="Search by name or catalog no."
            style={{ paddingLeft: 34 }}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      {isLoading && <p className="text-muted">Loading catalog...</p>}
      {isError && <p style={{ color: '#e5484d' }}>Failed to load cards. Is the API running?</p>}

      {cards && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: 'var(--space-4)' }}>
          {cards.map((card) => (
            <CardTile key={card.id} card={card} onAdd={handleAdd} isPulsing={pulsingId === card.id} />
          ))}
        </div>
      )}

      {cards && cards.length === 0 && !isLoading && (
        <p className="text-muted" style={{ marginTop: 'var(--space-6)' }}>
          No specimens match that search.
        </p>
      )}

      <h2 style={{ marginTop: 'var(--space-8)' }}>Add to catalog</h2>
      <CardForm onSubmit={(input) => createCard.mutate(input)} isSubmitting={createCard.isPending} />
      {createCard.isError && <p style={{ color: '#e5484d' }}>Failed to add card. Check the fields and try again.</p>}
    </div>
  );
}

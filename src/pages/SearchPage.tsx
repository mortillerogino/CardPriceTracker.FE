import { useState } from 'react';
import type { FormEvent } from 'react';
import { CardTile } from '../components/CardTile';
import { useAddFromCatalog, useCatalogSearch } from '../hooks/useCards';

export function SearchPage() {
  const [query, setQuery] = useState('');
  const [submittedQuery, setSubmittedQuery] = useState('');
  const { data: results, isLoading, isError, isFetching } = useCatalogSearch(submittedQuery);
  const addFromCatalog = useAddFromCatalog();
  const [pulsingId, setPulsingId] = useState<string | null>(null);

  function handleAdd(externalId: string, name: string, setName: string, cardNumber: string, imageUrl: string | null) {
    addFromCatalog.mutate({ name, setName, cardNumber, imageUrl });
    setPulsingId(externalId);
    window.setTimeout(() => setPulsingId(null), 600);
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSubmittedQuery(query);
  }

  const showTooShortHint = submittedQuery.trim().length > 0 && submittedQuery.trim().length < 5;

  return (
    <div style={{ maxWidth: 1180, margin: '0 auto', padding: 'var(--space-8) var(--space-4)' }}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'flex-end', maxWidth: 500, marginBottom: 'var(--space-6)' }}>
        <div className="field" style={{ flex: 1 }}>
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
        <button type="submit" className="btn btn-primary blueprint">
          <i className="corner tl" />
          <i className="corner tr" />
          <i className="corner bl" />
          <i className="corner br" />
          Search
        </button>
      </form>

      {showTooShortHint && <p className="text-muted">Enter at least 5 characters to search.</p>}
      {(isLoading || isFetching) && submittedQuery.trim().length >= 5 && <p className="text-muted">Searching catalog...</p>}
      {isError && <p style={{ color: '#e5484d' }}>Failed to search the catalog. Is the API running?</p>}

      {results && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: 'var(--space-4)' }}>
          {results.map((result) => (
            <CardTile
              key={result.externalId}
              name={result.name}
              setName={result.setName}
              cardNumber={result.cardNumber}
              imageUrl={result.imageUrl}
              rarity={result.rarity}
              quantity={result.ownedQuantity}
              onAdd={() => handleAdd(result.externalId, result.name, result.setName, result.cardNumber, result.imageUrl)}
              isPulsing={pulsingId === result.externalId}
            />
          ))}
        </div>
      )}

      {results && results.length === 0 && !isLoading && !isFetching && submittedQuery.trim().length >= 5 && (
        <p className="text-muted" style={{ marginTop: 'var(--space-6)' }}>
          No specimens match that search.
        </p>
      )}

      {addFromCatalog.isError && <p style={{ color: '#e5484d', marginTop: 'var(--space-4)' }}>Failed to add card. Please try again.</p>}
    </div>
  );
}

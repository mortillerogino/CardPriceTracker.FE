import { useState } from 'react';
import type { FormEvent, KeyboardEvent } from 'react';
import { CardTile } from '../components/CardTile';
import { useAddFromCatalog, useCatalogSearch, useCatalogSets } from '../hooks/useCards';

export function SearchPage() {
  const { data: sets } = useCatalogSets();
  const [query, setQuery] = useState('');
  const [setId, setSetId] = useState('');
  const [submittedQuery, setSubmittedQuery] = useState('');
  const [submittedSetId, setSubmittedSetId] = useState('');
  const [submittedSetName, setSubmittedSetName] = useState('');
  const [searched, setSearched] = useState(false);

  const { data: results, isLoading, isError, isFetching } = useCatalogSearch(submittedQuery, submittedSetId);
  const addFromCatalog = useAddFromCatalog();
  const [pulsingId, setPulsingId] = useState<string | null>(null);

  const canSearch = query.trim().length > 0 && setId.trim().length > 0;
  const showResults = searched && canSearch;

  function handleAdd(externalId: string, name: string, setName: string, cardNumber: string, imageUrl: string | null) {
    addFromCatalog.mutate({ name, setName, cardNumber, imageUrl });
    setPulsingId(externalId);
    window.setTimeout(() => setPulsingId(null), 600);
  }

  function submitSearch() {
    if (!canSearch) return;
    setSubmittedQuery(query);
    setSubmittedSetId(setId);
    setSubmittedSetName(sets?.find((s) => s.setId === setId)?.name ?? setId);
    setSearched(true);
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    submitSearch();
  }

  function handleQueryChange(value: string) {
    setQuery(value);
    setSearched(false);
  }

  function handleSetChange(value: string) {
    setSetId(value);
    setSearched(false);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Enter' && canSearch) {
      submitSearch();
    }
  }

  const resultsLabel = showResults && results && results.length > 0 ? `${results.length} RESULT${results.length === 1 ? '' : 'S'}` : 'RESULTS';

  return (
    <div style={{ maxWidth: 1180, margin: '0 auto', padding: 'var(--space-8) var(--space-4)' }}>
      <div style={{ fontFamily: 'var(--font-heading)', fontSize: 11, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--color-neutral-500)', marginBottom: 10 }}>
        Search specimens
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'stretch', maxWidth: 900 }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-neutral-500)', pointerEvents: 'none' }}
          >
            <circle cx="11" cy="11" r="7" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            className="input"
            placeholder="Search by name or catalog no."
            style={{ paddingLeft: 34 }}
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </div>

        <div style={{ position: 'relative', width: 200, flexShrink: 0 }}>
          <select
            className="input"
            value={setId}
            onChange={(e) => handleSetChange(e.target.value)}
            style={{ appearance: 'none', WebkitAppearance: 'none', cursor: 'pointer', paddingRight: 30, color: setId ? 'var(--color-text)' : 'var(--color-neutral-500)' }}
          >
            <option value="" disabled>
              Select a set…
            </option>
            {(sets ?? []).map((s) => (
              <option key={s.setId} value={s.setId}>
                {s.name}
              </option>
            ))}
          </select>
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            style={{ position: 'absolute', right: 11, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-accent)', pointerEvents: 'none' }}
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>

        <button
          type="submit"
          className="btn btn-primary blueprint"
          disabled={!canSearch}
          title={canSearch ? '' : 'Select a set and enter a search term'}
          style={{ flexShrink: 0, padding: '0 20px' }}
        >
          <i className="corner tl" />
          <i className="corner tr" />
          <i className="corner bl" />
          <i className="corner br" />
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <circle cx="11" cy="11" r="7" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          Search
        </button>
      </form>

      <p style={{ marginTop: 8, fontSize: 12, color: 'var(--color-neutral-500)', maxWidth: 900 }}>A set is required — narrow your search to one set at a time.</p>

      {(isLoading || isFetching) && showResults && <p className="text-muted">Searching catalog...</p>}
      {isError && <p style={{ color: '#e5484d' }}>Failed to search the catalog. Is the API running?</p>}

      {showResults && (
        <div style={{ marginTop: 'var(--space-8)', maxWidth: 900 }}>
          <div style={{ fontFamily: 'var(--font-heading)', fontSize: 11, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--color-neutral-500)', marginBottom: 14 }}>
            {resultsLabel}
          </div>

          {results && results.length > 0 && (
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

          {results && results.length === 0 && !isLoading && !isFetching && (
            <div className="card" style={{ padding: 'var(--space-4)', color: 'var(--color-neutral-500)', fontSize: 13 }}>
              No specimens matched "{submittedQuery}" in {submittedSetName}.
            </div>
          )}
        </div>
      )}

      {addFromCatalog.isError && <p style={{ color: '#e5484d', marginTop: 'var(--space-4)' }}>Failed to add card. Please try again.</p>}
    </div>
  );
}

import { useState } from 'react';
import type { FormEvent, KeyboardEvent } from 'react';
import { CardTile } from '../components/CardTile';
import { useAddFromCatalog, useCatalogSearch, useCatalogSets } from '../hooks/useCards';
import styles from './SearchPage.module.css';

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
    <div className="page page-wide">
      <div className={styles.label}>Search specimens</div>

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.queryWrap}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={styles.queryIcon}>
            <circle cx="11" cy="11" r="7" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            className={`input ${styles.queryInput}`}
            placeholder="Search by name or catalog no."
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </div>

        <div className={styles.setSelectWrap}>
          <select
            className={`input ${styles.setSelect} ${setId ? styles.setSelectFilled : styles.setSelectPlaceholder}`}
            value={setId}
            onChange={(e) => handleSetChange(e.target.value)}
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
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={styles.setChevron}>
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>

        <button
          type="submit"
          className={`btn btn-primary blueprint ${styles.submit}`}
          disabled={!canSearch}
          title={canSearch ? '' : 'Select a set and enter a search term'}
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

      <p className={styles.hint}>A set is required — narrow your search to one set at a time.</p>

      {(isLoading || isFetching) && showResults && <p className="text-muted">Searching catalog...</p>}
      {isError && <p className="text-error">Failed to search the catalog. Is the API running?</p>}

      {showResults && (
        <div className={styles.results}>
          <div className={styles.resultsLabel}>{resultsLabel}</div>

          {results && results.length > 0 && (
            <div className={styles.resultsGrid}>
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
            <div className={`card ${styles.noResults}`}>
              No specimens matched "{submittedQuery}" in {submittedSetName}.
            </div>
          )}
        </div>
      )}

      {addFromCatalog.isError && <p className={`text-error ${styles.addError}`}>Failed to add card. Please try again.</p>}
    </div>
  );
}

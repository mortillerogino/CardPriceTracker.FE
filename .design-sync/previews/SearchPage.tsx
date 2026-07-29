import { SearchPage } from '../../src/pages/SearchPage';

// SearchPage only shows results once a query is submitted and the catalog
// API responds — no backend is reachable from a static preview, so this
// captures the real default (empty) state a user sees before searching.
export function Default() {
  return <SearchPage />;
}

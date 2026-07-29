import { MemoryRouter } from 'react-router-dom';
import { BinderPage } from '../../src/pages/BinderPage';

// No backend is reachable from a static preview, so the owned-cards query
// always resolves empty — this renders BinderPage's real "no specimens yet"
// state, which is itself a legitimate state the app ships.
export function Empty() {
  return (
    <MemoryRouter>
      <BinderPage />
    </MemoryRouter>
  );
}

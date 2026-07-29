import { Outlet } from 'react-router-dom';

export function MainLayout() {
  return (
    <div className="app-shell">
      <header className="app-header">
        <h1>CardPriceTracker</h1>
      </header>
      <main className="app-main">
        <Outlet />
      </main>
    </div>
  );
}

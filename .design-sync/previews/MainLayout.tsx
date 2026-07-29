import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { MainLayout } from '../../src/layouts/MainLayout';
import { SearchPage } from '../../src/pages/SearchPage';
import { BinderPage } from '../../src/pages/BinderPage';

function Shell({ path }: { path: string }) {
  return (
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route element={<MainLayout />}>
          <Route index element={<SearchPage />} />
          <Route path="/binder" element={<BinderPage />} />
        </Route>
      </Routes>
    </MemoryRouter>
  );
}

export function SearchTab() {
  return <Shell path="/" />;
}

export function BinderTab() {
  return <Shell path="/binder" />;
}

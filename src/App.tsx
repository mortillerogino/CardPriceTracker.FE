import { Route, Routes } from 'react-router-dom';
import { MainLayout } from './layouts/MainLayout';
import { SearchPage } from './pages/SearchPage';
import { BinderPage } from './pages/BinderPage';

function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<SearchPage />} />
        <Route path="/binder" element={<BinderPage />} />
      </Route>
    </Routes>
  );
}

export default App;

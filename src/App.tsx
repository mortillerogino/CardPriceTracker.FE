import { Route, Routes } from 'react-router-dom';
import './App.css';
import { MainLayout } from './layouts/MainLayout';
import { CardsPage } from './pages/CardsPage';

function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<CardsPage />} />
      </Route>
    </Routes>
  );
}

export default App;

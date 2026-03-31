import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import OpeningPage from './pages/OpeningPage';
import Statistics from './pages/Statistics';
import Settings from './pages/Settings';
import Mistakes from './pages/Mistakes';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/openings/:openingId" element={<OpeningPage />} />
          <Route path="/stats" element={<Statistics />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/mistakes" element={<Mistakes />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

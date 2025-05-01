import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HomePage } from './pages/Home.page';

export function Router() {
  return (
    <BrowserRouter basename="/create-daily-report">
      <Routes>
        <Route path="/" element={<HomePage />} />
      </Routes>
    </BrowserRouter>
  );
}

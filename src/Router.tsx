import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { HomePage } from './UI/useable-components/pages/Home.page';

export function Router() {
  return (
    <BrowserRouter basename="/create-daily-report">
      <Routes>
        <Route path="/" element={<HomePage />} />
      </Routes>
    </BrowserRouter>
  );
}

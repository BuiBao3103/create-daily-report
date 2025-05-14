import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { HomePage } from './pages/Home.page';
import ChatPage from './pages/Chat.page';

export function Router() {
  return (
    <BrowserRouter basename="/create-daily-report">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/chat-ai" element={<ChatPage />} />
      </Routes>
    </BrowserRouter>
  );
}

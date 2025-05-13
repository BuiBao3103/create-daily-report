import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { HomePage } from './UI/useable-components/pages/Home.page';
import ChatPage from './UI/useable-components/pages/Chat.page';

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

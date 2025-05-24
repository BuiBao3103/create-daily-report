import { BrowserRouter, Route, Routes } from 'react-router-dom';
import React, { Suspense, lazy } from 'react';

// Lazy load pages
const HomePage = lazy(() => import('./pages/home/Home.page'));
const ChatPage = lazy(() => import('./pages/Chat.page'));

export function Router() {
  return (
    <BrowserRouter basename="/create-daily-report">
      <Suspense fallback={<div>Loading...</div>}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/chat-ai" element={<ChatPage />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

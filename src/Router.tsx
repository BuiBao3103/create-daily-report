import { Route, Routes } from 'react-router-dom';
import React, { lazy, Suspense } from 'react';
import { LoadingOverlay } from '@mantine/core';
import MyLoader from './components/Loader/MyLoader';


// Lazy load pages
const HomePage = lazy(() => import('./pages/home/Home.page'));
const ChatPage = lazy(() => import('./pages/chat/Chat.page'));

export function Router() {
    return (
        <Suspense
            fallback={
                <LoadingOverlay
                    visible
                    zIndex={1000}
                    overlayProps={{ radius: 'sm', blur: 2 }}
                    loaderProps={{ children: <MyLoader />, size: 'xl' }}
                />
            }
        >
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/chat-ai" element={<ChatPage />} />
            </Routes>
        </Suspense>
    );
}










// loading page simulator
// const lazyWithDelay = (importFunc: () => Promise<any>, delay: number = 5000) => {
//     return React.lazy(() =>
//         new Promise(resolve => {
//             setTimeout(() => {
//                 resolve(importFunc());
//             }, delay);
//         })
//     );
// };

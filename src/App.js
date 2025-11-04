// src/App.js

import React from 'react';
import { Routes, Route } from 'react-router-dom';

// ⭐️ 공통 레이아웃
import Layout from './components/Layout';

// ⭐️ 페이지 컴포넌트들
import TranslatePage from './pages/TranslatePage';
import ResultsPage from './pages/ResultsPage';
import AuthCallbackPage from './pages/AuthCallbackPage'; // ⭐️ 신규
import MyPage from './pages/MyPage'; // ⭐️ 신규

function App() {
  return (
    <Routes>
      {/* ⭐️ Layout이 헤더를 포함하고, 그 안의 <Outlet>에 페이지가 렌더링됨 */}
      <Route path="/" element={<Layout />}>
        <Route index element={<TranslatePage />} />
        <Route path="results" element={<ResultsPage />} />
        <Route path="mypage" element={<MyPage />} />
        
        {/* TODO: 구독 플랜 페이지 (Screen 6) */}
        {/* <Route path="plans" element={<PlansPage />} /> */}
      </Route>

      {/* ⭐️ 헤더(Layout)가 없는 특수 페이지 */}
      <Route path="/auth/callback" element={<AuthCallbackPage />} />

      {/* ⭐️ 404 페이지 */}
      {/* <Route path="*" element={<NotFoundPage />} /> */}
    </Routes>
  );
}

export default App;
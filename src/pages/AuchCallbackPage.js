// src/pages/AuthCallbackPage.js

import React, { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function AuthCallbackPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { setToken } = useAuth(); // AuthContext에서 setToken 함수를 가져옴

    useEffect(() => {
        // 1. URL에서 'token' 쿼리 파라미터를 읽어옵니다.
        const tokenFromUrl = searchParams.get('token');

        if (tokenFromUrl) {
            // 2. 토큰이 있으면, AuthContext에 저장 (localStorage에도 자동 저장됨)
            setToken(tokenFromUrl);
            
            // 3. 메인 페이지('/')로 리디렉션
            navigate('/');
        } else {
            // 4. 토큰이 없으면 (오류), 로그인 페이지나 메인 페이지로 리디렉션
            console.error('No token found in callback URL');
            navigate('/'); // 또는 '/login-error'
        }

    }, [searchParams, setToken, navigate]);

    // 이 페이지는 사용자에게 잠시 "로딩 중..."만 보여줍니다.
    return (
        <div style={{ padding: '40px', textAlign: 'center' }}>
            <h2>로그인 처리 중...</h2>
            <p>잠시만 기다려주세요.</p>
        </div>
    );
}

export default AuthCallbackPage;
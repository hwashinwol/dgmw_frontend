// src/context/AuthContext.js

import React, { createContext, useContext, useState, useEffect } from 'react';

// ⭐️ 백엔드 API의 기본 URL
const API_BASE_URL = 'http://localhost:3000/api/v1';

// 1. Context 생성
const AuthContext = createContext(null);

// 2. AuthProvider 컴포넌트 (앱 전체를 감쌀 컴포넌트)
export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [isLoading, setIsLoading] = useState(false);

    // token이 변경될 때 localStorage에도 저장/삭제
    useEffect(() => {
        if (token) {
            localStorage.setItem('token', token);
        } else {
            localStorage.removeItem('token');
        }
    }, [token]);

    /**
     * [로그인 시작]
     * 'Google로 로그인' 버튼 클릭 시 호출
     */
    const handleLogin = async () => {
        setIsLoading(true);
        try {
            // 1. 백엔드에 '로그인 시작 API' 호출
            const response = await fetch(`${API_BASE_URL}/auth/google`);
            if (!response.ok) {
                throw new Error('로그인 URL을 받아오는데 실패했습니다.');
            }
            const data = await response.json();
            
            // 2. 받아온 Google 인증 URL로 사용자를 리디렉션
            window.location.href = data.authUrl;

        } catch (error) {
            console.error(error);
            setIsLoading(false);
        }
    };

    /**
     * [로그아웃]
     * '로그아웃' 버튼 클릭 시 호출
     */
    const handleLogout = () => {
        setToken(null);
        // (선택) 필요시 홈페이지로 리디렉션
        // window.location.href = '/'; 
    };

    const value = {
        token,
        setToken, // AuthCallbackPage에서 토큰을 설정할 때 사용
        isLoggedIn: !!token,
        isLoading,
        handleLogin,
        handleLogout,
        API_BASE_URL
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

// 3. useAuth 훅 (다른 컴포넌트에서 쉽게 context를 사용하기 위함)
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
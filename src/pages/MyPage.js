// src/pages/MyPage.js

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import './MyPage.css'; // ⭐️ 마이페이지 전용 스타일

function MyPage() {
    const { token, handleLogout, API_BASE_URL } = useAuth();
    const [userData, setUserData] = useState(null); // (free, paid, overdue 등)
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // 1. 페이지 로드 시 '내 정보' API 호출
    useEffect(() => {
        const fetchUserData = async () => {
            if (!token) {
                setIsLoading(false);
                setError('로그인이 필요합니다.');
                return;
            }

            try {
                const response = await fetch(`${API_BASE_URL}/user/me`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                
                if (!response.ok) {
                    throw new Error('사용자 정보를 불러오는데 실패했습니다.');
                }

                const data = await response.json();
                setUserData(data);

            } catch (err) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchUserData();
    }, [token, API_BASE_URL]);


    // 2. 로그아웃 버튼 핸들러
    const onLogoutClick = () => {
        if (window.confirm('로그아웃 하시겠습니까?')) {
            handleLogout();
            // AuthContext가 토큰을 지우면, 
            // 이 페이지는 자동으로 "로그인이 필요합니다" 상태가 됩니다.
        }
    };

    // 3. 회원 탈퇴 핸들러
    const onDeleteAccountClick = async () => {
        if (!window.confirm('정말로 회원 탈퇴를 하시겠습니까?\n모든 데이터가 영구적으로 삭제됩니다.')) {
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/user/`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('회원 탈퇴에 실패했습니다.');
            }

            alert('회원 탈퇴가 완료되었습니다.');
            handleLogout(); // 로그아웃 처리

        } catch (err) {
            alert(err.message);
        }
    };


    // --- 렌더링 로직 ---
    if (isLoading) {
        return <div className="mypage-container"><p>로딩 중...</p></div>;
    }

    if (error || !userData) {
        return <div className="mypage-container"><p>{error || '사용자 정보를 불러올 수 없습니다.'}</p></div>;
    }

    // userData (백엔드 응답) 예시:
    // { email: "user@example.com", status: "free", auto_renew: false, ... }
    // { email: "user@example.com", status: "paid", auto_renew: true, ... }
    // { email: "user@example.com", status: "overdue", auto_renew: true, ... }
    
    // (이 부분은 Screen 7, 8, 9에 맞춰 더 복잡하게 만드셔야 합니다)
    const getPlanName = (status) => {
        if (status === 'paid') return '프리미엄';
        if (status === 'overdue') return '결제 실패';
        return '무료';
    };
    
    return (
        <div className="mypage-container">
            <h2>마이페이지</h2>
            <p className="mypage-subtitle">계정 정보 및 구독을 관리합니다.</p>

            {/* 1. 계정 정보 (Screen 7, 8, 9 공통) */}
            <section className="mypage-section">
                <h3>계정 정보</h3>
                <div className="info-box">
                    <div className="info-row">
                        <span>이메일</span>
                        <span>{userData.email}</span>
                    </div>
                    <div className="info-row">
                        <span>현재 플랜</span>
                        <span className={`plan-badge ${userData.status}`}>
                            {getPlanName(userData.status)}
                        </span>
                    </div>
                </div>
            </section>

            {/* TODO: 
                여기에 Screen 7, 8, 9의 
                "구독 정보", "플랜 혜택 비교" 등을
                userData.status 값에 따라 조건부 렌더링해야 합니다. 
            */}
            
            {/* ... (Screen 7, 8, 9의 복잡한 UI 로직) ... */}


            {/* 10. 계정 관리 (Screen 10) */}
            <section className="mypage-section">
                <h3>계정 관리</h3>
                <p>로그아웃 또는 회원탈퇴를 진행할 수 있습니다.</p>
                <div className="account-actions">
                    <button 
                        className="action-button logout-btn"
                        onClick={onLogoutClick}
                    >
                        로그아웃
                    </button>
                    <button 
                        className="action-button delete-btn"
                        onClick={onDeleteAccountClick}
                    >
                        회원탈퇴
                    </button>
                </div>
            </section>
        </div>
    );
}

export default MyPage;
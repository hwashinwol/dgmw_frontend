import React, { useState, useEffect } from 'react';
// Link 추가
import { Link } from 'react-router-dom';
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

    // 2. API 호출 함수(결제 재시도, 구독 취소)
    // 결제 재시도
    const handleRetryPayment = async () => {
        if (!window.confirm('저장된 카드로 결제를 재시도합니다.')) return;
        setActionLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/payment/retry`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || '결제 재시도 실패');
            
            alert('결제 재시도 요청이 처리되었습니다. (모의 모드)');
            // TODO: 성공 시 userData를 새로고침하거나 상태를 'paid'로 변경
            // window.location.reload();

        } catch (err) {
            alert(err.message);
        } finally {
            setActionLoading(false);
        }
    };

    // 구독 취소
    const handleCancelSubscription = async () => {
        if (!window.confirm('구독을 취소하시겠습니까?\n(다음 결제일에 갱신되지 않습니다.)')) return;
        setActionLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/user/subscription/cancel`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || '구독 취소 실패');

            alert('구독 취소가 예약되었습니다.');
            // ⭐️ 응답 성공 시, 화면의 auto_renew 상태를 즉시 갱신
            setUserData(prev => ({ ...prev, auto_renew: false }));

        } catch (err) {
            alert(err.message);
        } finally {
            setActionLoading(false);
        }
    };


    // 로그아웃 버튼 핸들러
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
        } finally {
            setActionLoading(false);
        }
    };

    const renderSubscriptionInfo = (status) => {
        const endDate = userData.subscription_end_date ? 
            new Date(userData.subscription_end_date).toLocaleDateString() : 'N/A';

        switch (status) {
            // --- Screen 7: 무료 사용자 ---
            case 'free':
                return (
                    <section className="mypage-section">
                        <h3>구독 정보</h3>
                        <div className="info-box subscription-free">
                            <div className="info-row">
                                <span>구독 상태</span>
                                <span>무료 플랜</span>
                            </div>
                            <div className="info-row">
                                <span>오늘 사용 횟수</span>
                                <span>(API 미구현) / 5회</span>
                            </div>
                            <Link to="/plans" className="action-button primary-btn upgrade-btn">
                                프리미엄 플랜으로 업그레이드
                            </Link>
                        </div>
                    </section>
                );

            // --- Screen 8: 연체 사용자 ---
            case 'overdue':
                return (
                    <section className="mypage-section">
                        <div className="payment-failed-alert">
                            <h4>결제 실패</h4>
                            <p>정기 결제가 실패하였습니다. 프리미엄 기능 이용이 제한됩니다. 아래에서 결제를 재시도하거나 구독을 취소해주세요.</p>
                        </div>
                        <h3>구독 정보</h3>
                        <div className="info-box subscription-overdue">
                            <div className="info-row">
                                <span>구독 상태</span>
                                <span>결제 실패 (연체)</span>
                            </div>
                            <div className="info-row">
                                <span>결제 예정일</span>
                                <span>{endDate}</span>
                            </div>
                            <div className="info-row">
                                <span>월 구독료</span>
                                <span>₩9,900</span>
                            </div>
                            <div className="button-group">
                                <button 
                                    onClick={handleRetryPayment} 
                                    className="action-button primary-btn" 
                                    disabled={actionLoading}
                                >
                                    결제 재시도
                                </button>
                                <button 
                                    onClick={handleCancelSubscription} 
                                    className="action-button" 
                                    disabled={actionLoading || !userData.auto_renew}
                                >
                                    {userData.auto_renew ? '구독 취소' : '구독 취소됨'}
                                </button>
                            </div>
                        </div>
                    </section>
                );
                
            // --- Screen 9: 유료 사용자 ---
            case 'paid':
                return (
                    <section className="mypage-section">
                        <h3>구독 정보</h3>
                        <div className="info-box subscription-paid">
                            <div className="info-row">
                                <span>구독 상태</span>
                                <span>활성</span>
                            </div>
                            <div className="info-row">
                                <span>다음 결제일</span>
                                <span>{endDate}</span>
                            </div>
                            <div className="info-row">
                                <span>월 구독료</span>
                                <span>₩9,900</span>
                            </div>
                            <button 
                                onClick={handleCancelSubscription} 
                                className="action-button" 
                                disabled={actionLoading || !userData.auto_renew}
                            >
                                {userData.auto_renew ? '구독 취소' : '구독 취소됨 (만료일: ' + endDate + ')'}
                            </button>
                        </div>
                    </section>
                );

            default:
                return null;
        }
    };

    // ⭐️ 4. 플랜 비교 렌더링 함수 (공통)
    const renderPlanComparison = () => (
        <section className="mypage-section">
            <h3>플랜 혜택 비교</h3>
            <div className="plan-comparison-box">
                <div className="plan-column">
                    <h4>무료 플랜</h4>
                    <ul>
                        <li><span role="img" aria-label="check">✔</span> AI번역과 기계번역 비교</li>
                        <li><span role="img" aria-label="check">✔</span> 복잡성 점수</li>
                        <li><span role="img" aria-label="warning">❗</span> 하루 5회 제한</li>
                    </ul>
                </div>
                <div className={`plan-column premium ${userData.status === 'paid' ? 'current' : ''}`}>
                    {userData.status === 'paid' && <span className="current-plan-badge">현재 플랜</span>}
                    <h4>프리미엄 플랜</h4>
                    <ul>
                        <li><span role="img" aria-label="check">✔</span> 무제한 이용</li>
                        <li><span role="img" aria-label="check">✔</span> 파일 업로드</li>
                        <li><span role="img" aria-label="check">✔</span> 3개 고급 AI 모델</li>
                        <li><span role="img" aria-label="check">✔</span> 번역 스타일 점수</li>
                        <li><span role="img" aria-label="check">✔</span> 전문 분야 선택</li>
                    </ul>
                </div>
            </div>
        </section>
    );

    // --- 렌더링 로직 ---
    if (isLoading) {
        return <div className="mypage-container"><p>로딩 중...</p></div>;
    }

    if (error || !userData) {
        return <div className="mypage-container"><p>{error || '사용자 정보를 불러올 수 없습니다.'}</p></div>;
    }

    const getPlanName = (status) => {
        if (status === 'paid') return '프리미엄';
        if (status === 'overdue') return '결제 실패';
        return '무료';
    };
    
    return (
        <div className="mypage-container">
            <h2>마이페이지</h2>
            <p className="mypage-subtitle">계정 정보 및 구독을 관리합니다.</p>

            {/* 1. 계정 정보 (공통) */}
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

            {/* ⭐️ 2. 구독 정보 (상태별 분기) */}
            {renderSubscriptionInfo(userData.status)}

            {/* ⭐️ 3. 플랜 혜택 비교 (공통) */}
            {renderPlanComparison()}

            {/* 4. 계정 관리 (공통) */}
            <section className="mypage-section">
                <h3>계정 관리</h3>
                <p>로그아웃 또는 회원탈퇴를 진행할 수 있습니다.</p>
                <div className="account-actions">
                    <button 
                        className="action-button logout-btn"
                        onClick={onLogoutClick}
                        disabled={actionLoading}
                    >
                        로그아웃
                    </button>
                    <button 
                        className="action-button delete-btn"
                        onClick={onDeleteAccountClick}
                        disabled={actionLoading}
                    >
                        회원탈퇴
                    </button>
                </div>
            </section>
        </div>
    );
}

export default MyPage;
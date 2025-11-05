import React, { useState } from 'react';
import { Link, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Layout.css'; // ⭐️ 공통 스타일
import PlanModal from './PlanModal';

// ⭐️ Google 로고 SVG (Base64 인코딩)
const GoogleLogo = () => (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M17.64 9.20455C17.64 8.56682 17.5827 7.95273 17.4764 7.36364H9V10.8491H13.8436C13.635 11.97 13.0009 12.9232 12.0477 13.5609V15.8195H14.9564C16.6582 14.2527 17.64 11.9455 17.64 9.20455Z" fill="#4285F4"/>
        <path d="M9 18C11.43 18 13.4673 17.1941 14.9564 15.8195L12.0477 13.5609C11.2418 14.1014 10.2109 14.4205 9 14.4205C6.96273 14.4205 5.22091 13.0173 4.52182 11.1068H1.51773V13.4332C3.00682 16.2795 5.79727 18 9 18Z" fill="#34A853"/>
        <path d="M4.52182 11.1068C4.33636 10.5564 4.22727 9.975 4.22727 9.36364C4.22727 8.75227 4.33636 8.17091 4.52182 7.62045V5.29409H1.51773C0.543636 7.10318 0 9.12318 0 11.3636C0 13.6041 0.543636 15.6241 1.51773 17.4332L4.52182 15.1068V11.1068Z" fill="#FBBC05"/>
        <path d="M9 3.57955C10.3214 3.57955 11.5077 4.02455 12.4405 4.92545L15.0218 2.34409C13.4673 0.891818 11.43 0 9 0C5.79727 0 3.00682 1.72045 1.51773 4.56682L4.52182 6.89318C5.22091 4.98273 6.96273 3.57955 9 3.57955Z" fill="#EA4335"/>
    </svg>
);

/**
 * ⭐️ 로그인 모달 (Screen 5)
 */
const LoginModal = ({ show, onClose }) => {
    const { isLoading, handleLogin } = useAuth();

    if (!show) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close-btn" onClick={onClose}>&times;</button>
                <h3>로그인</h3>
                <p>Google 계정으로 간편하게 로그인하세요.</p>
                <button 
                    className="google-login-btn" 
                    onClick={handleLogin} 
                    disabled={isLoading}
                >
                    <GoogleLogo />
                    {isLoading ? '이동 중...' : 'Google로 로그인'}
                </button>
            </div>
        </div>
    );
};


/**
 * ⭐️ 메인 레이아웃 (헤더 포함)
 */
function Layout() {
    const { isLoggedIn, openPlanModal } = useAuth();
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

    // 로그인 모달 열기
    const handleOpenLoginModal = () =>{
        setIsLoginModalOpen(true);
    };

    // useAuth에 로그인 모달 여는 함수 등록
    const auth = useAuth();
    auth.openLoginModal = handleOpenLoginModal;

    return (
        <>
            <header className="main-header">
                <div className="header-content">
                    <Link to="/" className="logo">DGMW (그런 뜻 아닌데)</Link>
                    <nav>
                        {isLoggedIn ? (
                            <>
                                <Link to="/mypage" className="header-link">내 정보</Link>
                                <button onClick={openPlanModal} className='header-btn primary'>
                                    구독 플랜
                                </button>
                            </>
                        ) : (
                            <>
                                <button 
                                    onClick={() => setIsLoginModalOpen(true)} 
                                    className="header-link"
                                >
                                    로그인
                                </button>
                                <button onClick={openPlanModal} className='header-btn primary'>
                                    구독 플랜
                                </button>
                            </>
                        )}
                    </nav>
                </div>
            </header>

            {/* 로그인 모달 */}
            <LoginModal 
                show={isLoginModalOpen} 
                onClose={() => setIsLoginModalOpen(false)} 
            />

            {/* 플랜 모달} */}
            <PlanModal />

            {/* ⭐️ 페이지 본문 (TranslatePage, ResultsPage 등이 여기에 렌더링됨) */}
            <main>
                <Outlet />
            </main>
        </>
    );
}

export default Layout;
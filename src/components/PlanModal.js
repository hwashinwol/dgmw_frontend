import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

// ⭐️ 플랜 혜택 리스트 (재사용)
const planFeatures = {
    free: [
        "텍스트 입력 번역",
        "AI 번역 vs 기계번역 비교",
        "간결성 점수 제공",
        "하루 5회 제한",
    ],
    premium: [
        "무제한 이용",
        "텍스트 입력 및 파일 업로드 (.pdf, .docx, .txt)",
        "3개 고급 AI 모델 비교 (GPT-4o, Gemini 2.5, Claude Sonnet)",
        "간결성 점수 + 번역 스타일 점수",
        "전문 분야 선택 (교양, 의료, 법률 등)",
    ]
};

// ⭐️ 체크/경고 아이콘
const CheckIcon = () => <span role="img" aria-label="check">✔</span>;
const WarnIcon = () => <span role="img" aria-label="warning">❗</span>;


function PlanModal() {
    const { 
        token, 
        API_BASE_URL, 
        isPlanModalOpen, 
        closePlanModal,
        isLoggedIn,
        openLoginModal // ⭐️ 로그인이 필요하면 로그인 모달 열기
    } = useAuth();
    
    const [isLoading, setIsLoading] = useState(false);

    // '업그레이드하기' 버튼 클릭 핸들러
    const handleUpgradeClick = async () => {
        // 1. 비로그인 시, 로그인 모달 먼저 띄우기
        if (!isLoggedIn) {
            closePlanModal(); // 플랜 모달 닫고
            openLoginModal(); // 로그인 모달 열기
            return;
        }

        // 2. 로그인 상태 시, 결제 API 호출
        setIsLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/payment/checkout`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || '결제 세션 생성 실패');

            // [운영 모드]
            // if (data.url) {
            //     window.location.href = data.url; // Stripe 결제창으로 리디렉션
            // }

            // [모의 모드]
            if (data.mock) {
                alert('결제 요청이 처리되었습니다. (모의 모드)');
                closePlanModal();
                // TODO: 결제 성공 시 마이페이지로 보내거나, 상태 갱신
                // window.location.href = '/mypage'; 
            }

        } catch (err) {
            alert(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isPlanModalOpen) return null;

    return (
        <div className="modal-overlay" onClick={closePlanModal}>
            <div className="modal-content plan-modal" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close-btn" onClick={closePlanModal}>&times;</button>
                
                <h3>구독 플랜</h3>
                <p>더 나은 번역 비교 경험을 위해 유료 플랜을 선택하세요.</p>

                <div className="plan-comparison-box modal-plans">
                    {/* 무료 플랜 */}
                    <div className="plan-column">
                        <h4>무료 플랜</h4>
                        <ul>
                            {planFeatures.free.map((feature, i) => (
                                <li key={i}>
                                    {feature.includes('제한') ? <WarnIcon /> : <CheckIcon />}
                                    {feature}
                                </li>
                            ))}
                        </ul>
                    </div>
                    {/* 프리미엄 플랜 */}
                    <div className="plan-column premium">
                        <h4>프리미엄 플랜</h4>
                        <span className="price">₩9,900 / 월</span>
                        <ul>
                            {planFeatures.premium.map((feature, i) => (
                                <li key={i}><CheckIcon /> {feature}</li>
                            ))}
                        </ul>
                    </div>
                </div>

                <button 
                    className="action-button primary-btn upgrade-btn"
                    onClick={handleUpgradeClick}
                    disabled={isLoading}
                >
                    {isLoading ? '처리 중...' : '업그레이드하기'}
                </button>
            </div>
        </div>
    );
}

export default PlanModal;
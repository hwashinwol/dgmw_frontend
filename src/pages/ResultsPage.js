import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; 
import './ResultsPage.css';

/**
 * ⭐️ 개별 번역 결과를 표시하는 카드 컴포넌트
 */
const ResultCard = ({ result, userStatus }) => {
    // 백엔드에서 받은 모델 이름 (GPT-4o, Gemini 2.5, ...)
    const modelName = result.model_name || 'Unknown Model';
    
    // 유료 모델인지 여부를 간단히 확인 (스크린샷 기준)
    const isPremiumModel = ['GPT-4o', 'Gemini 2.5', 'Claude Sonnet'].includes(modelName);

    return (
        <div className="result-card">
            <div className="card-header">
                <h3>{modelName}</h3>
                {isPremiumModel && <span className="premium-tag">Premium</span>}
            </div>
            
            <p className="translated-text">
                {result.translated_text || '번역 결과를 불러올 수 없습니다.'}
            </p>

            <div className="scores-container">
                {/* 1. 간결성 점수 (모든 플랜 공통) */}
                <div className="score-item">
                    <div className="score-label">
                        <span>간결성</span>
                        <span className="score-value">
                            {result.complexity_score ? result.complexity_score.toFixed(2) : 'N/A'}
                        </span>
                    </div>
                    <p className="score-description">점수가 낮을수록 간결함</p>
                </div>

                {/* 2. 번역 스타일 점수 (⭐️ 유료 사용자에게만 표시) */}
                {userStatus === 'paid' && result.spectrum_score != null && (
                    <div className="score-item">
                        <div className="score-label">
                            <span>번역 스타일</span>
                            <span className="score-value">
                                {result.spectrum_score.toFixed(2)}
                            </span>
                        </div>
                        <input 
                            type="range" 
                            min="1.0" 
                            max="10.0" 
                            value={result.spectrum_score} 
                            step="0.1"
                            readOnly 
                            className="style-slider"
                        />
                        <div className="slider-labels">
                            <span>1.0 (직역)</span>
                            <span>10.0 (의역)</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};


/**
 * ⭐️ 전체 결과 페이지
 */
function ResultsPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const { openPlanModal } = useAuth();

    // TranslatePage에서 navigate로 넘겨준 state를 받습니다.
    const { state } = location;
    const results = state?.results;
    const originalText = state?.originalText;
    const userStatus = state?.userStatus || 'free'; // 기본값 'free'

    // 1. (예외 처리) state가 없으면(직접 URL로 접근 시) 메인으로 돌려보냄
    if (!state || !results || !originalText) {
        return (
            <div className="results-container">
                <p>결과 데이터가 없습니다. 번역 페이지로 돌아가 다시 시도해주세요.</p>
                <button onClick={() => navigate('/')} className="back-button-full">
                    번역 페이지로 돌아가기
                </button>
            </div>
        );
    }

    return (
        <div className="results-container">
            {/* 1. 뒤로 가기 버튼 */}
            <button onClick={() => navigate('/')} className="back-button">
                &larr; 다시 번역하기
            </button>

            <h2>번역 결과 비교</h2>

            {/* 2. 원본 텍스트 카드 */}
            <div className="original-text-card">
                <h3>원본 텍스트</h3>
                <p>{originalText}</p>
            </div>

            {/* 3. (조건부) 무료 사용자용 업셀 배너 */}
            {userStatus === 'free' && (
                <div className="upsell-banner">
                    <p>유료 플랜으로 업그레이드하면 GPT-4o, Gemini 2.5, Claude Sonnet 등 3개의 고급 AI 모델 비교와 상세한 스타일 분석을 이용하실 수 있습니다.</p>
                </div>
            )}

            {/* 4. 번역 결과 그리드 */}
            <div className="results-grid">
                {results.map((result, index) => (
                    <ResultCard 
                        key={index} 
                        result={result} 
                        userStatus={userStatus} 
                    />
                ))}
            </div>

            {/* 5. (조건부) 무료 사용자용 업셀 버튼 */}
            {userStatus === 'free' && (
                <button onClick={ handleUpsellClick } className='upsell-button'>
                    유료 플랜 살펴보기
                </button>
            )}
        </div>
    );
}

export default ResultsPage;
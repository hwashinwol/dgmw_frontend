import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // ⭐️ 페이지 이동을 위해 import
import './TranslatePage.css';
import { useAuth } from '../context/AuthContext';

function TranslatePage() {
    const [inputType, setInputType] = useState('text'); // 'text' 또는 'file'
    const [inputText, setInputText] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const [selectedDomain, setSelectedDomain] = useState('선택 안 함'); // 전문 분야
    
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const navigate = useNavigate(); // ⭐️ 결과 페이지로 이동하기 위한 hook
    const { token, API_BASE_URL } = useAuth();

    // 파일 선택 핸들러
    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
        }
    };

    // '스타일 분석하기' 버튼 클릭 핸들러
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        // 1. FormData 객체 생성
        const formData = new FormData();
        formData.append('inputType', inputType);
        formData.append('selected_domain', selectedDomain);

        if (inputType === 'text') {
            if (!inputText.trim()) {
                setError('번역할 텍스트를 입력하세요.');
                setIsLoading(false);
                return;
            }
            formData.append('inputText', inputText);
        } else {
            if (!selectedFile) {
                setError('번역할 파일을 선택하세요.');
                setIsLoading(false);
                return;
            }
            formData.append('file', selectedFile);
        }

        try {
            // 2. localStorage에서 JWT 토큰 가져오기 (로그인 구현 후)
            const headers = {};
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            // 3. 백엔드 API 호출
            const response = await fetch(`${API_BASE_URL}/translate`, {
                method: 'POST',
                headers: headers,
                body: formData, // ⭐️ FormData를 body로 전송
            });

            const data = await response.json();

            if (!response.ok) {
                // API가 4xx, 5xx 에러를 반환한 경우
                throw new Error(data.error || '번역에 실패했습니다.');
            }

            // 4. ⭐️ 번역 성공!
            console.log('번역 결과:', data);
            
            // 5. ⭐️ 결과 페이지로 이동 (결과 데이터와 원본 텍스트를 함께 넘김)
            navigate('/results', { 
                state: { 
                    results: data.results, 
                    originalText: inputText || `(파일: ${selectedFile.name})`,
                    userStatus: data.userStatus 
                } 
            });

        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="translate-container">
            <h2>번역 스타일 분석기</h2>
            <p>AI 번역 엔진들의 스타일을 비교해보세요.</p>

            <form onSubmit={handleSubmit}>
                {/* 1. Text / File 토글 */}
                <div className="toggle-buttons">
                    <button 
                        type="button" 
                        className={inputType === 'text' ? 'active' : ''}
                        onClick={() => setInputType('text')}
                    >
                        Text
                    </button>
                    <button 
                        type="button" 
                        className={inputType === 'file' ? 'active' : ''}
                        onClick={() => setInputType('file')}
                    >
                        File
                    </button>
                </div>

                {/* 2. 입력 영역 (조건부 렌더링) */}
                <div className="input-area">
                    {inputType === 'text' ? (
                        <textarea
                            placeholder="여기에 텍스트를 입력하세요... (최대 5000자)"
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            maxLength={5000}
                            disabled={isLoading}
                        />
                    ) : (
                        <div className="file-dropzone">
                            {selectedFile ? (
                                <p>선택된 파일: {selectedFile.name}</p>
                            ) : (
                                <p>파일을 선택하세요 (.pdf, .docx, .txt)</p>
                            )}
                            <input 
                                type="file" 
                                onChange={handleFileChange}
                                accept=".pdf,.docx,.txt"
                                disabled={isLoading}
                            />
                        </div>
                    )}
                </div>

                {/* 3. 전문 분야 선택 */}
                <div className="domain-selection">
                    <h3>전문 분야 선택 <span className="optional">(선택사항)</span></h3>
                    <p className="domain-notice">전문 분야 선택은 유료 등급 기능입니다.</p>
                    <div className="radio-group">
                        {['선택 안 함', '공학', '사회과학', '예술', '의료', '법률', '자연과학', '인문학'].map(domain => (
                            <label key={domain}>
                                <input 
                                    type="radio" 
                                    name="domain" 
                                    value={domain}
                                    checked={selectedDomain === domain}
                                    onChange={(e) => setSelectedDomain(e.target.value)}
                                    disabled={isLoading}
                                />
                                {domain}
                            </label>
                        ))}
                    </div>
                </div>

                {/* 4. 제출 버튼 */}
                <button type="submit" className="submit-btn" disabled={isLoading}>
                    {isLoading ? '분석 중...' : '스타일 분석하기'}
                </button>

                {/* 5. 에러 메시지 */}
                {error && <p className="error-message">{error}</p>}
            </form>
        </div>
    );
}

export default TranslatePage;
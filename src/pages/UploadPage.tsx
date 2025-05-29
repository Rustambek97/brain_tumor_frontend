import React, { useState, useCallback, useEffect } from "react";
import Header from "../components/Header";
import "../styles/UploadPage.css";
import jsPDF from "jspdf";

function UploadPage() {
    const [file, setFile] = useState<File | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [pulse, setPulse] = useState(false);
    const [scanProgress, setScanProgress] = useState(0);
    const [loaded, setLoaded] = useState(false);
    const [analysisStarted, setAnalysisStarted] = useState(false);
    const [isImageLoading, setIsImageLoading] = useState(false);
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [imageLoaded, setImageLoaded] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const [resultsLoaded, setResultsLoaded] = useState(false);
    const [aiResult, setAiResult] = useState<null | { conclusion: string; recommendations: string[] }>(null);
    const [aiImage, setAiImage] = useState<string | null>(null);
    const [aiError, setAiError] = useState<string | null>(null);

    useEffect(() => {
        const timer = setTimeout(() => setLoaded(true), 300);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        const pulseInterval = setInterval(() => {
            setPulse(prev => !prev);
        }, 2000);

        let scanInterval: number | undefined;
        if (file && analysisStarted) {
            let progress = 0;
            setShowResults(false);
            setResultsLoaded(false);
            scanInterval = setInterval(() => {
                progress += Math.random() * 10;
                if (progress >= 100) {
                    progress = 100;
                    clearInterval(scanInterval);
                    setTimeout(() => {
                        setShowResults(true);
                        setTimeout(() => setResultsLoaded(true), 200);
                    }, 600);
                }
                setScanProgress(progress);
            }, 200);
        }

        return () => {
            clearInterval(pulseInterval);
            if (scanInterval) clearInterval(scanInterval);
        };
    }, [file, analysisStarted]);

    useEffect(() => {
        return () => {
            if (imageUrl) URL.revokeObjectURL(imageUrl);
        };
    }, [imageUrl]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files && e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            setScanProgress(0);
            setAnalysisStarted(false);
            setImageLoaded(false);
            setShowResults(false);
            setResultsLoaded(false);
            if (selectedFile.type.startsWith("image/")) {
                setIsImageLoading(true);
                const url = URL.createObjectURL(selectedFile);
                setImageUrl(url);
                setTimeout(() => {
                    setIsImageLoading(false);
                    setImageLoaded(true);
                }, 1500);
            } else {
                setImageUrl(null);
                setIsImageLoading(false);
                setImageLoaded(true);
            }
            console.log("File selected:", selectedFile.name);
        }
    };

    const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
        const droppedFile = e.dataTransfer.files && e.dataTransfer.files[0];
        if (droppedFile) {
            setFile(droppedFile);
            setScanProgress(0);
            setAnalysisStarted(false);
            setImageLoaded(false);
            setShowResults(false);
            setResultsLoaded(false);
            if (droppedFile.type.startsWith("image/")) {
                setIsImageLoading(true);
                const url = URL.createObjectURL(droppedFile);
                setImageUrl(url);
                setTimeout(() => {
                    setIsImageLoading(false);
                    setImageLoaded(true);
                }, 1500);
            } else {
                setImageUrl(null);
                setIsImageLoading(false);
                setImageLoaded(true);
            }
            console.log("File dropped:", droppedFile.name);
        }
    }, []);

    const triggerFileInput = () => {
        const input = document.getElementById('file-upload');
        if (input) {
            (input as HTMLInputElement).click();
        }
    };

    const handleStartAnalysis = async () => {
        setAnalysisStarted(true);
        setScanProgress(0);
        setAiResult(null);
        setAiImage(null);
        setAiError(null);
        if (!file) return;
        try {
            // Отправляем файл на backend
            const formData = new FormData();
            formData.append('file', file);
            const response = await fetch('http://localhost:8000/analyze/', {
                method: 'POST',
                body: formData,
            });
            if (!response.ok) throw new Error('Ошибка при анализе изображения');
            const data = await response.json();
            setAiResult({
                conclusion: data.verdict,
                recommendations: [
                    data.verdict === 'Обнаружена опухоль'
                        ? 'Обратитесь к врачу-онкологу для дальнейшего обследования.'
                        : 'Продолжайте регулярные обследования.',
                    'Ведите здоровый образ жизни.',
                    'Данный результат не заменяет консультацию специалиста.'
                ]
            });
            setAiImage('data:image/png;base64,' + data.image_base64);
            setShowResults(true);
            setTimeout(() => setResultsLoaded(true), 200);
        } catch (err: any) {
            setAiError('Ошибка анализа: ' + (err.message || 'Неизвестная ошибка'));
            setShowResults(true);
            setTimeout(() => setResultsLoaded(true), 200);
        }
    };

    const handleDownloadPDF = async () => {
        const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

        // Title and Date at the top
        doc.setFontSize(16);
        doc.text("MRI Scan Report", 105, 15, { align: "center", charSpace: 0 });
        doc.setFontSize(11);
        doc.text("Дата: 2025-05-16", 15, 25, { charSpace: 0 });

        // Outer border
        doc.setDrawColor(180);
        doc.rect(15, 30, 180, 240);

        // Image on the left
        if (imageUrl) {
            try {
                const img = await toDataUrl(imageUrl);
                doc.setDrawColor(120);
                doc.rect(25, 40, 50, 50); // Smaller image box
                doc.addImage(img, 'JPEG', 25, 40, 50, 50);
            } catch (error) {
                console.error("Failed to load image for PDF:", error);
            }
        }

        // Patient details on the right
        doc.setFontSize(12);
        doc.text("Наименование сайта", 85, 45, { charSpace: 0 });
        doc.setLineWidth(0.5);
        doc.line(85, 47, 185, 47); // Horizontal line under title
        doc.setFontSize(10);
        doc.text("ФИО: Иван Иванов", 85, 55, { charSpace: 0 });
        doc.line(85, 57, 185, 57);
        doc.text("Дата рождения: 01.01.1980", 85, 65, { charSpace: 0 });
        doc.line(85, 67, 185, 67);
        doc.text("Пол: М", 85, 75, { charSpace: 0 });
        doc.line(85, 77, 185, 77);

        // Conclusion section
        doc.setFontSize(12);
        doc.text("Заключение:", 25, 105, { charSpace: 0 });
        doc.line(25, 107, 185, 107); // Horizontal line under "Заключение"
        doc.setFontSize(10);
        doc.text("Признаков выраженной патологии не выявлено.", 25, 115, { maxWidth: 160, charSpace: 0 });

        // Recommendations section
        doc.setFontSize(12);
        doc.text("Рекомендации:", 25, 135, { charSpace: 0 });
        doc.line(25, 137, 185, 137); // Horizontal line under "Рекомендации"
        doc.setFontSize(10);
        doc.text([
            "- Продолжайте регулярные обследования.",
            "- Ведите здоровый образ жизни.",
            "- Обратитесь к специалисту при появлении новых симптомов."
        ], 25, 145, { charSpace: 0 });

        // Comment section
        doc.setFontSize(9);
        doc.text("Данный результат получен с помощью искусственного интеллекта и не заменяет консультацию врача.", 25, 185, { maxWidth: 160, charSpace: 0 });

        doc.save("MRI-Scan-Report.pdf");
    };

    function toDataUrl(url: string): Promise<string> {
        return new Promise((resolve, reject) => {
            const img = new window.Image();
            img.crossOrigin = 'Anonymous';
            img.onload = function () {
                try {
                    const canvas = document.createElement('canvas');
                    canvas.width = img.width;
                    canvas.height = img.height;
                    const ctx = canvas.getContext('2d');
                    if (!ctx) {
                        reject(new Error("Failed to get canvas context"));
                        return;
                    }
                    ctx.drawImage(img, 0, 0);
                    resolve(canvas.toDataURL('image/jpeg'));
                } catch (error) {
                    reject(error);
                }
            };
            img.onerror = function () {
                reject(new Error("Failed to load image"));
            };
            img.src = url;
        });
    }

    return (
        <>
            <Header />
            <div className="upload-page-wrapper">
                <div className="neural-network-animation">
                    {Array.from({ length: 20 }).map((_, i) => (
                        <div key={i} className="neural-node" style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            animationDelay: `${i * 0.1}s`
                        }} />
                    ))}
                </div>
                <div className={`upload-main${loaded ? ' loaded' : ''}`}>
                    <div 
                        className={`upload-dropzone ${isDragging ? 'dragging' : ''} ${file ? 'has-file' : ''}`}
                        onClick={triggerFileInput}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                    >
                        <div className="upload-dropzone-icon">
                            <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="24" cy="24" r="23" stroke="#2196f3" strokeWidth="2" fill="none" />
                                <path d="M24 32V16" stroke="#2196f3" strokeWidth="2" strokeLinecap="round"/>
                                <path d="M18 22L24 16L30 22" stroke="#2196f3" strokeWidth="2" strokeLinecap="round"/>
                            </svg>
                            {file && (
                                <div className="file-preview-pulse">
                                    <div className={`pulse-ring ${pulse ? 'active' : ''}`} />
                                    <div className={`pulse-ring ${pulse ? 'active' : ''}`} style={{ animationDelay: '0.5s' }} />
                                </div>
                            )}
                        </div>
                        <div className="upload-dropzone-text">
                            <div className="upload-dropzone-title">
                                {file ? (
                                    <>
                                        <div className="file-selected">
                                            <span className="file-selected-name">{file.name}</span>
                                            {imageUrl && (
                                                <div className="image-preview-wrapper">
                                                    <img src={imageUrl} alt="preview" className={`image-preview${isImageLoading ? ' loading' : ''}`} />
                                                    {isImageLoading && <div className="image-loading-spinner" />}
                                                </div>
                                            )}
                                            {!isImageLoading && imageLoaded && !analysisStarted && (
                                                <button className="start-analysis-btn" onClick={e => { e.stopPropagation(); handleStartAnalysis(); }}>
                                                    Начать анализ
                                                </button>
                                            )}
                                            {analysisStarted && (
                                                <div className="scan-progress">
                                                    <div 
                                                        className="scan-progress-bar" 
                                                        style={{ width: `${scanProgress}%` }}
                                                    />
                                                    <span className="scan-progress-text">
                                                        {scanProgress < 100 ? `Сканирование... ${Math.floor(scanProgress)}%` : 'Сканирование завершено!'}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </>
                                ) : (
                                    "Перетащите или выберите файл МРТ для загрузки"
                                )}
                            </div>
                            <div className="upload-dropzone-subtitle">Поддерживаемые форматы: DICOM, NIfTI (.nii, .nii.gz), JPG, PNG</div>
                        </div>
                        {file && analysisStarted && (
                            <div className="ai-processing-animation">
                                <div className="ai-dots">
                                    <div className="ai-dot" style={{ animationDelay: '0s' }} />
                                    <div className="ai-dot" style={{ animationDelay: '0.2s' }} />
                                    <div className="ai-dot" style={{ animationDelay: '0.4s' }} />
                                </div>
                                <div className="ai-processing-text">AI анализирует данные...</div>
                            </div>
                        )}
                        <input 
                            id="file-upload"
                            type="file" 
                            className="upload-input" 
                            onChange={handleFileChange}
                            accept=".dcm,.nii,.nii.gz,.jpg,.jpeg,.png"
                        />
                    </div>
                </div>
                <div className={`upload-features${loaded ? ' loaded' : ''}`}>
                    <div className="feature-card">
                        <div className="feature-icon">
                            <div className="shield-animation">
                                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="#2196f3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                                <div className="shield-glare" />
                            </div>
                        </div>
                        <div className="feature-title">Безопасная загрузка</div>
                        <div className="feature-desc">Ваши данные защищены и обрабатываются анонимно</div>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon">
                            <div className="lightning-animation">
                                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke="#2196f3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                                <div className="lightning-bolt" />
                            </div>
                        </div>
                        <div className="feature-title">Быстрый анализ</div>
                        <div className="feature-desc">Результаты за секунды благодаря ИИ</div>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon">
                            <div className="brain-animation">
                                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M3 12a9 9 0 0 1 9-9 9 9 0 0 1 9 9 9 9 0 0 1-9 9 9 9 0 0 1-9 9z" stroke="#2196f3" strokeWidth="2"/>
                                    <path d="M3 12a9 9 0 0 0 9 9 9 9 0 0 0 9-9 9 9 0 0 0-9 9 9 9 0 0 0-9 9z" stroke="#2196f3" strokeWidth="2"/>
                                    <path d="M12 3v18" stroke="#2196f3" strokeWidth="2"/>
                                </svg>
                                <div className="brain-pulse" />
                            </div>
                        </div>
                        <div className="feature-title">Современный ИИ</div>
                        <div className="feature-desc">Точность диагностики 98.7% на клинических данных</div>
                    </div>
                </div>
                {showResults && (
                    <div className={`analysis-results-block${resultsLoaded ? ' loaded' : ''}`} style={{marginTop: '40px'}}>
                        <div className="analysis-header">
                            <h2 className="analysis-title">Результаты Анализа</h2>
                            <hr className="analysis-divider" />
                        </div>
                        <div className="analysis-results-content-mockup">
                            <div className="analysis-results-left-mockup">
                                {aiImage ? (
                                    <img src={aiImage} alt="Результат" className="analysis-image-preview-mockup" />
                                ) : imageUrl && (
                                    <img src={imageUrl} alt="Результат" className="analysis-image-preview-mockup" />
                                )}
                            </div>
                            <div className="analysis-results-right-mockup">
                                <div className="analysis-info-mockup">
                                    <div className="result-section-mockup">
                                        <span className="section-title-mockup">Заключение:</span>
                                        <span className="section-value-mockup">{aiResult ? aiResult.conclusion : '...'}</span>
                                    </div>
                                    <div className="result-section-mockup">
                                        <span className="section-title-mockup">Комментарий:</span>
                                        <span className="section-value-mockup">Данный результат получен с помощью искусственного интеллекта и не заменяет консультацию врача.</span>
                                    </div>
                                </div>
                                <button className="download-pdf-btn-mockup" onClick={handleDownloadPDF}>Скачать PDF</button>
                            </div>
                        </div>
                        <div className="ai-recommendations-block">
                            <div className="ai-recommendations-title">Рекомендации от AI</div>
                            <hr className="ai-recommendations-divider" />
                            <ul className="recommend-list-mockup">
                                {aiResult && aiResult.recommendations.map((rec, idx) => (
                                    <li key={idx}>{rec}</li>
                                ))}
                            </ul>
                            {aiError && <div style={{color: 'red', marginTop: 10}}>{aiError}</div>}
                        </div>
                    </div>
                )}
                <div className="tech-grid-overlay" />
                <div className="particles-container">
                    {Array.from({ length: 30 }).map((_, i) => (
                        <div key={i} className="particle" style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            width: `${Math.random() * 4 + 1}px`,
                            height: `${Math.random() * 4 + 1}px`,
                            animationDelay: `${Math.random() * 5}s`
                        }} />
                    ))}
                </div>
            </div>
        </>
    );
}

export default UploadPage;
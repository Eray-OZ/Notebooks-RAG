import React, { useState, useEffect, useContext, useRef } from 'react';
import { useParams } from 'react-router-dom';
import {
    getNotebookById,
    uploadDocumentToNotebook,
    postMessageToNotebook
} from '../services/api';
import { AuthContext } from '../context/AuthContext';
import '../styles/NotebookPage.css';

const NotebookPage = () => {
    const { notebookId } = useParams();
    const { user } = useContext(AuthContext);
    const [notebook, setNotebook] = useState(null);
    const [loading, setLoading] = useState(true); // Genel sayfa yükleme durumu
    const [error, setError] = useState('');

    // Dosya Yükleme State'leri
    const [selectedFile, setSelectedFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadError, setUploadError] = useState('');

    // Sohbet State'leri
    const [newMessage, setNewMessage] = useState('');
    const [isSending, setIsSending] = useState(false);
    const chatEndRef = useRef(null);

    // Notebook verilerini çeken fonksiyon
    const fetchNotebook = async (showLoadingIndicator = false) => {
        if (!notebookId) return;
        setError('');
        if (showLoadingIndicator) setLoading(true); // Sadece ilk yüklemede veya gerekliyse
        try {
            const response = await getNotebookById(notebookId);
            setNotebook(response.data);
        } catch (err) {
            setError(err.message || 'Notebook detayları getirilirken bir hata oluştu.');
            console.error("fetchNotebook error:", err);
        } finally {
            setLoading(false); // Yükleme her zaman biter
        }
    };

    // Sayfa ilk yüklendiğinde notebook verilerini çek
    useEffect(() => {
        fetchNotebook(true); // İlk yüklemede loading göster
    }, [notebookId]);

    // Yeni mesaj geldiğinde sohbeti en alta kaydır
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [notebook?.messages]);

    // Dosya Seçme ve Yükleme Fonksiyonu
    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setSelectedFile(file);
        setUploadError('');
        setIsUploading(true);

        try {
            await uploadDocumentToNotebook(notebookId, file);
            setSelectedFile(null);
            document.getElementById('fileInput').value = null;
            await fetchNotebook(); // Listeyi güncellemek için veriyi tekrar çek
        } catch (err) {
            setUploadError(err.message || 'Dosya yüklenirken bir hata oluştu.');
            console.error("handleFileChange error:", err);
        } finally {
            setIsUploading(false);
        }
    };

    // Mesaj Gönderme Fonksiyonu
    const handleSendMessage = async () => {
        if (!newMessage.trim()) return;

        const userMessage = newMessage.trim();
        setNewMessage('');
        setIsSending(true);
        setError('');

        // Optimistic UI (İsteğe bağlı): Kullanıcı mesajını hemen ekle
        // Bu, backend yanıtını beklemeden daha hızlı bir his verir
        const tempMessageId = `temp_${Date.now()}`; // Geçici, benzersiz ID
        setNotebook(prev => ({
            ...prev,
            messages: [...(prev?.messages || []), { role: 'user', content: userMessage, _id: tempMessageId }]
        }));

        try {
            await postMessageToNotebook(notebookId, userMessage);
            // Başarılı! Backend hem kullanıcı mesajını hem de AI cevabını kaydetti.
            // Sayfanın TAM güncel halini (AI cevabı dahil) görmek için veriyi TEKRAR ÇEK.
            await fetchNotebook();
        } catch (err) {
            setError(err.message || 'Mesaj gönderilirken bir hata oluştu.');
            console.error("handleSendMessage error:", err);
            // Hata durumunda Optimistic UI'da eklenen mesajı geri al (daha sağlam)
            setNotebook(prev => ({
                ...prev,
                messages: prev.messages.filter(msg => msg._id !== tempMessageId)
            }));
        } finally {
            setIsSending(false);
        }
    };


    // --- Render Kısmı ---

    // İlk yükleme veya ilk hatayı ele al
    if (loading && !notebook) return <div className="loading">Notebook yükleniyor...</div>;
    if (error && !notebook) return <div className="error">Hata: {error}</div>;
    if (!notebook) return <div className="error">Notebook bulunamadı veya yüklenemedi.</div>;

    return (
        <div className="notebook-page-wrapper">
            <div className="main-container">
                <aside className="left-panel">
                    <div className="upload-section">
                        <button
                            className="upload-button"
                            onClick={() => document.getElementById('fileInput').click()}
                            disabled={isUploading}
                        >
                            <span className="material-symbols-outlined">upload_file</span>
                            <span>Yeni Belge Yükle</span>
                        </button>
                        <input
                            type="file"
                            id="fileInput"
                            accept=".pdf,.txt,.md"
                            onChange={handleFileChange}
                            disabled={isUploading}
                            style={{ display: 'none' }}
                        />
                    </div>
                    <h2 className="documents-header">
                        <span className="material-symbols-outlined">folder_open</span>
                        Belgeler
                    </h2>
                    <ul className="document-list">
                        {(loading && !notebook.associatedDocuments?.length) && <li className="document-item">Güncelleniyor...</li>}
                        {!loading && (!notebook.associatedDocuments || notebook.associatedDocuments.length === 0) ? (
                            <li className="document-item">
                                <p className="no-documents">Henüz belge yüklenmemiş.</p>
                            </li>
                        ) : (
                            notebook.associatedDocuments.map((doc, index) => (
                                <li key={doc._id || index} className={`document-item ${index === 0 ? 'active' : ''}`}>
                                    <span className="material-symbols-outlined document-icon">description</span>
                                    <div className="document-info">
                                        <div className="document-title">{doc.fileName}</div>
                                        <div className="document-status">
                                            <span className={`status-indicator ${doc.status === 'ready' || doc.status === 'completed' ? 'ready' : doc.status === 'processing' || doc.status === 'uploading' ? 'processing' : 'error'}`}></span>
                                            <span>{doc.status.charAt(0).toUpperCase() + doc.status.slice(1)}</span>
                                        </div>
                                    </div>
                                </li>
                            ))
                        )}
                    </ul>
                </aside>

                <main className="right-panel">
                    <div className="chat-area">
                        {(notebook.messages && notebook.messages.length === 0) && (
                            <div className="empty-chat-message">
                                <p>Belgeyle ilgili sorularınızı buraya yazabilirsiniz.</p>
                            </div>
                        )}
                        {notebook.messages?.map((msg, index) => (
                            <div key={msg._id || index} className={`message ${msg.role}`}>
                                <div className={`avatar ${msg.role}-avatar`}>
                                    <span className="material-symbols-outlined">
                                        {msg.role === 'user' ? 'person' : 'smart_toy'}
                                    </span>
                                </div>
                                <div className="message-content">{msg.content}</div>
                            </div>
                        ))}
                        {isSending && (
                            <div className="message ai">
                                <div className="avatar ai-avatar">
                                    <span className="material-symbols-outlined">smart_toy</span>
                                </div>
                                <div className="message-content">AI düşünüyor...</div>
                            </div>
                        )}
                        {error && !loading && <div className="error">Hata: {error}</div>}
                        <div ref={chatEndRef} />
                    </div>

                    <div className="message-input-area">
                        <div className="input-wrapper">
                            <input
                                className="message-input"
                                placeholder="Mesajınızı buraya yazın..."
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                disabled={isSending}
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleSendMessage();
                                    }
                                }}
                            />
                            <button
                                onClick={handleSendMessage}
                                className="send-button"
                                disabled={isSending || !newMessage.trim()}
                            >
                                <span className="material-symbols-outlined">send</span>
                            </button>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default NotebookPage;
import React, { useState, useEffect, useContext, useRef, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import {
    getNotebookById,
    uploadDocumentToNotebook,
    postMessageToNotebook,
    associatedDocumentToNotebook,
    getMyDocuments,
    getNotebookPreviewById
} from '../services/api';
import { AuthContext } from '../context/AuthContext';
import '../styles/NotebookPage.css';

const NotebookPage = () => {
    const { notebookId } = useParams();
    const { user } = useContext(AuthContext);
    const [notebook, setNotebook] = useState(null);
    const [loading, setLoading] = useState(true); // Genel sayfa yükleme durumu
    const [error, setError] = useState('');
    const [isPreview, setIsPreview] = useState(false)

    // Dosya Yükleme State'leri
    const [selectedFile, setSelectedFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadError, setUploadError] = useState('');
    const [uploadWarning, setUploadWarning] = useState('');

    // Sohbet State'leri
    const [newMessage, setNewMessage] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [isProcessingDocument, setIsProcessingDocument] = useState(false);
    const chatEndRef = useRef(null);


    const [allUserDocuments, setAllUserDocuments] = useState([])
    const [libraryLoading, setLibraryLoading] = useState(false)
    const [associateError, setAssociateError] = useState('')
    const [associatingDocId, setAssociatingDocId] = useState(null)
    const [selectedDocuments, setSelectedDocuments] = useState([]);

    const handleCheckboxChange = (docId) => {
        setSelectedDocuments(prevSelected => {
            if (prevSelected.includes(docId)) {
                return prevSelected.filter(id => id !== docId);
            } else {
                return [...prevSelected, docId];
            }
        });
    };


    // Notebook verilerini çeken fonksiyon
    const fetchNotebook = async (showLoadingIndicator = false) => {
        if (!notebookId || !user) return;
        setError('');
        if (showLoadingIndicator) setLoading(true); // Sadece ilk yüklemede veya gerekliyse


        try {

            const previewResponse = await getNotebookPreviewById(notebookId)
            const previewData = previewResponse.data

            if (previewData.owner._id == user._id) {
                setIsPreview(false)
                const fullResponse = await getNotebookById(notebookId)
                setNotebook(fullResponse.data)
            } else {
                setIsPreview(true)
                setNotebook(previewData)
            }

        } catch (err) {
            setError(err.message || 'Notebook detayları getirilirken bir hata oluştu.');
            console.error("fetchNotebook error:", err);
        } finally {
            setLoading(false); // Yükleme her zaman biter
        }
    };

    useEffect(() => {
        const fetchAllDocs = async () => {
            setLibraryLoading(true)
            try {
                const response = await getMyDocuments()
                setAllUserDocuments(response.data || [])
            } catch (error) {
                console.error("err::: fetch documents " + error)
            } finally {
                setLibraryLoading(false)
            }
        }

        fetchAllDocs()
    }, [])

    useEffect(() => {
        if (user) {
            fetchNotebook(true)
        }
        else {
            setLoading(true)
        }
    }, [notebookId, user]);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [notebook?.messages]);






    // Dosya Seçme ve Yükleme Fonksiyonu
    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setSelectedFile(file);
        setUploadError('');
        setUploadWarning('');
        setIsUploading(true);
        setIsProcessingDocument(true);

        try {
            const response = await uploadDocumentToNotebook(notebookId, file);
            if (response.message) {
                setUploadWarning(response.message);
            }
            setSelectedFile(null);
            document.getElementById('fileInput').value = null;
            await fetchNotebook(); // Listeyi güncellemek için veriyi tekrar çek
        } catch (err) {
            setUploadError(err.message || 'Dosya yüklenirken bir hata oluştu.');
            console.error("handleFileChange error:", err);
        } finally {
            setIsUploading(false);
            setIsProcessingDocument(false);
        }
    };

    // Mesaj Gönderme Fonksiyonu
    const handleSendMessage = async () => {
        if (!newMessage.trim()) return;

        const userMessage = newMessage.trim();
        setNewMessage('');
        setIsSending(true);
        setError('');


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


    const handleAssociate = async (documentId) => {
        setAssociatingDocId(documentId)
        setAssociateError('')

        try {
            await associatedDocumentToNotebook(notebookId, documentId)
        } catch (error) {
            setAssociateError('err::: Associate Document')
            console.error('handleAssociate Error:', error)
        } finally {
            setAssociatingDocId(null)
        }
    }

    const handleAssociateSelected = async () => {
        setAssociateError('');
        try {
            for (const docId of selectedDocuments) {
                setAssociatingDocId(docId);
                await associatedDocumentToNotebook(notebookId, docId);
            }
            await fetchNotebook();
            setSelectedDocuments([]);
        } catch (error) {
            setAssociateError('Error associating documents. Please try again.');
            console.error('handleAssociateSelected Error:', error);
        } finally {
            setAssociatingDocId(null);
        }
    };


    const libraryDocuments = useMemo(() => {
        if (!notebook || !allUserDocuments) return []

        const associatedDocIds = new Set(notebook.associatedDocuments.map(doc =>
            doc?._id
        ))

        return allUserDocuments.filter(doc => doc && !associatedDocIds.has(doc._id))
    }, [notebook, allUserDocuments])



    const truncateText = (text, maxLength) => {
        // if (!text) return ''
        if (text.length <= maxLength) {
            return text
        }
        return text.substring(0, maxLength) + '...'
    }

    // --- Render Kısmı ---

    // İlk yükleme veya ilk hatayı ele al
    if (loading && !notebook) return <div className="loading">Notebook yükleniyor...</div>;
    if (error && !notebook) return <div className="error">Hata: {error}</div>;
    if (!notebook) return <div className="error">Notebook bulunamadı veya yüklenemedi.</div>;

    return (
        <div>
            {!isPreview ? (
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
                                    <span>Upload Document</span>
                                </button>
                                {isProcessingDocument && <p className="upload-loading-message">Belge işleniyor...</p>}
                                {uploadWarning && <p style={{ color: 'orange' }}>{uploadWarning}</p>}
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
                                Documents
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




                            <div className="upload-section">
                                <h2 className="library-header">
                                    <span className="material-symbols-outlined">library_books</span>
                                    Library
                                </h2>
                                {libraryLoading && <p>Library Loading...</p>}
                                {!libraryLoading && libraryDocuments.length === 0 && (
                                    <p>There are no other documents in your library</p>
                                )}
                                {associateError && <p>{associateError}</p>}

                                {!libraryLoading && libraryDocuments.length > 0 && (
                                    <>
                                        <ul>                                    {libraryDocuments.map(doc => (
                                            <li key={doc._id}>
                                                <input
                                                    type="checkbox"
                                                    checked={selectedDocuments.includes(doc._id)}
                                                    onChange={() => handleCheckboxChange(doc._id)}
                                                />
                                                <span>{truncateText(doc.fileName, 28)}</span>
                                            </li>
                                        ))}
                                        </ul>
                                        <button
                                            onClick={handleAssociateSelected}
                                            disabled={selectedDocuments.length === 0}
                                            className='add-button'
                                        >
                                            Add
                                        </button>
                                    </>
                                )}


                            </div>



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
                </div>) : (
                <div></div>
            )}
        </div>
    );
};

export default NotebookPage;
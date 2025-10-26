import React, { useState, useEffect, useContext, useRef, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    getNotebookById,
    uploadDocumentToNotebook,
    postMessageToNotebook,
    associatedDocumentToNotebook,
    getMyDocuments,
    getNotebookPreviewById,
    updateNotebook,
    cloneNotebook
} from '../services/api';
import { AuthContext } from '../context/AuthContext';
import '../styles/NotebookPage.css';

const getFileIcon = (fileName) => {
    if (fileName.endsWith('.pdf')) return 'picture_as_pdf';
    if (fileName.endsWith('.txt')) return 'article';
    if (fileName.endsWith('.md')) return 'article';
    if (fileName.endsWith('.fig')) return 'palette';
    if (fileName.endsWith('.xlsx')) return 'table_chart';
    return 'description';
};

const NotebookPage = () => {
    const { notebookId } = useParams();
    const { user } = useContext(AuthContext);
    const [notebook, setNotebook] = useState(null);
    const [loading, setLoading] = useState(true); // General page loading status
    const [error, setError] = useState('');
    const [isPreview, setIsPreview] = useState(false)

    // File Upload States
    const [selectedFile, setSelectedFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [isSummaryExpanded, setIsSummaryExpanded] = useState(false);
    const [uploadError, setUploadError] = useState('');
    const [uploadWarning, setUploadWarning] = useState('');

    // Chat States
    const [newMessage, setNewMessage] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [isProcessingDocument, setIsProcessingDocument] = useState(false);
    const chatEndRef = useRef(null);


    const [allUserDocuments, setAllUserDocuments] = useState([])
    const [libraryLoading, setLibraryLoading] = useState(false)
    const [associateError, setAssociateError] = useState('')
    const [associatingDocId, setAssociatingDocId] = useState(null)
    const [selectedDocuments, setSelectedDocuments] = useState([]);


    const [isCloning, setIsCloning] = useState(false);
    const [cloneError, setCloneError] = useState('')


    const navigate = useNavigate()


    const handleClone = async () => {
        if (isCloning || !notebook) return;

        setIsCloning(true);
        setCloneError('');
        try {
            const response = await cloneNotebook(notebook._id);
            console.log("Notebook Cloned:", response.data);
            alert(`'${notebook.title} (Copy)' has been successfully added to your library! You are being redirected to the Dashboard.`);
            navigate(`/notebook/${response.data._id}`);
        } catch (err) {
            setCloneError(`Error while cloning: ${err.message}`);
            alert(`Error while cloning: ${err.message}`);
            console.error("handleClone error:", err);
        } finally {
            setIsCloning(false);
        }
    };

    const handleCheckboxChange = (docId) => {
        setSelectedDocuments(prevSelected => {
            if (prevSelected.includes(docId)) {
                return prevSelected.filter(id => id !== docId);
            } else {
                return [...prevSelected, docId];
            }
        });
    };


    const fetchNotebook = async (showLoadingIndicator = false) => {
        if (!notebookId || !user) return;
        setError('');
        if (showLoadingIndicator) setLoading(true);


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
            setError(err.message || 'An error occurred while fetching notebook details.');
            console.error("fetchNotebook error:", err);
        } finally {
            setLoading(false);
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
            await fetchNotebook();
        } catch (err) {
            setUploadError(err.message || 'An error occurred while uploading the file.');
            console.error("handleFileChange error:", err);
        } finally {
            setIsUploading(false);
            setIsProcessingDocument(false);
        }
    };

    const handleSendMessage = async () => {
        if (!newMessage.trim()) return;

        const userMessage = newMessage.trim();
        setNewMessage('');
        setIsSending(true);
        setError('');


        const tempMessageId = `temp_${Date.now()}`; // Temporary, unique ID
        setNotebook(prev => ({
            ...prev,
            messages: [...(prev?.messages || []), { role: 'user', content: userMessage, _id: tempMessageId }]
        }));

        try {
            await postMessageToNotebook(notebookId, userMessage);
            await fetchNotebook();
        } catch (err) {
            setError(err.message || 'An error occurred while sending the message.');
            console.error("handleSendMessage error:", err);
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
        if (text.length <= maxLength) {
            return text
        }
        return text.substring(0, maxLength) + '...'
    }


    if (loading && !notebook) return <div className="loading">Notebook loading...</div>;
    if (error && !notebook) return <div className="error">Error: {error}</div>;
    if (!notebook) return <div className="error">Notebook not found or could not be loaded.</div>;

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
                                {isProcessingDocument && <p className="upload-loading-message">Document is processing...</p>}
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
                                {(loading && !notebook.associatedDocuments?.length) && <li className="document-item">Updating...</li>}
                                {!loading && (!notebook.associatedDocuments || notebook.associatedDocuments.length === 0) ? (
                                    <li className="document-item">
                                        <p className="no-documents">No Document.</p>
                                    </li>
                                ) : (
                                    notebook.associatedDocuments.map((doc, index) => (
                                        <li key={doc._id || index} className={`document-item ${index === 0 ? 'active' : ''}`}>
                                            <span className="material-symbols-outlined">{getFileIcon(doc.fileName)}</span>                                            <div className="document-info">
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
                                                    className="mr-2"
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
                                        <p>You can write your questions about the document here.</p>
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
                                        <div className="message-content">AI is thinking...</div>
                                    </div>
                                )}
                                {error && !loading && <div className="error">Error: {error}</div>}
                                <div ref={chatEndRef} />
                            </div>

                            <div className="message-input-area">
                                <div className="input-wrapper">
                                    <input
                                        className="message-input"
                                        placeholder="Write your message here..."
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
                <body className="bg-page-bg font-display text-heading">
                    <div className="flex h-screen w-full p-6 md:p-8 lg:p-10">
                        <div className="flex w-full max-w-7xl mx-auto bg-panel-bg rounded-xl shadow-sm overflow-hidden">
                            <aside className="w-full max-w-sm flex-shrink-0 flex flex-col border-r border-black/5">
                                <div className="p-6">
                                    <h3
                                        className="flex items-center gap-3 text-heading text-lg font-bold leading-tight tracking-tight mb-4">
                                        <span className="material-symbols-outlined text-accent-teal">attachment</span>
                                        Associated Documents
                                    </h3>
                                    <div className="flex flex-col gap-2">
                                        {notebook.associatedDocuments && notebook.associatedDocuments.map(doc => (
                                            <div
                                                key={doc._id}
                                                className="flex items-center gap-4 bg-white/50 hover:bg-white/80 transition-colors duration-200 rounded-lg p-3 cursor-pointer">
                                                <div className="flex items-center gap-4 flex-1">
                                                    <div
                                                        className="text-accent-teal flex items-center justify-center rounded-lg bg-accent-teal/10 shrink-0 size-10">
                                                        <span className="material-symbols-outlined">{getFileIcon(doc.fileName)}</span>
                                                    </div>
                                                    <p className="text-heading text-base font-normal leading-normal flex-1 truncate">{doc.fileName}</p>
                                                </div>
                                                <div className="shrink-0">
                                                    <div className="text-heading/50 flex size-7 items-center justify-center">
                                                        <span className="material-symbols-outlined">chevron_right</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {isPreview && (

                                        <button
                                            className="clone-button header-clone-button"
                                            onClick={handleClone}
                                            disabled={isCloning}
                                            title="Copy this notebook to your library"
                                            style={{ marginTop: 10 }}
                                        >
                                            <span className="material-symbols-outlined">content_copy</span>
                                            {isCloning ? 'Cloning...' : 'Clone'}
                                        </button>
                                    )}

                                </div>
                            </aside>
                            <main className="flex-1 flex flex-col bg-page-bg/50 overflow-y-auto">
                                <div className="flex flex-col h-full">
                                    <div className="p-8 border-b border-black/5">
                                        <h1 className="text-heading text-4xl font-bold">{notebook.name}</h1>
                                        <p className="text-heading/70 mt-2">Created by {notebook.owner.username}</p>
                                        <section className="mt-6">
                                            <p className="text-heading/90 leading-relaxed">{notebook.description}</p>
                                        </section>
                                        {notebook.summary && (
                                            <section className="summary-card">
                                                <h4 className="summary-title">Summary</h4>
                                                <p className="summary-content">
                                                    {isSummaryExpanded ? notebook.summary : `${notebook.summary.substring(0, 250)}...`}
                                                </p>
                                                {notebook.summary.length > 250 && (
                                                    <button onClick={() => setIsSummaryExpanded(!isSummaryExpanded)} className="summary-toggle-button">
                                                        {isSummaryExpanded ? 'Show Less' : 'Show More'}
                                                    </button>
                                                )}
                                            </section>
                                        )}

                                    </div>
                                </div>
                            </main>
                        </div>
                    </div>
                </body>
            )}
        </div>
    );
};

export default NotebookPage;
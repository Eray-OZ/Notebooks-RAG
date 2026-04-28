import React, { useState, useEffect, useContext, useRef, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    getNotebookById,
    uploadDocumentToNotebook,
    postMessageToNotebook,
    associatedDocumentToNotebook,
    getMyDocuments,
    getNotebookPreviewById,
    cloneNotebook
} from '../services/api';
import { AuthContext } from '../context/AuthContext';

const getFileIcon = (fileName) => {
    if (fileName.endsWith('.pdf')) return 'picture_as_pdf';
    if (fileName.endsWith('.txt')) return 'article';
    if (fileName.endsWith('.md')) return 'article';
    if (fileName.endsWith('.xlsx') || fileName.endsWith('.csv')) return 'table';
    return 'description';
};

const NotebookPage = () => {
    const { notebookId } = useParams();
    const { user } = useContext(AuthContext);
    const [notebook, setNotebook] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isPreview, setIsPreview] = useState(false);

    const [isUploading, setIsUploading] = useState(false);
    const [isProcessingDocument, setIsProcessingDocument] = useState(false);
    const [uploadError, setUploadError] = useState('');
    const [uploadWarning, setUploadWarning] = useState('');

    const [newMessage, setNewMessage] = useState('');
    const [isSending, setIsSending] = useState(false);
    const chatEndRef = useRef(null);

    const [allUserDocuments, setAllUserDocuments] = useState([]);
    const [libraryLoading, setLibraryLoading] = useState(false);
    const [associateError, setAssociateError] = useState('');
    const [associatingDocId, setAssociatingDocId] = useState(null);
    const [selectedDocuments, setSelectedDocuments] = useState([]);
    const [showLibrary, setShowLibrary] = useState(false);

    const [isCloning, setIsCloning] = useState(false);
    const navigate = useNavigate();

    const handleClone = async () => {
        if (isCloning || !notebook) return;
        setIsCloning(true);
        try {
            const response = await cloneNotebook(notebook._id);
            navigate('/notebook/' + response.data._id);
        } catch (err) {
            alert('Error while cloning: ' + err.message);
            console.error('handleClone error:', err);
        } finally {
            setIsCloning(false);
        }
    };

    const handleCheckboxChange = (docId) => {
        setSelectedDocuments(prev => {
            if (prev.includes(docId)) return prev.filter(id => id !== docId);
            return [...prev, docId];
        });
    };

    const fetchNotebook = async (showLoadingIndicator = false) => {
        if (!notebookId || !user) return;
        setError('');
        if (showLoadingIndicator) setLoading(true);

        try {
            const previewResponse = await getNotebookPreviewById(notebookId);
            const previewData = previewResponse.data;

            if (previewData.owner._id == user._id) {
                setIsPreview(false);
                const fullResponse = await getNotebookById(notebookId);
                setNotebook(fullResponse.data);
            } else {
                setIsPreview(true);
                setNotebook(previewData);
            }
        } catch (err) {
            setError(err.message || 'An error occurred while fetching notebook details.');
            console.error('fetchNotebook error:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const fetchAllDocs = async () => {
            setLibraryLoading(true);
            try {
                const response = await getMyDocuments();
                setAllUserDocuments(response.data || []);
            } catch (error) {
                console.error('err::: fetch documents ' + error);
            } finally {
                setLibraryLoading(false);
            }
        };
        fetchAllDocs();
    }, []);

    useEffect(() => {
        if (user) {
            fetchNotebook(true);
        } else {
            setLoading(true);
        }
    }, [notebookId, user]);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [notebook?.messages]);

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsUploading(true);
        setIsProcessingDocument(true);
        setUploadError('');
        setUploadWarning('');

        try {
            const response = await uploadDocumentToNotebook(notebookId, file);
            if (response.message) setUploadWarning(response.message);
            e.target.value = null;
            await fetchNotebook();
        } catch (err) {
            setUploadError(err.message || 'An error occurred while uploading the file.');
            console.error('handleFileChange error:', err);
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

        const tempMessageId = 'temp_' + Date.now();
        setNotebook(prev => ({
            ...prev,
            messages: [...(prev?.messages || []), { role: 'user', content: userMessage, _id: tempMessageId }]
        }));

        try {
            await postMessageToNotebook(notebookId, userMessage);
            await fetchNotebook();
        } catch (err) {
            setError(err.message || 'An error occurred while sending the message.');
            setNotebook(prev => ({
                ...prev,
                messages: prev.messages.filter(msg => msg._id !== tempMessageId)
            }));
        } finally {
            setIsSending(false);
        }
    };

    const handleAssociateSelected = async () => {
        setAssociateError('');
        try {
            for (const docId of selectedDocuments) {
                setAssociatingDocId(docId);
                await associatedDocumentToNotebook(notebookId, docId);
            }
            await fetchNotebook();
            setSelectedDocuments([]);
            setShowLibrary(false);
        } catch (error) {
            setAssociateError('Error associating documents. Please try again.');
            console.error('handleAssociateSelected Error:', error);
        } finally {
            setAssociatingDocId(null);
        }
    };

    const libraryDocuments = useMemo(() => {
        if (!notebook || !allUserDocuments) return [];
        const associatedDocIds = new Set(notebook.associatedDocuments?.map(doc => doc?._id) || []);
        return allUserDocuments.filter(doc => doc && !associatedDocIds.has(doc._id));
    }, [notebook, allUserDocuments]);

    const truncateText = (text, maxLength) => {
        if (!text) return '';
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    };

    if (loading && !notebook) {
        return (
            <div className="flex items-center justify-center h-full text-on-surface-variant font-body-md">
                <span className="material-symbols-outlined animate-spin mr-2">progress_activity</span>
                Notebook loading...
            </div>
        );
    }
    if (error && !notebook) return <div className="flex items-center justify-center h-full text-error font-body-md">Error: {error}</div>;
    if (!notebook) return <div className="flex items-center justify-center h-full text-on-surface-variant font-body-md">Notebook not found or could not be loaded.</div>;

    return (
        <div className="h-full w-full flex flex-col overflow-hidden bg-[#050505] text-on-surface font-body-md text-body-md">
            {!isPreview ? (
                <div className="flex flex-1 overflow-hidden">
                    {/* Left Panel: Sources */}
                    <section className="w-full md:w-1/3 lg:w-[320px] bg-[#0C0C0C] border-r border-[#1E293B] flex flex-col h-full shrink-0">
                        <div className="p-4 border-b border-[#1E293B] flex flex-col gap-4">
                            <div className="flex justify-between items-center">
                                <h2 className="font-title-sm text-title-sm text-white">Sources</h2>
                                <span className="text-slate-500 font-body-sm text-body-sm">{notebook.associatedDocuments?.length || 0} loaded</span>
                            </div>
                            <button
                                onClick={() => document.getElementById('fileInput').click()}
                                disabled={isUploading}
                                className="w-full bg-primary-container text-white font-label-caps text-label-caps uppercase py-[14px] rounded-lg flex items-center justify-center gap-2 hover:bg-inverse-primary transition-colors disabled:opacity-50"
                            >
                                <span className="material-symbols-outlined">upload_file</span>
                                {isUploading ? 'Uploading...' : 'Upload Source'}
                            </button>
                            <input type="file" id="fileInput" accept=".pdf,.txt,.md" onChange={handleFileChange} disabled={isUploading} className="hidden" />
                            {isProcessingDocument && <p className="text-primary font-body-sm">Document is processing...</p>}
                            {uploadWarning && <p className="text-primary font-body-sm">{uploadWarning}</p>}
                            {uploadError && <p className="text-error font-body-sm">{uploadError}</p>}
                        </div>

                        {/* Documents List */}
                        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-xs">
                            {(loading && !notebook.associatedDocuments?.length) && (
                                <div className="text-on-surface-variant font-body-sm text-center py-4">Updating...</div>
                            )}
                            {!loading && (!notebook.associatedDocuments || notebook.associatedDocuments.length === 0) ? (
                                <div className="flex flex-col items-center justify-center py-10 text-on-surface-variant">
                                    <span className="material-symbols-outlined text-4xl mb-2 opacity-50">folder_open</span>
                                    <p className="font-body-sm">No sources yet.</p>
                                    <p className="font-label-caps text-label-caps mt-1">Upload to get started.</p>
                                </div>
                            ) : (
                                notebook.associatedDocuments.map((doc, index) => (
                                    <div key={doc._id || index} className={"flex items-center gap-3 bg-[#141414] border border-[#1E293B] rounded-lg p-3 hover:bg-[#1a1a1a] transition-colors" + (index === 0 ? ' border-l-4 border-l-[#6750A4]' : '')}>
                                        <span className="material-symbols-outlined text-on-surface-variant">{getFileIcon(doc.fileName)}</span>
                                        <div className="flex-1 min-w-0">
                                            <div className="font-body-sm text-body-sm text-on-surface truncate">{doc.fileName}</div>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className={"w-2 h-2 rounded-full " + (doc.status === 'ready' || doc.status === 'completed' ? 'bg-primary' : doc.status === 'processing' || doc.status === 'uploading' ? 'bg-primary animate-pulse' : 'bg-error')}></span>
                                                <span className="font-label-caps text-label-caps text-on-surface-variant uppercase">{doc.status.charAt(0).toUpperCase() + doc.status.slice(1)}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Library Section */}
                        <div className="border-t border-[#1E293B] p-4">
                            <button
                                onClick={() => setShowLibrary(!showLibrary)}
                                className="flex items-center gap-2 text-on-surface-variant hover:text-on-surface transition-colors font-label-caps text-label-caps uppercase tracking-wider w-full justify-between"
                            >
                                <div className="flex items-center gap-2">
                                    <span className="material-symbols-outlined">library_books</span>
                                    Document Library
                                </div>
                                <span className="material-symbols-outlined">{showLibrary ? 'expand_less' : 'expand_more'}</span>
                            </button>

                            {showLibrary && (
                                <div className="mt-3">
                                    {libraryLoading && <p className="text-on-surface-variant font-body-sm">Loading...</p>}
                                    {!libraryLoading && libraryDocuments.length === 0 && (
                                        <p className="text-on-surface-variant font-body-sm">No other documents available.</p>
                                    )}
                                    {associateError && <p className="text-error font-body-sm">{associateError}</p>}

                                    {!libraryLoading && libraryDocuments.length > 0 && (
                                        <div className="flex flex-col gap-2">
                                            <div className="max-h-48 overflow-y-auto flex flex-col gap-2">
                                                {libraryDocuments.map(doc => (
                                                    <label key={doc._id} className="flex items-center gap-3 bg-[#141414] border border-[#1E293B] rounded-lg p-3 cursor-pointer hover:bg-[#1a1a1a] transition-colors">
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedDocuments.includes(doc._id)}
                                                            onChange={() => handleCheckboxChange(doc._id)}
                                                            className="accent-primary-container w-4 h-4"
                                                        />
                                                        <span className="material-symbols-outlined text-on-surface-variant text-sm">{getFileIcon(doc.fileName)}</span>
                                                        <span className="font-body-sm text-body-sm text-on-surface truncate flex-1">{truncateText(doc.fileName, 28)}</span>
                                                    </label>
                                                ))}
                                            </div>
                                            <button
                                                onClick={handleAssociateSelected}
                                                disabled={selectedDocuments.length === 0}
                                                className="w-full bg-primary-container text-white font-label-caps text-label-caps uppercase py-2 rounded-lg hover:bg-inverse-primary transition-colors disabled:opacity-50 mt-2"
                                            >
                                                Add Selected
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Right Panel: Chat Canvas */}
                    <section className="flex-1 flex flex-col h-full overflow-hidden bg-[#050505] relative">
                        {/* Notebook Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1E293B] bg-[#0C0C0C] flex-shrink-0">
                            <div className="flex flex-col">
                                <h1 className="font-title-sm text-title-sm text-white mb-1">{notebook.title}</h1>
                                <div className="flex items-center gap-2">
                                    <span className="material-symbols-outlined text-primary text-[14px]">chat</span>
                                    <span className="font-label-caps text-label-caps text-primary uppercase">Chat</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-sm">
                                <button className="w-8 h-8 flex items-center justify-center rounded-full border border-[#1E293B] text-on-surface-variant hover:text-on-surface hover:bg-[#141414] transition-colors">
                                    <span className="material-symbols-outlined text-[18px]">edit</span>
                                </button>
                                <button className="w-8 h-8 flex items-center justify-center rounded-full border border-[#1E293B] text-on-surface-variant hover:text-on-surface hover:bg-[#141414] transition-colors">
                                    <span className="material-symbols-outlined text-[18px]">share</span>
                                </button>
                                <button className="w-8 h-8 flex items-center justify-center rounded-full border border-[#1E293B] text-on-surface-variant hover:text-on-surface hover:bg-[#141414] transition-colors">
                                    <span className="material-symbols-outlined text-[18px]">more_horiz</span>
                                </button>
                            </div>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-md">
                            {(!notebook.messages || notebook.messages.length === 0) && (
                                <div className="flex flex-col items-center justify-center h-full text-on-surface-variant">
                                    <div className="w-16 h-16 rounded-full border border-[#1E293B] flex items-center justify-center mb-4 bg-[#141414]">
                                        <span className="material-symbols-outlined text-3xl">chat_bubble_outline</span>
                                    </div>
                                    <p className="font-title-sm text-title-sm mb-2">Start the Analysis</p>
                                    <p className="font-body-sm text-body-sm max-w-md text-center">Ask questions about your uploaded documents to extract insights and synthesize information.</p>
                                </div>
                            )}

                            {notebook.messages?.map((msg, index) => (
                                <div key={msg._id || index} className={"flex gap-md " + (msg.role === 'user' ? 'flex-row-reverse' : '')}>
                                    <div className={"w-8 h-8 rounded-full flex items-center justify-center shrink-0 border " + (msg.role === 'user' ? 'bg-[#6750A4] border-[#6750A4] text-white' : 'bg-[#141414] border-[#1E293B] text-on-surface-variant')}>
                                        <span className="material-symbols-outlined text-[16px]">{msg.role === 'user' ? 'person' : 'smart_toy'}</span>
                                    </div>
                                    <div className={"max-w-[80%] rounded-xl p-4 font-body-md text-body-md leading-relaxed " + (msg.role === 'user' ? 'bg-[#6750A4] text-white rounded-tr-none' : 'bg-[#141414] border border-[#1E293B] text-on-surface rounded-tl-none')}>
                                        {msg.content}
                                    </div>
                                </div>
                            ))}

                            {isSending && (
                                <div className="flex gap-md">
                                    <div className="w-8 h-8 rounded-full bg-[#141414] border border-[#1E293B] text-on-surface-variant flex items-center justify-center shrink-0">
                                        <span className="material-symbols-outlined text-[16px] animate-pulse">smart_toy</span>
                                    </div>
                                    <div className="bg-[#141414] border border-[#1E293B] text-on-surface rounded-xl rounded-tl-none p-4 font-body-md">
                                        <div className="flex items-center gap-2">
                                            <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{animationDelay: '0ms'}}></span>
                                            <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{animationDelay: '150ms'}}></span>
                                            <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{animationDelay: '300ms'}}></span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {error && !loading && (
                                <div className="bg-error-container/20 border border-error text-on-error-container rounded-lg p-md font-body-sm">
                                    {error}
                                </div>
                            )}
                            <div ref={chatEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="p-4 border-t border-[#1E293B] bg-[#0C0C0C] flex-shrink-0">
                            <div className="flex items-center gap-sm bg-[#141414] border border-[#1E293B] rounded-xl px-4 py-2 focus-within:border-primary-container transition-colors">
                                <input
                                    className="flex-1 bg-transparent text-white font-body-md placeholder-on-surface-variant focus:outline-none py-2"
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
                                    disabled={isSending || !newMessage.trim()}
                                    className="w-10 h-10 rounded-full bg-primary-container text-white flex items-center justify-center hover:bg-inverse-primary transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                >
                                    <span className="material-symbols-outlined">send</span>
                                </button>
                            </div>
                        </div>
                    </section>
                </div>
            ) : (
                /* Preview Mode */
                <div className="flex flex-1 overflow-hidden">
                    <section className="w-full md:w-1/3 lg:w-[320px] bg-[#0C0C0C] border-r border-[#1E293B] flex flex-col h-full shrink-0">
                        <div className="p-6">
                            <h3 className="flex items-center gap-3 text-white text-lg font-bold leading-tight tracking-tight mb-4">
                                <span className="material-symbols-outlined text-primary">attachment</span>
                                Associated Documents
                            </h3>
                            <div className="flex flex-col gap-2">
                                {notebook.associatedDocuments && notebook.associatedDocuments.map(doc => (
                                    <div key={doc._id} className="flex items-center gap-4 bg-[#141414] border border-[#1E293B] hover:border-outline-variant transition-colors rounded-lg p-3 cursor-pointer">
                                        <div className="text-primary flex items-center justify-center rounded-lg bg-primary-container/10 shrink-0 w-10 h-10">
                                            <span className="material-symbols-outlined">{getFileIcon(doc.fileName)}</span>
                                        </div>
                                        <p className="text-on-surface text-base font-normal leading-normal flex-1 truncate">{doc.fileName}</p>
                                        <span className="material-symbols-outlined text-on-surface-variant">chevron_right</span>
                                    </div>
                                ))}
                            </div>
                            <button
                                onClick={handleClone}
                                disabled={isCloning}
                                className="w-full mt-4 bg-primary-container text-white font-label-caps text-label-caps uppercase py-[14px] rounded-lg flex items-center justify-center gap-2 hover:bg-inverse-primary transition-colors disabled:opacity-50"
                            >
                                <span className="material-symbols-outlined">content_copy</span>
                                {isCloning ? 'Cloning...' : 'Clone Notebook'}
                            </button>
                        </div>
                    </section>
                    <section className="flex-1 flex flex-col h-full overflow-y-auto bg-[#050505] p-8">
                        <h1 className="text-white text-4xl font-bold mb-2">{notebook.title}</h1>
                        <p className="text-on-surface-variant mt-2">Created by {notebook.owner?.username || 'Unknown'}</p>
                        <section className="mt-6">
                            <p className="text-on-surface leading-relaxed">{notebook.description}</p>
                        </section>
                    </section>
                </div>
            )}
        </div>
    );
};

export default NotebookPage;

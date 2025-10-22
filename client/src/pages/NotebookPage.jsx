// client/src/pages/NotebookPage.jsx

import React, { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { getNotebookById } from '../services/api'; // <-- AZ ÖNCE EKLEDİĞİMİZ FONKSİYON
import { AuthContext } from '../context/AuthContext';

const NotebookPage = () => {
    const { notebookId } = useParams();
    const { user } = useContext(AuthContext);
    const [notebook, setNotebook] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchNotebook = async () => {
            if (!notebookId) return;
            setError(''); // Önceki hataları temizle
            setLoading(true);
            try {
                const response = await getNotebookById(notebookId);
                setNotebook(response.data);
            } catch (err) {
                // handleApiError zaten objeyi fırlatıyor, err.message kullanabiliriz
                setError(err.message || 'Notebook detayları getirilirken bir hata oluştu.');
                console.error("fetchNotebook error:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchNotebook();
    }, [notebookId]); // notebookId değişirse tekrar çek

    if (loading) return <div>Notebook yükleniyor...</div>;
    // Hata mesajını daha belirgin gösterelim
    if (error) return <div style={{ color: 'red', border: '1px solid red', padding: '10px' }}>Hata: {error}</div>;
    // Notebook null ise (ve hata yoksa) bu durum oluşmamalı ama garanti olsun
    if (!notebook) return <div>Notebook bulunamadı veya yüklenemedi.</div>;

    // --- TEMEL 3 PANELLİ YAPI ---
    return (
        <div style={{ display: 'flex', height: 'calc(100vh - 80px)' }}> {/* Navbar yüksekliğini çıkar */}

            {/* Sol Panel: Belge Yönetimi (Şimdilik Sadece Listeleme) */}
            <div style={{ width: '30%', borderRight: '1px solid #ccc', padding: '1rem', overflowY: 'auto' }}>
                <h3>Belgeler</h3>
                {/* Yükleme formu daha sonra eklenecek */}
                <h4>Bu Notebook'taki Belgeler</h4>
                {notebook.associatedDocuments?.length === 0 ? ( // ?. ile kontrol daha güvenli
                    <p style={{ fontStyle: 'italic', color: '#666' }}>Henüz belge ilişkilendirilmemiş.</p>
                ) : (
                    <ul style={{ listStyle: 'none', padding: 0 }}>
                        {notebook.associatedDocuments.map(doc => (
                            <li key={doc?._id} style={{ marginBottom: '5px' }}> {/* ?. ekledik */}
                                {doc?.fileName || 'Bilinmeyen Belge'} {/* ?. ekledik */}
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {/* Orta ve Alt Panel: Sohbet Alanı (Şimdilik Sadece Gösterme) */}
            <div style={{ width: '70%', display: 'flex', flexDirection: 'column' }}>
                <h2>{notebook.title}</h2>
                {/* Sohbet Geçmişi Alanı */}
                <div style={{ flexGrow: 1, borderBottom: '1px solid #ccc', padding: '1rem', overflowY: 'auto' }}>
                    {notebook.messages?.length === 0 ? ( // ?. ekledik
                        <p style={{ fontStyle: 'italic', color: '#666' }}>Sohbet geçmişi boş.</p>
                    ) : (
                        notebook.messages.map((msg, index) => (
                            <div key={index} style={{ marginBottom: '0.5rem', textAlign: msg.role === 'user' ? 'right' : 'left' }}>
                                <strong>{msg.role === 'user' ? (user?.username || 'Siz') : 'AI'}:</strong> {msg.content}
                            </div>
                        ))
                    )}
                </div>
                {/* Mesaj Girdi Alanı (İşlevsiz) */}
                <div style={{ padding: '1rem' }}>
                    <textarea style={{ width: '100%', minHeight: '50px' }} placeholder="Mesajınızı yazın..." disabled></textarea>
                    <button disabled>Gönder</button>
                </div>
            </div>
        </div>
    );
};

export default NotebookPage;
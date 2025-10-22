import React, { useState } from 'react';
import { createNotebook } from '../services/api';
import { useNavigate } from 'react-router-dom';

const CreateNotebookModal = ({ isOpen, onClose }) => {
    // State'ler
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [isPublic, setIsPublic] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    // Modal kapalıysa render etme
    if (!isOpen) {
        return null;
    }

    // Oluşturma fonksiyonu
    const handleCreate = async () => {
        if (!title.trim()) {
            setError('Lütfen bir başlık girin.');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            console.log('handleCreate içinde description:', description);
            const notebookData = { title, description, isPublic };
            const response = await createNotebook(notebookData);
            const newNotebookId = response.data._id;

            // State'leri sıfırla
            setTitle('');
            setDescription('');
            setIsPublic(false);

            onClose(); // Modalı kapat
            navigate(`/notebook/${newNotebookId}`); // Yönlendir
        } catch (err) {
            setError(err.message || 'Notebook oluşturulurken bir hata oluştu.');
            console.error("CreateNotebookModal error:", err);
            setIsLoading(false);
        }
    };

    // İptal ve Kapatma fonksiyonu
    const handleClose = () => {
        // Yükleme sırasında kapatmayı engelle (opsiyonel)
        if (isLoading) return;
        // State'leri sıfırla
        setTitle('');
        setDescription('');
        setIsPublic(false);
        setError('');
        onClose(); // Dashboard'daki kapatma fonksiyonunu çağır
    };

    // Modal JSX yapısı
    return (
        // Overlay Katmanı
        <div style={modalOverlayStyle} onClick={handleClose}> {/* Dışarı tıklayınca kapat */}
            {/* İçerik Penceresi (Tıklamayı durdur) */}
            <div style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
                <h2>Yeni Notebook Oluştur</h2>

                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Notebook Başlığı (Zorunlu)"
                    style={inputStyle}
                    disabled={isLoading}
                    aria-label="Notebook Başlığı"
                />

                <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Açıklama (Opsiyonel)"
                    rows="3"
                    style={{ ...inputStyle, height: 'auto', resize: 'vertical' }}
                    disabled={isLoading}
                    aria-label="Notebook Açıklaması"
                />

                <div style={{ margin: '10px 0 20px 0', textAlign: 'left', paddingLeft: '5%' }}>
                    <label>
                        <input
                            type="checkbox"
                            checked={isPublic}
                            onChange={(e) => setIsPublic(e.target.checked)}
                            disabled={isLoading}
                            style={{ marginRight: '5px' }}
                        />
                        Herkese Açık Yap
                    </label>
                </div>

                {error && <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>}

                <div style={{ marginTop: '15px' }}>
                    <button
                        onClick={handleCreate}
                        disabled={isLoading || !title.trim()} // Başlık yoksa da pasif yap
                        style={{ marginRight: '10px', padding: '8px 15px', cursor: 'pointer' }}
                    >
                        {isLoading ? 'Oluşturuluyor...' : 'Oluştur'}
                    </button>
                    <button
                        onClick={handleClose}
                        disabled={isLoading}
                        style={{ padding: '8px 15px', cursor: 'pointer' }}
                    >
                        İptal
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- GEREKLİ STİLLER ---
const modalOverlayStyle = {
    position: 'fixed', // Ekrana sabitler
    top: 0,
    left: 0,
    right: 0,
    bottom: 0, // Tüm ekranı kaplar
    backgroundColor: 'rgba(0, 0, 0, 0.6)', // Yarı saydam arka plan
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center', // İçeriği ortalar
    zIndex: 1050 // Diğer içeriklerin üzerine çıkar (Bootstrap modal z-index'i gibi)
};

const modalContentStyle = {
    backgroundColor: 'white',
    padding: '25px',
    borderRadius: '8px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)', // Hafif gölge
    width: '90%', // Küçük ekranlarda daha iyi görünüm
    maxWidth: '450px', // Maksimum genişlik
    textAlign: 'center',
    zIndex: 1051 // Overlay'in de üzerine çıkar
};

const inputStyle = {
    width: 'calc(90% - 22px)', // Padding'i hesaba kat
    padding: '10px',
    marginBottom: '15px',
    border: '1px solid #ccc',
    borderRadius: '4px',
    fontSize: '1rem'
};
// --- STİLLER BİTTİ ---

export default CreateNotebookModal;
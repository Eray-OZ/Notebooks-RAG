import React, { useState } from 'react';
import { createNotebook } from '../services/api';
import { useNavigate } from 'react-router-dom';
import '../styles/Modal.css';

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
        <div className="modal-overlay" onClick={handleClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <h2 className="modal-header">Yeni Notebook Oluştur</h2>

                <div className="form-group">
                    <label className="form-label" htmlFor="notebook-title">
                        Notebook Başlığı
                    </label>
                    <input
                        type="text"
                        id="notebook-title"
                        className="form-input"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Örn: Proje Fikirleri"
                        disabled={isLoading}
                        aria-label="Notebook Başlığı"
                    />
                </div>

                <div className="form-group">
                    <label className="form-label" htmlFor="notebook-description">
                        Açıklama
                    </label>
                    <textarea
                        id="notebook-description"
                        className="form-textarea"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Kısa bir açıklama girin..."
                        disabled={isLoading}
                        aria-label="Notebook Açıklaması"
                    />
                </div>

                <div className="form-checkbox">
                    <input
                        type="checkbox"
                        id="public-checkbox"
                        checked={isPublic}
                        onChange={(e) => setIsPublic(e.target.checked)}
                        disabled={isLoading}
                    />
                    <label htmlFor="public-checkbox">Herkese Açık Yap</label>
                </div>

                {error && <p className="modal-error">{error}</p>}

                <div className="modal-actions">
                    <button
                        className="modal-button secondary"
                        onClick={handleClose}
                        disabled={isLoading}
                    >
                        İptal
                    </button>
                    <button
                        className="modal-button primary"
                        onClick={handleCreate}
                        disabled={isLoading || !title.trim()}
                    >
                        {isLoading ? 'Oluşturuluyor...' : 'Oluştur'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CreateNotebookModal;
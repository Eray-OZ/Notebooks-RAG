import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
// --- Gerekli API fonksiyonlarını import et ---
import {
    getPublicNotebooks,          // Tüm public olanlar için
    searchPublicNotebooks,       // Metin araması için (kategorisiz)
    getPublicNotebooksByCategory // Kategoriye göre filtrelemek için
} from '../services/api';
import '../styles/HomePage.css'; // Stil dosyanı import etmeyi unutma

// --- Yardımcı Kısaltma Fonksiyonu ---
const truncateText = (text = '', maxLength = 100) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
};
// --- Bitti ---


const HomePage = () => {
    const [notebooks, setNotebooks] = useState([]);
    // --- İki farklı loading state kullanalım ---
    const [initialLoading, setInitialLoading] = useState(true); // Sadece ilk yükleme
    const [isLoading, setIsLoading] = useState(false); // Arama veya filtreleme sırasındaki yükleme
    // --- Bitti ---
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const searchTimeoutRef = useRef(null);
    // --- Kategori State'i ---
    const [selectedCategory, setSelectedCategory] = useState(''); // Seçili kategori (boş = hepsi)
    const predefinedCategories = ['Technology', 'History', 'General', 'Others']; // Örnek kategoriler
    // --- Bitti ---


    // --- useEffect (Arama ve Kategori Mantığı ile Güncellendi) ---
    useEffect(() => {
        const performFetchOrSearch = async () => {
            setError('');
            // İlk yükleme değilse normal loading'i başlat
            if (!initialLoading) setIsLoading(true);

            try {
                let response;
                // 1. Arama terimi var mı? (Metin araması öncelikli)
                if (searchTerm.trim() !== '') {
                    console.log(`[Frontend] Searching for: "${searchTerm}"`);
                    // Sadece metin araması yapan API'yi çağır
                    response = await searchPublicNotebooks(searchTerm);
                }
                // 2. Arama terimi yoksa, Kategori seçili mi?
                else if (selectedCategory) {
                    console.log(`[Frontend] Fetching category: "${selectedCategory}"`);
                    // Yeni kategori endpoint'ini çağır
                    response = await getPublicNotebooksByCategory(selectedCategory);
                }
                // 3. İkisi de yoksa, TÜM public olanları getir.
                else {
                    console.log("[Frontend] Fetching all public notebooks...");
                    // Kategori parametresi olmayan public endpoint'ini çağır
                    response = await getPublicNotebooks();
                }
                setNotebooks(response.data || []); // Gelen veriyi veya boş dizi ata
            } catch (err) {
                setError(err.message || 'Notebooklar getirilirken/aranırken bir hata oluştu.');
                setNotebooks([]); // Hata durumunda listeyi temizle
                console.error("fetch/search error:", err);
            } finally {
                setInitialLoading(false); // İlk yükleme bitti
                setIsLoading(false);      // Normal yükleme bitti
            }
        };

        // --- Debouncing Mantığı ---
        if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
        searchTimeoutRef.current = setTimeout(() => {
            performFetchOrSearch(); // API çağrısını gecikmeli yap
        }, 500); // 500ms bekle

        // Cleanup
        return () => { if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current); };

    }, [searchTerm, selectedCategory, initialLoading]); // initialLoading'i de ekleyelim ki ilk başta çalışsın
    // --- useEffect BİTTİ ---


    // --- Render Kısmı ---
    // Sadece İLK YÜKLEME için tam sayfa loading
    if (initialLoading) {
        return <div className="loading-container">Sayfa Yükleniyor...</div>;
    }

    return (
        <div className="container-root">
            <div className="content-wrapper">
                <div className="header">
                    <h1 className="title">Notebookları Keşfet</h1>
                    <p className="subtitle">Topluluğumuzdaki harika notları ve belgeleri arayın.</p>
                </div>

                {/* Search Area */}
                <div className="search-area">
                    <div className="search-container">
                        <span className="material-symbols-outlined search-icon">search</span>
                        <input
                            type="search"
                            placeholder="Başlık, açıklama veya özette ara..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="search-input"
                            disabled={isLoading}
                        />
                    </div>
                    <select
                        className="category-select"
                        value={selectedCategory}
                        onChange={(e) => {
                            setSearchTerm('');
                            setSelectedCategory(e.target.value);
                        }}
                        disabled={isLoading}
                    >
                        <option value="">Tüm Kategoriler</option>
                        {predefinedCategories.map(cat => (<option key={cat} value={cat}>{cat}</option>))}
                    </select>
                </div>

                {/* Hata Mesajı */}
                {error && <div className="error-container" style={{ color: 'red', marginBottom: '15px', textAlign: 'center' }}>{error}</div>}



                {/* Sonuç Yoksa veya Liste Boşsa */}
                {!isLoading && notebooks.length === 0 ? (
                    <p className="subtitle" style={{ textAlign: 'center', marginTop: '30px' }}>
                        {searchTerm
                            ? `"${searchTerm}" için sonuç bulunamadı.`
                            : (selectedCategory ? `"${selectedCategory}" kategorisinde notebook bulunamadı.` : "Gösterilecek herkese açık notebook bulunmuyor.")
                        }
                    </p>
                ) : (
                    // Notebook Listesi
                    <div className="notebooks-grid">
                        {notebooks.map((notebook, index) => (
                            <div className={`notebook-card color-${(index % 5) + 1}`} key={notebook._id}>
                                <div className="card-header">
                                    <h2 className="notebook-title">{notebook.title}</h2>
                                    <p className="notebook-author">by {notebook.owner?.username || 'Bilinmiyor'}</p>
                                </div>
                                <div className="card-body">
                                    {notebook.description && <p className="notebook-description">{truncateText(notebook.description, 120)}</p>}

                                    {!notebook.description && <p className="notebook-description placeholder">No description provided.</p>}
                                </div>
                                <div className="card-footer">
                                    <div className="likes-container">
                                        <span className="material-symbols-outlined likes-icon">favorite</span>
                                        <span>{notebook.likes?.length || 0}</span>
                                    </div>
                                    <Link className="view-button" to={`/notebook/${notebook._id}`}>İncele</Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default HomePage;
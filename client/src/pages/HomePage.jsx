import React, { useState, useEffect, useRef, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    getPublicNotebooks,
    searchPublicNotebooks,
    getPublicNotebooksByCategory,
    cloneNotebook,
    likeNotebook
} from '../services/api';
import '../styles/HomePage.css';
import { AuthContext } from '../context/AuthContext'

const truncateText = (text = '', maxLength = 100) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
};


const HomePage = () => {

    const [notebooks, setNotebooks] = useState([])
    const [initialLoading, setInitialLoading] = useState(true)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')
    const [searchTerm, setSearchTerm] = useState('')
    const searchTimeoutRef = useRef(null)
    const [selectedCategory, setSelectedCategory] = useState('')
    const predefinedCategories = ['Technology', 'History', 'General', 'Others']
    const [cloningId, setCloningId] = useState(null)
    const [cloneError, setCloneError] = useState('')
    const [likingId, setLikingId] = useState(null)

    const navigate = useNavigate()
    const { user } = useContext(AuthContext)


    const handleLike = async (notebookId) => {
        if (!user) {
            alert("You must be logged in to like.");
            return;
        }
        if (likingId) return

        setLikingId(notebookId)

        try {
            const response = await likeNotebook(notebookId)
            const updatedNotebook = response.data


            setNotebooks(prevNotebooks =>
                prevNotebooks.map(nb =>
                    nb._id === updatedNotebook._id ? updatedNotebook : nb
                )
            )

        } catch (err) {
            console.error("handleLike error:", err)
            alert(`Error while liking: ${err.message}`)
        } finally {
            setLikingId(null);
        }
    };


    const handleClone = async (idToClone, titleToClone) => {
        if (cloningId) return;

        setCloningId(idToClone);
        setCloneError('');
        try {
            const response = await cloneNotebook(idToClone);
            console.log("Notebook Cloned:", response.data);
            navigate(`/notebook/${response.data._id}`);
        } catch (err) {
            setCloneError(`Error while cloning: ${err.message}`);
            alert(`Error while cloning: ${err.message}`);
            console.error("handleClone error:", err);
        } finally {
            setCloningId(null);
        }
    };


    useEffect(() => {
        const performFetchOrSearch = async () => {
            setError('');
            if (!initialLoading) setIsLoading(true);

            try {
                let response;
                if (searchTerm.trim() !== '') {
                    console.log(`[Frontend] Searching for: "${searchTerm}"`);
                    response = await searchPublicNotebooks(searchTerm);
                }
                else if (selectedCategory) {
                    console.log(`[Frontend] Fetching category: "${selectedCategory}"`);
                    response = await getPublicNotebooksByCategory(selectedCategory);
                }
                else {
                    console.log("[Frontend] Fetching all public notebooks...");
                    response = await getPublicNotebooks();
                }
                setNotebooks(response.data || []);
            } catch (err) {
                setError(err.message || 'An error occurred while fetching/searching for notebooks.');
                setNotebooks([]);
                console.error("fetch/search error:", err);
            } finally {
                setInitialLoading(false);
                setIsLoading(false);
            }
        };

        if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
        searchTimeoutRef.current = setTimeout(() => {
            performFetchOrSearch();
        }, 500);

        return () => { if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current); };

    }, [searchTerm, selectedCategory, initialLoading]);

    if (initialLoading) {
        return <div className="loading-container">Page Loading...</div>;
    }

    return (
        <div className="container-root">
            <div className="fixed-header-wrapper">
                <div className="fixed-header-inner">
                    <div className="header">
                        <h1 className="title">Discover Notebooks</h1>
                        <p className="subtitle">Search for great notes and documents from our community.</p>
                    </div>

                    <div className="search-area">
                        <div className="search-container">
                            <span className="material-symbols-outlined search-icon">search</span>
                            <input
                                type="search"
                                placeholder="Search in title, description, or summary..."
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
                            <option value="">All Categories</option>
                            {predefinedCategories.map(cat => (<option key={cat} value={cat}>{cat}</option>))}
                        </select>
                    </div>
                </div>
            </div>

            <div className="content-wrapper">
                <div className="scrollable-content">
                    {error && <div className="error-container" style={{ color: 'red', marginBottom: '15px', textAlign: 'center' }}>{error}</div>}

                    {!isLoading && notebooks.length === 0 ? (
                        <p className="subtitle" style={{ textAlign: 'center', marginTop: '30px' }}>
                            {searchTerm
                                ? `No results found for "${searchTerm}".`
                                : (selectedCategory ? `No notebooks found in the "${selectedCategory}" category.` : "No public notebooks to display.")
                            }
                        </p>
                    ) : (
                        <div className="notebooks-grid">
                            {notebooks.map((notebook, index) => {
                                const isLikedByUser = user && notebook.likes?.includes(user._id);

                                return (
                                    <div className={`notebook-card color-${(index % 5) + 1}`} key={notebook._id}>
                                        <div className="card-header">
                                            <h2 className="notebook-title">{notebook.title}</h2>
                                            <p className="notebook-author">by {notebook.owner?.username || 'Unknown'}</p>
                                        </div>
                                        <div className="card-body">
                                            {notebook.description ? (
                                                <p className="notebook-description">
                                                    {truncateText(notebook.description, 120)}
                                                </p>
                                            ) : (
                                                <p className="notebook-description placeholder">
                                                    No description provided.
                                                </p>
                                            )}
                                        </div>
                                        <div className="card-footer">
                                            <div
                                                className={`likes-container ${isLikedByUser ? 'liked' : ''} ${likingId === notebook._id ? 'liking' : ''}`}
                                                onClick={() => handleLike(notebook._id)}
                                                style={{ cursor: user ? 'pointer' : 'not-allowed' }}
                                                title={user ? (isLikedByUser ? 'Unlike' : 'Like') : 'Login to like'}
                                            >
                                                <span className="material-symbols-outlined likes-icon">
                                                    {likingId === notebook._id ? 'hourglass_top' : (isLikedByUser ? 'favorite' : 'favorite_border')}
                                                </span>
                                                <span>{notebook.likes?.length || 0}</span>
                                            </div>
                                            <div className="card-actions">
                                            <button
                                                className="clone-button"
                                                onClick={() => handleClone(notebook._id, notebook.title)}
                                                disabled={cloningId === notebook._id || (cloningId !== null)}
                                                title="Copy this notebook to your library"
                                            >
                                                {cloningId === notebook._id ? 'Cloning...' : 'Clone'}
                                            </button>
                                            <Link className="view-button" to={`/notebook/${notebook._id}`}>View</Link>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default HomePage;
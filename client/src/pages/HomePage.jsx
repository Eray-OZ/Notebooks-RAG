import React, { useState, useEffect, useRef, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    getPublicNotebooks,
    searchPublicNotebooks,
    getPublicNotebooksByCategory,
    cloneNotebook,
    likeNotebook
} from '../services/api';
import { AuthContext } from '../context/AuthContext';

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
                    response = await searchPublicNotebooks(searchTerm);
                }
                else if (selectedCategory) {
                    response = await getPublicNotebooksByCategory(selectedCategory);
                }
                else {
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

        if (searchTerm.trim() !== '') {
            if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
            searchTimeoutRef.current = setTimeout(() => {
                performFetchOrSearch();
            }, 400);
        } else {
            performFetchOrSearch();
        }

        return () => { if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current); };
    }, [searchTerm, selectedCategory]);

    if (initialLoading) {
        return (
            <div className="flex items-center justify-center h-full text-on-surface-variant font-body-md">
                <span className="material-symbols-outlined animate-spin mr-2">progress_activity</span>
                Page Loading...
            </div>
        );
    }

    const featured = notebooks[0];
    const rest = notebooks.slice(1);

    return (
        <div className="p-gutter md:p-lg">
            <div className="max-w-container-max mx-auto">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-xl">
                    <div>
                        <h1 className="font-headline-md text-headline-md text-on-surface mb-xs">Library Discovery</h1>
                        <p className="font-body-md text-body-md text-on-surface-variant max-w-2xl">Explore advanced RAG pipelines, curated datasets, and high-performance embedding models across the enterprise network.</p>
                    </div>
                    <div className="relative w-full md:w-96 flex-shrink-0">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline-variant">search</span>
                        <input
                            className="w-full bg-[#0C0C0C] border border-[#1E293B] text-on-surface font-body-sm text-body-sm rounded py-3 pl-10 pr-4 focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container transition-colors placeholder:text-outline-variant"
                            placeholder="Search notebooks, authors, or tags..."
                            type="text"
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setSelectedCategory('');
                            }}
                        />
                    </div>
                </div>

                {/* Filter Chips */}
                <div className="flex flex-wrap gap-sm mb-lg border-b border-[#1E293B] pb-md">
                    <button
                        onClick={() => setSelectedCategory('')}
                        className={`px-4 py-2 rounded-full font-label-caps text-label-caps border transition-colors ${
                            selectedCategory === ''
                                ? 'bg-primary-container text-white border-primary-container'
                                : 'bg-[#0C0C0C] text-on-surface-variant border-[#1E293B] hover:border-outline-variant hover:text-white'
                        }`}
                    >
                        ALL NOTEBOOKS
                    </button>
                    {predefinedCategories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => {
                                setSearchTerm('');
                                setSelectedCategory(cat);
                            }}
                            className={`px-4 py-2 rounded-full font-label-caps text-label-caps border transition-colors ${
                                selectedCategory === cat
                                    ? 'bg-primary-container text-white border-primary-container'
                                    : 'bg-[#0C0C0C] text-on-surface-variant border-[#1E293B] hover:border-outline-variant hover:text-white'
                            }`}
                        >
                            {cat.toUpperCase()}
                        </button>
                    ))}
                </div>

                {error && (
                    <div className="bg-error-container border border-error text-on-error-container rounded-lg px-md py-sm font-body-sm text-body-sm mb-lg">
                        {error}
                    </div>
                )}

                {!isLoading && notebooks.length === 0 ? (
                    <p className="font-body-md text-body-md text-on-surface-variant text-center mt-xl">
                        {searchTerm
                            ? `No results found for "${searchTerm}".`
                            : (selectedCategory ? `No notebooks found in the "${selectedCategory}" category.` : "No public notebooks to display.")
                        }
                    </p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-md">
                        {/* Featured Card */}
                        {featured && (
                            <div className="md:col-span-2 bg-[#0C0C0C] border border-[#1E293B] rounded flex flex-col md:flex-row overflow-hidden group hover:border-outline-variant transition-colors">
                                <div className="w-full md:w-2/5 h-48 md:h-auto relative bg-[#141414] border-b md:border-b-0 md:border-r border-[#1E293B] flex items-center justify-center">
                                    <span className="material-symbols-outlined text-[64px] text-primary-container opacity-40">auto_stories</span>
                                    <div className="absolute top-4 left-4 bg-[#050505] border border-[#1E293B] px-2 py-1 rounded font-label-caps text-label-caps text-primary">FEATURED</div>
                                </div>
                                <div className="p-6 flex flex-col justify-between flex-1">
                                    <div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="material-symbols-outlined text-outline-variant text-[16px]">schema</span>
                                            <span className="font-label-caps text-label-caps text-on-surface-variant">{featured.category || 'General'}</span>
                                        </div>
                                        <h3 className="font-title-sm text-title-sm text-on-surface mb-2 group-hover:text-primary transition-colors">{featured.title}</h3>
                                        <p className="font-body-sm text-body-sm text-on-surface-variant line-clamp-2">{truncateText(featured.description, 180)}</p>
                                    </div>
                                    <div className="mt-6 flex items-center justify-between border-t border-[#1E293B] pt-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-surface-container border border-[#1E293B] flex items-center justify-center font-label-caps text-label-caps text-on-surface">
                                                {featured.owner?.username?.substring(0, 2).toUpperCase() || 'UN'}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="font-body-sm text-body-sm text-on-surface leading-tight">{featured.owner?.username || 'Unknown'}</span>
                                                <span className="font-label-caps text-label-caps text-outline-variant leading-tight mt-1">{featured.category || 'Notebook'}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4 text-outline-variant">
                                            <div className="flex items-center gap-1 font-label-caps text-label-caps">
                                                <span className="material-symbols-outlined text-[14px]">visibility</span>
                                                {featured.views || 0}
                                            </div>
                                            <button
                                                onClick={() => handleLike(featured._id)}
                                                className={`flex items-center gap-1 font-label-caps text-label-caps transition-colors ${
                                                    user && featured.likes?.includes(user._id) ? 'text-error' : 'hover:text-error'
                                                }`}
                                                style={{ cursor: user ? 'pointer' : 'not-allowed' }}
                                            >
                                                <span className="material-symbols-outlined text-[14px]">
                                                    {likingId === featured._id ? 'hourglass_top' : (user && featured.likes?.includes(user._id) ? 'favorite' : 'favorite_border')}
                                                </span>
                                                {featured.likes?.length || 0}
                                            </button>
                                        </div>
                                    </div>
                                    <div className="mt-4 flex items-center gap-3">
                                        <button
                                            onClick={() => handleClone(featured._id, featured.title)}
                                            disabled={cloningId === featured._id || cloningId !== null}
                                            className="bg-primary-container text-white px-4 py-2 rounded font-label-caps text-label-caps uppercase hover:bg-inverse-primary transition-colors disabled:opacity-50"
                                        >
                                            {cloningId === featured._id ? 'Cloning...' : 'Clone'}
                                        </button>
                                        <Link to={`/notebook/${featured._id}`} className="border border-[#1E293B] text-on-surface px-4 py-2 rounded font-label-caps text-label-caps uppercase hover:border-outline-variant transition-colors">
                                            View
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Rest of Cards */}
                        {rest.map((notebook, index) => {
                            const isLikedByUser = user && notebook.likes?.includes(user._id);
                            const icons = ['dataset', 'model_training', 'memory', 'terminal', 'api', 'science'];
                            const icon = icons[index % icons.length];
                            const statuses = ['DATA PREP', 'FINETUNING', 'EVALUATION', 'PIPELINE', 'API', 'RESEARCH'];
                            const status = statuses[index % statuses.length];

                            return (
                                <div className="bg-[#0C0C0C] border border-[#1E293B] rounded flex flex-col overflow-hidden group hover:border-outline-variant transition-colors" key={notebook._id}>
                                    <div className="p-6 flex flex-col flex-1">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="bg-[#141414] border border-[#1E293B] p-2 rounded flex items-center justify-center text-primary-container">
                                                <span className="material-symbols-outlined">{icon}</span>
                                            </div>
                                            <span className="bg-surface-container border border-[#1E293B] px-2 py-1 rounded font-label-caps text-label-caps text-on-surface-variant">{status}</span>
                                        </div>
                                        <h3 className="font-title-sm text-title-sm text-on-surface mb-2 group-hover:text-primary transition-colors">{notebook.title}</h3>
                                        <p className="font-body-sm text-body-sm text-on-surface-variant mb-6 flex-1 line-clamp-3">{truncateText(notebook.description, 140)}</p>
                                        <div className="flex items-center justify-between border-t border-[#1E293B] pt-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-full bg-surface-container border border-[#1E293B] flex items-center justify-center font-label-caps text-label-caps text-on-surface text-[10px]">
                                                    {notebook.owner?.username?.substring(0, 2).toUpperCase() || 'UN'}
                                                </div>
                                                <span className="font-body-sm text-body-sm text-on-surface">{notebook.owner?.username || 'Unknown'}</span>
                                            </div>
                                            <span className="font-label-caps text-label-caps text-outline-variant">{notebook.likes?.length || 0} LIKES</span>
                                        </div>
                                        <div className="mt-4 flex items-center gap-3">
                                            <button
                                                onClick={() => handleClone(notebook._id, notebook.title)}
                                                disabled={cloningId === notebook._id || cloningId !== null}
                                                className="flex-1 bg-primary-container text-white py-2 rounded font-label-caps text-label-caps uppercase hover:bg-inverse-primary transition-colors disabled:opacity-50 flex items-center justify-center gap-1"
                                            >
                                                <span className="material-symbols-outlined text-[16px]">content_copy</span>
                                                {cloningId === notebook._id ? '...' : 'Clone'}
                                            </button>
                                            <Link to={`/notebook/${notebook._id}`} className="flex-1 border border-[#1E293B] text-on-surface py-2 rounded font-label-caps text-label-caps uppercase hover:border-outline-variant transition-colors text-center">
                                                View
                                            </Link>
                                            <button
                                                onClick={() => handleLike(notebook._id)}
                                                className={`w-8 h-8 flex items-center justify-center rounded border transition-colors ${
                                                    isLikedByUser
                                                        ? 'border-error text-error bg-error-container/20'
                                                        : 'border-[#1E293B] text-on-surface-variant hover:border-error hover:text-error'
                                                }`}
                                                style={{ cursor: user ? 'pointer' : 'not-allowed' }}
                                                title={user ? (isLikedByUser ? 'Unlike' : 'Like') : 'Login to like'}
                                            >
                                                <span className="material-symbols-outlined text-[16px]">
                                                    {likingId === notebook._id ? 'hourglass_top' : (isLikedByUser ? 'favorite' : 'favorite_border')}
                                                </span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default HomePage;
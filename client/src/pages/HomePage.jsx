import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { getPublicNotebooks, searchPublicNotebooks } from '../services/api';
import '../styles/HomePage.css';

const HomePage = () => {
    const [notebooks, setNotebooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [searchTerm, setSearchTerm] = useState('')
    const searchTimeoutRef = useRef(null)


    useEffect(() => {
        const performSearch = async () => {
            setError('')
            setLoading(true)

            try {
                let response

                if (searchTerm.trim() === "") {
                    response = await getPublicNotebooks()
                } else {
                    response = await searchPublicNotebooks(searchTerm)
                }

                setNotebooks(response.data || [])

            } catch (err) {
                setError(err.message)
                setNotebooks([])
            } finally {
                setLoading(false)
            }
        }

        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current)
        }

        searchTimeoutRef.current = setTimeout(() => {
            performSearch()
        }, 500)


        return () => {
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current)

            }
        }

    }, [searchTerm]);

    if (loading) {
        return <div className="loading-container">Loading...</div>;
    }

    if (error) {
        return <div className="error-container" style={{ color: 'red' }}>{error}</div>;
    }

    return (
        <div className="container-root">
            <div className="content-wrapper">
                <div className="header">
                    <h1 className="title">Notebooks</h1>
                    <p className="subtitle">Explore and discover amazing notebooks from our community.</p>
                </div>

                <div>
                    <input type='search'
                        placeholder='Title, description or summary...'
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)} />
                </div>

                {notebooks.length === 0 ? (
                    <p className="subtitle">Found No Notebooks</p>
                ) : (
                    <div className="notebooks-grid">
                        {notebooks.map((notebook, index) => (
                            <div className={`notebook-card color-${(index % 5) + 1}`} key={notebook._id}>
                                <div className="card-header">
                                    <h2 className="notebook-title">{notebook.title}</h2>
                                    <p className="notebook-author">by {notebook.owner.username}</p>
                                </div>
                                <div className="card-body">
                                    {notebook.description ? (
                                        <p className="notebook-description">
                                            {notebook.description}
                                        </p>
                                    ) : (<p className="notebook-description">
                                        A collection of thoughts, ideas, and research on {notebook.title}.
                                    </p>)}
                                </div>
                                <div className="card-footer">
                                    <div className="likes-container">
                                        <span className="material-symbols-outlined likes-icon">favorite</span>
                                        <span>{notebook.likes.length}</span>
                                    </div>
                                    <Link className="view-button" to={`/notebook/${notebook._id}`}>View Notebook</Link>
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

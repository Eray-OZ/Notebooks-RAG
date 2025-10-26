import React, { useState } from 'react';
import { createNotebook } from '../services/api';
import { useNavigate } from 'react-router-dom';
import '../styles/Modal.css';

const CreateNotebookModal = ({ isOpen, onClose }) => {

    const predefinedCategories = ['General', 'Technology', 'History', 'Others'];

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('')
    const [isPublic, setIsPublic] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    if (!isOpen) {
        return null;
    }

    const handleCreate = async () => {
        if (!title.trim()) {
            setError('Please enter a title.');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            console.log('description in handleCreate:', description);
            const notebookData = { title, description, isPublic, category: category.trim() || undefined };
            const response = await createNotebook(notebookData);
            const newNotebookId = response.data._id;


            setTitle('');
            setDescription('');
            setIsPublic(false);
            setCategory('');
            onClose();
            navigate(`/notebook/${newNotebookId}`);
        } catch (err) {
            setError(err.message || 'An error occurred while creating the notebook.');
            console.error("CreateNotebookModal error:", err);
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        if (isLoading) return;
        setTitle('');
        setDescription('');
        setIsPublic(false);
        setCategory('');
        setError('');
        onClose();
    };

    return (
        <div className="modal-overlay" onClick={handleClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <h2 className="modal-header">Create New Notebook</h2>

                <div className="form-group">
                    <label className="form-label" htmlFor="notebook-title">
                        Notebook Title
                    </label>
                    <input
                        type="text"
                        id="notebook-title"
                        className="form-input"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="e.g., Project Ideas"
                        disabled={isLoading}
                        aria-label="Notebook Title"
                    />
                </div>

                <div className="form-group">
                    <label className="form-label" htmlFor="notebook-description">
                        Description
                    </label>
                    <textarea
                        id="notebook-description"
                        className="form-textarea"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Enter a short description..."
                        disabled={isLoading}
                        aria-label="Notebook Description"
                    />
                </div>


                <div className="form-group">
                    <label className="form-label" htmlFor="notebook-category">Category</label>
                    <select
                        id="notebook-category"
                        className="form-input"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        disabled={isLoading}
                        aria-label="Notebook Category"
                    >
                        <option value="">Select Category (Optional)</option>
                        {predefinedCategories.map(cat => (
                            <option key={cat} value={cat}>
                                {cat}
                            </option>
                        ))}
                    </select>
                </div>


                <div className="form-checkbox">
                    <input
                        type="checkbox"
                        id="public-checkbox"
                        checked={isPublic}
                        onChange={(e) => setIsPublic(e.target.checked)}
                        disabled={isLoading}
                    />
                    <label htmlFor="public-checkbox">Make Public</label>
                </div>

                {error && <p className="modal-error">{error}</p>}

                <div className="modal-actions">
                    <button
                        className="modal-button secondary"
                        onClick={handleClose}
                        disabled={isLoading}
                    >
                        Cancel
                    </button>
                    <button
                        className="modal-button primary"
                        onClick={handleCreate}
                        disabled={isLoading || !title.trim()}
                    >
                        {isLoading ? 'Creating...' : 'Create'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CreateNotebookModal;
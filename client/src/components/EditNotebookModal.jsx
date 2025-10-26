import React, { useState, useEffect } from 'react';
import { updateNotebook } from '../services/api';
import '../styles/Modal.css';

const predefinedCategories = ['General', 'Technology', 'History', 'Others'];

const EditNotebookModal = ({ isOpen, onClose, notebook, onUpdateSuccess }) => {
    const [editedTitle, setEditedTitle] = useState('');
    const [editedDescription, setEditedDescription] = useState('');
    const [editedIsPublic, setEditedIsPublic] = useState(false);
    const [editedCategory, setEditedCategory] = useState('');

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen && notebook) {
            setEditedTitle(notebook.title || '');
            setEditedDescription(notebook.description || '');
            setEditedIsPublic(notebook.isPublic || false);
            setEditedCategory(notebook.category || 'General');
            setError('');
        }
    }, [isOpen, notebook]);

    if (!isOpen || !notebook) {
        return null;
    }

    const handleSave = async () => {
        if (!editedTitle.trim()) {
            setError('Title cannot be empty.');
            return;
        }

        setIsLoading(true);
        setError('');

        const updateData = {
            title: editedTitle.trim(),
            description: editedDescription.trim(),
            isPublic: editedIsPublic,
            category: editedCategory || 'General'
        };

        try {
            const response = await updateNotebook(notebook._id, updateData);
            setIsLoading(false);
            onClose();
            onUpdateSuccess(response.data);
        } catch (err) {
            setError(err.message || 'An error occurred while updating the notebook.');
            console.error("EditNotebookModal error:", err);
            setIsLoading(false);
        }
    };

    const handleCancel = () => {
        if (isLoading) return;
        onClose();
    };

    return (
        <div className="modal-overlay" onClick={handleCancel}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <h2 className="modal-header">Edit Notebook Settings</h2>

                <div className="form-group">
                    <label className="form-label" htmlFor="edit-notebook-title">Title</label>
                    <input
                        type="text" id="edit-notebook-title" className="form-input"
                        value={editedTitle} onChange={(e) => setEditedTitle(e.target.value)}
                        placeholder="Notebook Title (Required)"
                        disabled={isLoading}
                    />
                </div>

                <div className="form-group">
                    <label className="form-label" htmlFor="edit-notebook-description">Description</label>
                    <textarea
                        id="edit-notebook-description" className="form-textarea"
                        value={editedDescription} onChange={(e) => setEditedDescription(e.target.value)}
                        placeholder="A short description (Optional)..."
                        disabled={isLoading}
                    />
                </div>

                <div className="form-group">
                    <label className="form-label" htmlFor="edit-notebook-category">Category</label>
                    <select
                        id="edit-notebook-category" className="form-input"
                        value={editedCategory} onChange={(e) => setEditedCategory(e.target.value)}
                        disabled={isLoading}
                    >
                        {predefinedCategories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                </div>

                <div className="form-checkbox">
                    <input
                        type="checkbox" id="edit-public-checkbox"
                        checked={editedIsPublic} onChange={(e) => setEditedIsPublic(e.target.checked)}
                        disabled={isLoading}
                    />
                    <label htmlFor="edit-public-checkbox">Make Public</label>
                </div>

                {error && <p className="modal-error">{error}</p>}

                <div className="modal-actions">
                    <button className="modal-button secondary" onClick={handleCancel} disabled={isLoading}> Cancel </button>
                    <button className="modal-button primary" onClick={handleSave} disabled={isLoading || !editedTitle.trim()}>
                        {isLoading ? 'Saving...' : 'Save'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EditNotebookModal;
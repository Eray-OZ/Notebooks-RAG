import React, { useContext, useEffect, useState } from 'react'
import { AuthContext } from '../context/AuthContext'
import { getMyNotebooks } from '../services/api.js'
import { Link } from 'react-router-dom'
import CreateNotebookModal from '../components/CreateNotebookModal';
import EditNotebookModal from '../components/EditNotebookModal.jsx';

const statusConfig = [
    { label: 'Synced', color: 'text-tertiary bg-surface-container border-outline-variant' },
    { label: 'Local', color: 'text-tertiary bg-surface-container border-outline-variant' },
    { label: 'Processing', color: 'text-primary bg-primary-container/20 border-primary/30' },
    { label: 'Archived', color: 'text-tertiary bg-surface-container border-outline-variant' },
];

const icons = ['book', 'gavel', 'science', 'inventory_2', 'terminal', 'memory'];

const DashboardPage = () => {
    const { user } = useContext(AuthContext)
    const [notebooks, setNotebooks] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [editingNotebook, setEditingNotebook] = useState(null)
    const [filterTerm, setFilterTerm] = useState('')

    useEffect(() => {
        const fetchNotebooks = async () => {
            try {
                setLoading(true)
                const response = await getMyNotebooks()
                setNotebooks(response.data)
            } catch (error) {
                setError('fetch err::: users notebooks::: ' + error)
                console.error("fetchNotebooks error:", error);
            }
            finally {
                setLoading(false)
            }
        }
        fetchNotebooks()
    }, [])

    const handleOpenEditModal = (notebookToEdit) => {
        setEditingNotebook(notebookToEdit)
        setIsEditModalOpen(true)
    }

    const handleUpdateSuccess = (updatedNotebook) => {
        setNotebooks(currentNotebooks =>
            currentNotebooks.map(nb =>
                nb._id === updatedNotebook._id ? updatedNotebook : nb
            )
        )
        setIsEditModalOpen(false)
        setEditingNotebook(null)
    };

    const filteredNotebooks = notebooks.filter(nb =>
        nb.title.toLowerCase().includes(filterTerm.toLowerCase()) ||
        (nb.description && nb.description.toLowerCase().includes(filterTerm.toLowerCase()))
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full text-on-surface-variant font-body-md">
                <span className="material-symbols-outlined animate-spin mr-2">progress_activity</span>
                Loading...
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="bg-error-container border border-error text-on-error-container rounded-lg px-md py-sm font-body-sm text-body-sm">
                    {error}
                </div>
            </div>
        );
    }

    return (
        <div className="p-gutter md:p-lg">
            <div className="max-w-[1280px] mx-auto w-full">
                {/* Page Header */}
                <header className="mb-lg flex flex-col md:flex-row md:justify-between md:items-end gap-md">
                    <div>
                        <h1 className="font-headline-md text-headline-md text-on-background mb-xs tracking-tight">My Notebooks</h1>
                        <p className="font-body-md text-body-md text-on-surface-variant max-w-2xl">Manage your localized knowledge bases. Upload documents, run semantic searches, and synthesize information securely within your personal environments.</p>
                    </div>
                    <div className="flex items-center gap-sm">
                        <div className="relative">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-tertiary text-[18px]">filter_list</span>
                            <input
                                className="bg-surface border border-outline-variant text-on-background rounded-DEFAULT pl-9 pr-3 py-1.5 focus:border-primary focus:outline-none font-body-sm text-body-sm w-48 placeholder-tertiary bg-transparent"
                                placeholder="Filter notebooks..."
                                type="text"
                                value={filterTerm}
                                onChange={(e) => setFilterTerm(e.target.value)}
                            />
                        </div>
                        <div className="flex bg-surface border border-outline-variant rounded-DEFAULT p-[2px]">
                            <button className="w-8 h-8 flex items-center justify-center bg-surface-container-high text-on-background rounded-DEFAULT transition-colors">
                                <span className="material-symbols-outlined text-[18px]">grid_view</span>
                            </button>
                            <button className="w-8 h-8 flex items-center justify-center text-on-surface-variant hover:text-on-background rounded-DEFAULT transition-colors">
                                <span className="material-symbols-outlined text-[18px]">view_list</span>
                            </button>
                        </div>
                    </div>
                </header>

                {notebooks.length === 0 ? (
                    <div className="bg-surface border border-outline-variant rounded-lg p-lg text-center">
                        <p className="font-body-md text-body-md text-on-surface-variant mb-md">Found No Notebooks</p>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="bg-primary-container text-white font-label-caps text-label-caps px-4 py-2 rounded-DEFAULT hover:bg-inverse-primary transition-colors uppercase tracking-widest"
                        >
                            Create Your First Notebook
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md">
                        {filteredNotebooks.map((notebook, index) => {
                            const status = statusConfig[index % statusConfig.length];
                            const icon = icons[index % icons.length];
                            const isArchived = status.label === 'Archived';

                            return (
                                <article key={notebook._id} className={`bg-surface border border-outline-variant rounded-lg p-md flex flex-col hover:border-outline transition-colors group relative ${isArchived ? 'opacity-60' : ''}`}>
                                    <div className="flex justify-between items-start mb-md">
                                        <div className={`w-10 h-10 rounded-DEFAULT bg-surface-container-high border border-outline-variant flex items-center justify-center text-primary group-hover:bg-primary-container group-hover:text-on-background group-hover:border-transparent transition-all`}>
                                            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>{icon}</span>
                                        </div>
                                        <div className="flex gap-xs">
                                            <span className={`font-label-caps text-label-caps px-2 py-1 rounded-DEFAULT border uppercase tracking-wider ${status.color}`}>
                                                {status.label}
                                            </span>
                                        </div>
                                    </div>
                                    <h2 className="font-title-sm text-title-sm text-on-background mb-xs">{notebook.title}</h2>
                                    <p className="font-body-sm text-body-sm text-on-surface-variant mb-lg flex-1 line-clamp-2">
                                        {notebook.description || `A collection of thoughts, ideas, and research on ${notebook.title}.`}
                                    </p>
                                    <div className="flex items-center gap-md mb-md font-label-caps text-label-caps text-tertiary uppercase tracking-wider">
                                        <div className="flex items-center gap-xs">
                                            <span className="material-symbols-outlined text-[14px]">description</span>
                                            {notebook.associatedDocuments?.length || 0} Docs
                                        </div>
                                        <div className="flex items-center gap-xs">
                                            <span className="material-symbols-outlined text-[14px]">update</span>
                                            {notebook.likes?.length || 0} likes
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between pt-sm border-t border-outline-variant/50">
                                        <Link to={`/notebook/${notebook._id}`} className="bg-primary-container text-on-background font-label-caps text-label-caps px-4 py-2 rounded-DEFAULT hover:bg-inverse-primary transition-colors uppercase tracking-widest flex items-center gap-2">
                                            <span className="material-symbols-outlined text-[16px]">open_in_new</span> Open
                                        </Link>
                                        <div className="flex items-center gap-xs">
                                            <button
                                                onClick={() => handleOpenEditModal(notebook)}
                                                className="w-8 h-8 flex items-center justify-center text-on-surface-variant hover:text-on-background hover:bg-surface-container-high rounded-DEFAULT border border-transparent hover:border-outline-variant transition-all"
                                                title="Edit notebook"
                                            >
                                                <span className="material-symbols-outlined text-[18px]">edit</span>
                                            </button>
                                            <Link to={`/notebook/${notebook._id}`} className="w-8 h-8 flex items-center justify-center text-on-surface-variant hover:text-on-background hover:bg-surface-container-high rounded-DEFAULT border border-transparent hover:border-outline-variant transition-all">
                                                <span className="material-symbols-outlined text-[18px]">more_horiz</span>
                                            </Link>
                                        </div>
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                )}
            </div>

            <CreateNotebookModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />

            <EditNotebookModal
                isOpen={isEditModalOpen}
                onClose={() => { setIsEditModalOpen(false); setEditingNotebook(null); }}
                notebook={editingNotebook}
                onUpdateSuccess={handleUpdateSuccess}
            />
        </div>
    );
}

export default DashboardPage
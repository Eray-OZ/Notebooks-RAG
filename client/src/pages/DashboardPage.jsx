import React, { useContext, useEffect, useState } from 'react'
import { AuthContext } from '../context/AuthContext'
import { getMyNotebooks, createNotebook } from '../services/api.js'
import { Link, useNavigate } from 'react-router-dom'
import CreateNotebookModal from '../components/CreateNotebookModal'; // YENİ: Modal'ı import et


const DashboardPage = () => {

    const navigate = useNavigate()


    const { user } = useContext(AuthContext)
    const [notebooks, setNotebooks] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        const fetchNotebooks = async () => {
            try {
                setLoading(true)
                const response = await getMyNotebooks()
                setNotebooks(response.data)
            } catch (error) {
                setError('fetch err::: users notebooks::: ' + error)
            }
            finally {
                setLoading(false)
            }
        }
        fetchNotebooks()
    }, [])






    if (loading) {
        return <div>Loading...</div>
    }

    if (error) {
        return <div style={{ color: 'red' }}>{error}</div>
    }


    return (
        <div className="container-root">
            <div className="content-wrapper">
                <div className="header">
                    <h1 className="title">My Notebooks</h1>
                </div>


                <div style={{ margin: '1rem 0' }}>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        style={{ padding: '0.5rem 1rem', background: 'green', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
                    >
                        + Yeni Notebook Oluştur
                    </button>
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


            <CreateNotebookModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />

        </div>
    );

}

export default DashboardPage
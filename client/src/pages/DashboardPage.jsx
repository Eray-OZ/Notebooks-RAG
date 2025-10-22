import React, { useContext, useEffect, useState } from 'react'
import { AuthContext } from '../context/AuthContext'
import { getMyNotebooks } from '../services/api.js'
import { Link } from 'react-router-dom'


const DashboardPage = () => {

    const { user } = useContext(AuthContext)
    const [notebooks, setNotebooks] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')


    useEffect(() => {
        const fetchDocuments = async () => {
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
        fetchDocuments()
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
                                    <p className="notebook-description">
                                        A collection of thoughts, ideas, and research on {notebook.title}.
                                    </p>
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

}

export default DashboardPage
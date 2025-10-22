import React, { useContext, useEffect, useState } from 'react'
import { AuthContext } from '../context/AuthContext'
import { getMyDocuments } from '../services/api.js'
import { Link } from 'react-router-dom'


const DashboardPage = () => {

    const { user } = useContext(AuthContext)
    const [documents, setDocuments] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')


    useEffect(() => {
        const fetchDocuments = async () => {
            try {
                setLoading(true)
                const response = await getMyDocuments()
                setDocuments(response.data)
            } catch (error) {
                setError('fetch err::: users documents::: ' + error)
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
        <div>
            <h2>Welcome {user ? user.username : 'User'}</h2>
            <h3>Your Dashboard</h3>

            <hr />


            <h3>Your Documents</h3>
            <Link to="/upload">
                Upload Document
            </Link>


            {documents.length === 0 ? (
                <p>No documents</p>
            ) : (
                <ul>
                    {documents.map((doc) => (
                        <li key={doc._id}>
                            {doc.fileName} - <span style={{ color: doc.status === 'ready' ? 'green' : 'orange' }}>({doc.status})
                            </span></li>
                    ))}
                </ul>
            )}


        </div>
    )


}

export default DashboardPage
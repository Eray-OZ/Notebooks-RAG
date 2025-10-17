import React, { useContext } from 'react'
import { AuthContext } from '../context/AuthContext'


const DashboardPage = () => {

    const { user } = useContext(AuthContext)

    return (
        <div>
            <h2>Welcome {user ? user.username : 'User'}</h2>
            <h3>Dashboard</h3>
        </div>
    )


}


export default DashboardPage
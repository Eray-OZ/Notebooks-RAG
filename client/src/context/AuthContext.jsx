import React, { createContext, useState, useEffect } from 'react'



export const AuthContext = createContext(null)


export const AuthProvider = ({ children }) => {

    const [user, setUser] = useState(null)
    const [token, setToken] = useState(localStorage.getItem('token'))
    const [loading, setLoading] = useState(true)


    useEffect(() => {
        const storedToken = localStorage.getItem('token')
        const storedUser = localStorage.getItem('user')

        if (storedToken && storedUser) {
            setToken(storedToken)
            setUser(JSON.parse(storedUser))
        }
        setLoading(false)

    }, [])


    const loginAction = (data) => {
        const userPayload = {
            _id: data._id,
            username: data.username,
            email: data.email
        };
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(userPayload));
        setToken(data.token);
        setUser(userPayload);
    }

    const logoutAction = () => {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        setToken(null)
        setUser(null)
    }


    const authContextValue = {
        token,
        user,
        loading,
        login: loginAction,
        logout: logoutAction
    }



    return (
        <AuthContext.Provider value={authContextValue}>
            {children}
        </AuthContext.Provider>
    )


}
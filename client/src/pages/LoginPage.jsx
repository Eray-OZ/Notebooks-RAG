import React, { useContext, useState } from 'react'
import { loginUser } from '../services/api'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'



const LoginPage = () => {

    const [formData, setFormData] = useState({
        email: '',
        password: ''
    })
    const [error, setError] = useState('')

    const navigate = useNavigate()
    const { login } = useContext(AuthContext)

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')

        try {
            const data = await loginUser(formData)
            login(data)
            navigate('/dashboard', 200)
        } catch (error) {
            setError(error.message || 'Login failed')
        }

    }



    return (
        <div>
            <h2>Login</h2>
            <form onSubmit={handleSubmit}>

                <div>
                    <label>Email:</label>
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div>
                    <label>Password:</label>
                    <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                    />
                </div>
                <button type="submit">Login</button>

                {error && <p style={{ color: 'red' }}>{error}</p>}
            </form>
        </div>
    )


}


export default LoginPage
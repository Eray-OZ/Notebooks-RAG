import React, { useContext, useState } from 'react'
import { registerUser } from '../services/api'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'


const RegisterPage = () => {

    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: ''
    })

    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')


    const navigate = useNavigate()

    const { login } = useContext(AuthContext)


    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setSuccess('')



        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters long')
            return
        }

        try {

            const data = await registerUser(formData)
            login(data)
            navigate('/dashboard', 200)

        } catch (error) {
            setError(error.message || 'Registration failed')
        }

    }



    return (
        <div>
            <h2>Register</h2>

            <form onSubmit={handleSubmit}>

                <div>
                    <label>Username:</label>
                    <input type="text" name='username'
                        value={formData.username} onChange={handleChange} required />
                </div>

                <div>
                    <label>Email:</label>
                    <input type="email" name='email'
                        value={formData.email} onChange={handleChange} required />
                </div>

                <div>Password:
                    <input type="password" name='password'
                        value={formData.password} onChange={handleChange} required />
                </div>

                <button type='submit'>Register</button>

            </form>

            {error && <p style={{ color: 'red' }}>{error}</p>}
            {success && <p style={{ color: 'green' }}>{success}</p>}

        </div>
    )


}


export default RegisterPage
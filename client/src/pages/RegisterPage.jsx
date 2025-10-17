import React, { useContext, useState } from 'react';
import { registerUser } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import '../styles/RegisterPage.css';

const RegisterPage = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: ''
    });
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { login } = useContext(AuthContext);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters long');
            return;
        }

        try {
            const data = await registerUser(formData);
            login(data);
            navigate('/dashboard');
        } catch (error) {
            setError(error.message || 'Registration failed');
        }
    };

    return (
        <div className="container-root">
            <div className="backdrop-blur"></div>
            <div className="content-wrapper">
                <div className="card">
                    <div className="card-body">
                        <div className="text-center">
                            <p className="title">Create a new account</p>
                            <p className="subtitle">Sign up to get started.</p>
                        </div>
                        <form onSubmit={handleSubmit} className="form-container">
                            <div className="form-group">
                                <label className="form-label" htmlFor="username">Username</label>
                                <input
                                    className="form-input"
                                    id="username"
                                    placeholder="Enter your username"
                                    type="text"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label" htmlFor="email">Email</label>
                                <input
                                    className="form-input"
                                    id="email"
                                    placeholder="Enter your email"
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label" htmlFor="password">Password</label>
                                <input
                                    className="form-input"
                                    id="password"
                                    placeholder="Enter your password"
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <button type="submit" className="submit-button"> Create Account </button>
                            {error && <p style={{ color: 'red' }}>{error}</p>}
                        </form>
                        <p className="login-prompt"> Already have an account? <a className="form-link" href="/login">Log in</a></p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;

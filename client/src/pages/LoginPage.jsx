import React, { useContext, useState } from 'react';
import { loginUser } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import '../styles/LoginPage.css';

const LoginPage = () => {
    const [formData, setFormData] = useState({
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

        try {
            const data = await loginUser(formData);
            login(data);
            navigate('/dashboard');
        } catch (error) {
            setError(error.message || 'Login failed');
        }
    };

    return (
        <div className="container-root">
            <div className="backdrop-blur"></div>
            <div className="content-wrapper">
                <div className="card">
                    <div className="card-body">
                        <div className="text-center">
                            <p className="title">Login to your account</p>
                            <p className="subtitle">Welcome back!</p>
                        </div>
                        <form onSubmit={handleSubmit} className="form-container">
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
                            <button type="submit" className="submit-button"> Login </button>
                            {error && <p style={{ color: 'red' }}>{error}</p>}
                        </form>
                        <p className="login-prompt"> Don't have an account? <a className="form-link" href="/register">Register</a></p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
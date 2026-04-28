import React, { useContext, useState } from 'react';
import { registerUser } from '../services/api';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

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
        <div className="min-h-screen flex items-center justify-center font-body-md text-on-surface antialiased p-md">
            <main className="w-full max-w-[440px] bg-surface border border-surface-variant rounded-xl p-lg flex flex-col">
                <header className="mb-lg">
                    <h1 className="font-headline-md text-headline-md text-on-surface mb-xs">Create Account</h1>
                    <p className="font-body-md text-body-md text-on-surface-variant">Sign up to get started.</p>
                </header>
                <form onSubmit={handleSubmit} className="flex flex-col gap-md">
                    <div className="flex flex-col gap-xs">
                        <label className="font-label-caps text-label-caps text-on-surface-variant uppercase" htmlFor="username">Username</label>
                        <input
                            className="bg-surface-container-low border border-surface-variant text-on-surface font-body-sm text-body-sm rounded-lg px-sm py-sm focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container transition-colors w-full"
                            id="username"
                            name="username"
                            type="text"
                            placeholder="username"
                            value={formData.username}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="flex flex-col gap-xs">
                        <label className="font-label-caps text-label-caps text-on-surface-variant uppercase" htmlFor="email">Email</label>
                        <input
                            className="bg-surface-container-low border border-surface-variant text-on-surface font-body-sm text-body-sm rounded-lg px-sm py-sm focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container transition-colors w-full"
                            id="email"
                            name="email"
                            type="email"
                            placeholder="user@example.com"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="flex flex-col gap-xs">
                        <label className="font-label-caps text-label-caps text-on-surface-variant uppercase" htmlFor="password">Password</label>
                        <input
                            className="bg-surface-container-low border border-surface-variant text-on-surface font-body-sm text-body-sm rounded-lg px-sm py-sm focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container transition-colors w-full"
                            id="password"
                            name="password"
                            type="password"
                            placeholder="At least 6 characters"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    {error && (
                        <div className="bg-error-container border border-error text-on-error-container rounded-lg px-sm py-sm font-body-sm text-body-sm">
                            {error}
                        </div>
                    )}
                    <button
                        type="submit"
                        className="mt-sm w-full bg-primary-container text-white font-label-caps text-label-caps uppercase rounded-lg py-[14px] hover:bg-inverse-primary transition-colors flex items-center justify-center gap-base"
                    >
                        Sign Up
                        <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}>arrow_forward</span>
                    </button>
                </form>
                <p className="mt-md text-center font-body-sm text-body-sm text-on-surface-variant">
                    Already have an account?{' '}
                    <Link to="/login" className="text-primary hover:text-primary-fixed-dim transition-colors">Sign In</Link>
                </p>
            </main>
        </div>
    );
};

export default RegisterPage;

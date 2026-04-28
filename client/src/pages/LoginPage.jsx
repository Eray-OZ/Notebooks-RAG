import React, { useContext, useState } from 'react';
import { loginUser } from '../services/api';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

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
        <div className="min-h-screen flex items-center justify-center font-body-md text-on-surface antialiased p-md">
            <main className="w-full max-w-[440px] bg-surface border border-surface-variant rounded-xl p-lg flex flex-col">
                <header className="mb-lg">
                    <h1 className="font-headline-md text-headline-md text-on-surface mb-xs">Sign In</h1>
                    <p className="font-body-md text-body-md text-on-surface-variant">Welcome back!</p>
                </header>
                <form onSubmit={handleSubmit} className="flex flex-col gap-md">
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
                        <div className="flex justify-between items-center w-full">
                            <label className="font-label-caps text-label-caps text-on-surface-variant uppercase" htmlFor="password">Password</label>
                            <a className="font-label-caps text-label-caps text-on-surface-variant hover:text-on-surface transition-colors" href="#">Forgot password?</a>
                        </div>
                        <input
                            className="bg-surface-container-low border border-surface-variant text-on-surface font-body-sm text-body-sm rounded-lg px-sm py-sm focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container transition-colors w-full"
                            id="password"
                            name="password"
                            type="password"
                            placeholder="••••••••"
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
                        Sign In
                        <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}>arrow_forward</span>
                    </button>
                </form>
                <p className="mt-md text-center font-body-sm text-body-sm text-on-surface-variant">
                    Don't have an account?{' '}
                    <Link to="/register" className="text-primary hover:text-primary-fixed-dim transition-colors">Sign Up</Link>
                </p>
            </main>
        </div>
    );
};

export default LoginPage;
import React, { useContext } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);

    return (
        <div className="navbar">
            <div className="nav-container">
                <div className="nav-links">
                    <NavLink className="nav-link" to="/" end>
                        Homepage
                    </NavLink>
                    {user && (
                         <NavLink className="nav-link" to="/dashboard">
                            Dashboard
                        </NavLink>
                    )}
                </div>
                <div className="nav-auth">
                    {user ? (
                        <>
                            <span className="user-greeting">Hi, {user.username}</span>
                            <button onClick={logout} className="logout-button">Logout</button>
                        </>
                    ) : (
                        <>
                            <Link className="auth-link login" to="/login">Login</Link>
                            <Link className="auth-link register" to="/register">Register</Link>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Navbar;
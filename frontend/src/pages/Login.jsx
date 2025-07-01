import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaVideo, FaEye, FaEyeSlash, FaGoogle, FaGithub, FaRegUser, FaLock } from 'react-icons/fa';
import './Login.css';
import axios from 'axios';

export default function Login() {
    const [formData, setFormData] = useState({
        username: '',
        password: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        
        // Simulate API call
        setTimeout(() => {
            setIsLoading(false);
            // Handle login logic here
            console.log('Form submitted:', formData);
           axios.post(`${import.meta.env.VITE_backend_URL}/users/login`, formData)
            .then((response) => {
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('username', formData.username);
                // Navigate to the dashboard or home page
                navigate('/home');
            })
            .catch((error) => {
                console.error('Login error:', error);
                alert('Login failed. Please check your credentials.');
            });
        }, 2000);
    };

    const handleSocialLogin = (provider) => {
        console.log(`${provider} login clicked`);
        // Handle social login logic here
    };

    return (
        <div className="auth-page">
            <div className="auth-background">
                <div className="floating-shape shape-1"></div>
                <div className="floating-shape shape-2"></div>
                <div className="floating-shape shape-3"></div>
            </div>
            
            <div className="auth-container">
                <div className="auth-card">
                    <div className="auth-header">
                        <div className="logo-section">
                            <div className="logo-icon">
                                <FaVideo />
                            </div>
                            <h1>Welcome Back</h1>
                            <p>Sign in to continue to MeetConnect</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="auth-form">
                        <div className="form-group">
                            <div className="input-wrapper">
                                <FaRegUser className="input-icon" />
                                <input
                                    type="text"
                                    name="username"
                                    placeholder="Username"
                                    value={formData.username}
                                    onChange={handleChange}
                                    required
                                    className="auth-input"
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <div className="input-wrapper">
                                <FaLock className="input-icon" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    placeholder="Password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    className="auth-input"
                                />
                                <button
                                    type="button"
                                    className="password-toggle"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                                </button>
                            </div>
                        </div>

                        {/* <div className="form-options">
                            <label className="checkbox-wrapper">
                                <input type="checkbox" />
                                <span className="checkmark"></span>
                                Remember me
                            </label>
                            <a href="#" className="forgot-password">Forgot password?</a>
                        </div> */}

                        <button 
                            type="submit" 
                            className={`auth-button ${isLoading ? 'loading' : ''}`}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <div className="spinner"></div>
                            ) : (
                                'Sign In'
                            )}
                        </button>
                    </form>

                            <br></br>
                    {/* <div className="social-buttons">
                        <button 
                            className="social-button google"
                            onClick={() => handleSocialLogin('Google')}
                        >
                            <FaGoogle />
                            Google
                        </button>
                        <button 
                            className="social-button github"
                            onClick={() => handleSocialLogin('GitHub')}
                        >
                            <FaGithub />
                            GitHub
                        </button>
                    </div> */}

                    <div className="auth-footer">
                        <p>
                            Don't have an account?{' '}
                            <button 
                                className="link-button"
                                onClick={() => navigate('/signup')}
                            >
                                Sign up
                            </button>
                        </p>
                    </div>
                </div>

                <div className="auth-visual">
                    <div className="visual-content">
                        <h2>Connect with Anyone, Anywhere</h2>
                        <p>Experience crystal-clear video calls with advanced features. Join meetings instantly and collaborate seamlessly.</p>
                        <div className="feature-list">
                            <div className="feature-item">
                                <div className="feature-icon">🎥</div>
                                <span>HD Video Quality</span>
                            </div>
                            <div className="feature-item">
                                <div className="feature-icon">🔒</div>
                                <span>Secure & Private</span>
                            </div>
                            <div className="feature-item">
                                <div className="feature-icon">👥</div>
                                <span>Group Meetings</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}



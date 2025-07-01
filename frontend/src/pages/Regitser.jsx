import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaVideo, FaEye, FaEyeSlash, FaGoogle, FaGithub, FaEnvelope, FaLock, FaUser, FaPhone } from 'react-icons/fa';
import './Login.css';
import axios from 'axios';
export default function Register() {
    const [formData, setFormData] = useState({
        name: '',
        username: '',
        password: '',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        // Clear error when user starts typing
        if (errors[e.target.name]) {
            setErrors({
                ...errors,
                [e.target.name]: ''
            });
        }
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.name.trim()) {
            newErrors.name = 'Name is required';
        }

        if (!formData.username.trim()) {
            newErrors.Username = 'Username is required';
        }

        if (!formData.password) {
            newErrors.password = 'Password is required';
        } 
        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) {
            return;
        }
        setIsLoading(true);
        
        // Simulate API call
        setTimeout(() => {
            setIsLoading(false);
            // Handle registration logic here
            console.log('Registration attempt:', formData);
            axios.post(`${import.meta.env.VITE_backend_URL}/users/signup`, formData)
            .then((response) => {
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('username', formData.username);

                // Navigate to the login page or dashboard
                navigate('/home');
            })
            .catch((error) => {
                console.error('Registration error:', error);
                alert('Registration failed. Please try again.');
            });
        }, 2000);
    };

    const handleSocialRegister = (provider) => {
        console.log(`${provider} registration clicked`);
        // Handle social registration logic here
    };

    return (
        <div className="auth-page">
            <div className="auth-background">
                <div className="floating-shape shape-1"></div>
                <div className="floating-shape shape-2"></div>
                <div className="floating-shape shape-3"></div>
                <div className="floating-shape shape-4"></div>
            </div>
            
            <div className="auth-container">
                <div className="auth-card">
                    <div className="auth-header">
                        <div className="logo-section">
                            <div className="logo-icon">
                                <FaVideo />
                            </div>
                            <h1>Create Account</h1>
                            <p>Join MeetConnect and start connecting</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                            <div className="input-wrapper">
                                <FaUser className="input-icon" />
                                <input
                                    type="text"
                                    name="name"
                                    placeholder="Name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    className={`auth-input ${errors.name ? 'error' : ''}`}
                                />
                            </div>
                            {errors.name && <span className="error-message">{errors.name}</span>}
                        </div>
                        <div className="form-group">
                            <div className="input-wrapper">
                                <FaUser className="input-icon" />
                                <input
                                    type="text"
                                    name="username"
                                    placeholder="Username"
                                    value={formData.username}
                                    onChange={handleChange}
                                    required
                                    className={`auth-input ${errors.fullName ? 'error' : ''}`}
                                />
                            </div>
                            {errors.Username && <span className="error-message">{errors.Username}</span>}
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
                                    className={`auth-input ${errors.password ? 'error' : ''}`}
                                />
                                <button
                                    type="button"
                                    className="password-toggle"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                                </button>
                            </div>
                            {errors.password && <span className="error-message">{errors.password}</span>}
                        </div>

                        <div className="form-group">
                            <div className="input-wrapper">
                                <FaLock className="input-icon" />
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    name="confirmPassword"
                                    placeholder="Confirm password"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    required
                                    className={`auth-input ${errors.confirmPassword ? 'error' : ''}`}
                                />
                                <button
                                    type="button"
                                    className="password-toggle"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                >
                                    {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                                </button>
                            </div>
                            {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
                        </div>

                        {/* <div className="form-options">
                            <label className="checkbox-wrapper">
                                <input type="checkbox" required />
                                <span className="checkmark"></span>
                                I agree to the{' '}
                                <a href="#" className="terms-link">Terms of Service</a> and{' '}
                                <a href="#" className="terms-link">Privacy Policy</a>
                            </label>
                        </div> */}

                        <button 
                            type="submit" 
                            className={`auth-button ${isLoading ? 'loading' : ''}`}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <div className="spinner"></div>
                            ) : (
                                'Create Account'
                            )}
                        </button>
                    </form>

                    <div className="divider">
                    </div>

                    {/* <div className="social-buttons">
                        <button 
                            className="social-button google"
                            onClick={() => handleSocialRegister('Google')}
                        >
                            <FaGoogle />
                            Google
                        </button>
                        <button 
                            className="social-button github"
                            onClick={() => handleSocialRegister('GitHub')}
                        >
                            <FaGithub />
                            GitHub
                        </button>
                    </div> */}

                    <div className="auth-footer">
                        <p>
                            Already have an account?{' '}
                            <button 
                                className="link-button"
                                onClick={() => navigate('/login')}
                            >
                                Sign in
                            </button>
                        </p>
                    </div>
                </div>

                <div className="auth-visual">
                    <div className="visual-content">
                        <h2>Join the Future of Communication</h2>
                        <p>Create your account and unlock the power of seamless video communication. Connect with teams, friends, and colleagues worldwide.</p>
                        <div className="feature-list">
                            <div className="feature-item">
                                <div className="feature-icon">🚀</div>
                                <span>Instant Setup</span>
                            </div>
                            <div className="feature-item">
                                <div className="feature-icon">🌍</div>
                                <span>Global Access</span>
                            </div>
                            <div className="feature-item">
                                <div className="feature-icon">⚡</div>
                                <span>Lightning Fast</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

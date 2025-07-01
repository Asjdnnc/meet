import React, { useState, useEffect } from 'react';
import { FaVideo, FaUsers, FaShieldAlt, FaPlay, FaMicrophone, FaCamera, FaDesktop, FaMobile, FaTablet, FaGlobe, FaClock, FaStar } from 'react-icons/fa';
import './Landing.css';
import { Link, Navigate } from 'react-router';

export default function Landing() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [activeFeature, setActiveFeature] = useState(0);
    const meetingCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            setActiveFeature((prev) => (prev + 1) % 3);
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="landing-page">
            {/* Navbar */}
            <nav className={`navbar ${isScrolled ? 'navbar-scrolled' : ''}`}>
                <div className="nav-container">
                    <div className="nav-logo">
                        <div className="logo-icon">
                            <FaVideo />
                        </div>
                        <span className="logo-text">MeetConnect</span>
                    </div>
                    <div className="nav-buttons">
                        <button className="nav-btn nav-btn-secondary" onClick={
                            () => window.location.href = '/login'
                        }>Login</button>
                        <button className="nav-btn nav-btn-secondary" 
                        ><Link to='/signup'>Register</Link></button>
                        <button className="nav-btn nav-btn-primary" onClick={ 
                            () => window.location.href = `/${meetingCode}`
                        }>Join as Guest</button>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="hero-section">
                <div className="hero-background">
                    <div className="floating-shape shape-1"></div>
                    <div className="floating-shape shape-2"></div>
                    <div className="floating-shape shape-3"></div>
                </div>
                <div className="hero-content">
                    <div className="hero-text">
                        <h1 className="hero-title">
                            Connect with
                            <span className="gradient-text"> Anyone, Anywhere</span>
                        </h1>
                        <p className="hero-subtitle">
                            Experience crystal-clear video calls with advanced features. 
                            Join meetings instantly, collaborate seamlessly, and stay connected with your team.
                        </p>
                        <div className="hero-stats">
                            <div className="stat">
                                <span className="stat-number">10M+</span>
                                <span className="stat-label">Active Users</span>
                            </div>
                            <div className="stat">
                                <span className="stat-number">150+</span>
                                <span className="stat-label">Countries</span>
                            </div>
                            <div className="stat">
                                <span className="stat-number">99.9%</span>
                                <span className="stat-label">Uptime</span>
                            </div>
                        </div>
                        <div className="hero-buttons">
                            <button className="btn btn-primary" onClick={
                                ()=>{
                                    window.location.href = '/login'
                                }
                            }>
                                <FaPlay />
                                Start Meeting
                            </button>
                            <button className="btn btn-outline" onClick={
                                () => window.location.href = 'https://socket.io/'
                            }>
                                Learn More
                            </button>
                        </div>
                    </div>
                    <div className="hero-visual">
                        <div className="video-preview">
                            <div className="video-screen">
                                <div className="participant-grid">
                                    <div className="participant active"></div>
                                    <div className="participant"></div>
                                    <div className="participant"></div>
                                    <div className="participant"></div>
                                </div>
                            </div>
                            <div className="video-controls">
                                <div className="control-btn">
                                    <FaMicrophone />
                                </div>
                                <div className="control-btn">
                                    <FaCamera />
                                </div>
                                <div className="control-btn primary">
                                    <FaPlay />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="features-section">
                <div className="container">
                    <div className="section-header">
                        <h2 className="section-title">Why Choose MeetConnect?</h2>
                        <p className="section-subtitle">
                            Built for modern teams who need reliable, secure, and feature-rich video communication.
                        </p>
                    </div>
                    
                    <div className="features-grid">
                        <div className={`feature-card ${activeFeature === 0 ? 'active' : ''}`}>
                            <div className="feature-icon">
                                <FaVideo />
                            </div>
                            <h3>HD Video Quality</h3>
                            <p>Experience crystal-clear HD video calls with adaptive quality that works on any connection.</p>
                            <div className="feature-highlight"></div>
                        </div>
                        
                        <div className={`feature-card ${activeFeature === 1 ? 'active' : ''}`}>
                            <div className="feature-icon">
                                <FaUsers />
                            </div>
                            <h3>Group Meetings</h3>
                            <p>Host meetings with unlimited participants. Perfect for teams, classes, and events.</p>
                            <div className="feature-highlight"></div>
                        </div>
                        
                        <div className={`feature-card ${activeFeature === 2 ? 'active' : ''}`}>
                            <div className="feature-icon">
                                <FaShieldAlt />
                            </div>
                            <h3>Secure & Private</h3>
                            <p>End-to-end encryption ensures your conversations stay private and secure.</p>
                            <div className="feature-highlight"></div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Platform Section */}
            <section className="platform-section">
                <div className="container">
                    <div className="section-header">
                        <h2 className="section-title">Works on Every Device</h2>
                        <p className="section-subtitle">
                            Access your meetings from anywhere, on any device
                        </p>
                    </div>
                    <div className="platform-grid">
                        <div className="platform-card">
                            <FaDesktop />
                            <h3>Desktop</h3>
                            <p>Windows, Mac, Linux</p>
                        </div>
                        <div className="platform-card">
                            <FaMobile />
                            <h3>Mobile</h3>
                            <p>iOS & Android</p>
                        </div>
                        <div className="platform-card">
                            <FaTablet />
                            <h3>Tablet</h3>
                            <p>iPad & Android</p>
                        </div>
                        <div className="platform-card">
                            <FaGlobe />
                            <h3>Web</h3>
                            <p>Any Browser</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Testimonials Section */}
            <section className="testimonials-section">
                <div className="container">
                    <div className="section-header">
                        <h2 className="section-title">What Our Users Say</h2>
                    </div>
                    <div className="testimonials-grid">
                        <div className="testimonial-card">
                            <div className="stars">
                                <FaStar />
                                <FaStar />
                                <FaStar />
                                <FaStar />
                                <FaStar />
                            </div>
                            <p>"MeetConnect has transformed how our remote team collaborates. The video quality is incredible!"</p>
                            <div className="testimonial-author">
                                <div className="author-avatar"></div>
                                <div>
                                    <h4>Sarah Johnson</h4>
                                    <span>Product Manager, TechCorp</span>
                                </div>
                            </div>
                        </div>
                        <div className="testimonial-card">
                            <div className="stars">
                                <FaStar />
                                <FaStar />
                                <FaStar />
                                <FaStar />
                                <FaStar />
                            </div>
                            <p>"The ease of use and reliability make it our go-to platform for all video meetings."</p>
                            <div className="testimonial-author">
                                <div className="author-avatar"></div>
                                <div>
                                    <h4>Mike Chen</h4>
                                    <span>CEO, StartupXYZ</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="cta-section">
                <div className="container">
                    <div className="cta-content">
                        <h2>Ready to Get Started?</h2>
                        <p>Join millions of users who trust MeetConnect for their video communication needs.</p>
                        <div className="cta-buttons">
                            <button className="btn btn-white" onClick={()=>{
                                window.location.href = '/signup'
                            }}>Create Account</button>
                            <button className="btn btn-outline-white">Join as Guest</button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="footer">
                <div className="container">
                    <div className="footer-content">
                        <div className="footer-brand">
                            <div className="footer-logo">
                                <FaVideo />
                                <span>MeetConnect</span>
                            </div>
                            <p>Connecting people through seamless video communication</p>
                        </div>
                        <div className="footer-links">
                            <div className="footer-column">
                                <h4>Product</h4>
                                <a href="#">Features</a>
                                <a href="#">Pricing</a>
                                <a href="#">Security</a>
                            </div>
                            <div className="footer-column">
                                <h4>Company</h4>
                                <a href="#">About</a>
                                <a href="#">Careers</a>
                                <a href="#">Contact</a>
                            </div>
                            <div className="footer-column">
                                <h4>Support</h4>
                                <a href="#">Help Center</a>
                                <a href="#">Community</a>
                                <a href="#">Status</a>
                            </div>
                            <div className="footer-column">
                                <h4>Legal</h4>
                                <a href="#">Privacy Policy</a>
                                <a href="#">Terms of Service</a>
                                <a href="#">Cookie Policy</a>
                            </div>
                        </div>
                    </div>
                    <div className="footer-bottom">
                        <p>&copy; 2025 MeetConnect. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
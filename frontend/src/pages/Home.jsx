import React, { useContext, useState } from 'react';
import withAuth from '../utils/withAuth';
import { useNavigate } from 'react-router-dom';
import { FaVideo, FaHistory, FaSignOutAlt, FaUsers, FaPlay, FaMicrophone, FaCamera, FaDesktop, FaMobile, FaTablet, FaGlobe } from 'react-icons/fa';
import { AuthContext } from '../contexts/AuthContext';
import './Home.css';

function HomeComponent() 
    {
    const navigate = useNavigate();
    const [meetingCode, setMeetingCode] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const { addToUserHistory } = useContext(AuthContext);

    const handleJoinVideoCall = async () => {
        console.log('Join button clicked, meeting code:', meetingCode);
        
        if (!meetingCode.trim()) {
            alert('Please enter a meeting code');
            return;
        }
        
        setIsLoading(true);
        try {
            // await addToUserHistory(meetingCode);
            console.log('Joining meeting with code:', meetingCode);
            
            // Ensure the meeting code is properly formatted
            const formattedCode = meetingCode.trim().toUpperCase();
            console.log('Formatted code:', formattedCode);
            console.log('Navigating to:', `/${formattedCode}`);
            
            // Navigate to the meeting page
            navigate(`/${formattedCode}`);
        } catch (error) {
            console.error('Error joining meeting:', error);
            alert('Failed to join meeting. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateMeeting = () => {
        console.log('Create meeting button clicked');
        alert('Create meeting button was clicked!');
        const newMeetingCode = Math.random().toString(36).substring(2, 8).toUpperCase();
        console.log('Generated meeting code:', newMeetingCode);
        setMeetingCode(newMeetingCode);
    };

    const handleLogout = () => {
        console.log('Logout button clicked');
        localStorage.removeItem("token");
        navigate("/");
    };

    return (
        <div>
            <div className="home-page">
                {/* Background */}
                <div className="home-background">
                    <div className="floating-shape shape-1"></div>
                    <div className="floating-shape shape-2"></div>
                    <div className="floating-shape shape-3"></div>
                </div>

                {/* Navbar */}
                <nav className="home-navbar">
                    <div className="nav-container">
                        <div className="nav-brand">
                            <div className="logo-icon">
                                <FaVideo />
                            </div>
                            <span className="logo-text">MeetConnect</span>
                        </div>
                        
                        <div className="nav-actions">
                            <button 
                                className="nav-btn nav-btn-secondary"
                                onClick={() => navigate("/history")}
                            >
                                <FaHistory />
                                History
                            </button>
                            <button 
                                className="nav-btn nav-btn-danger"
                                onClick={handleLogout}
                            >
                                <FaSignOutAlt />
                                Logout
                            </button>
                        </div>
                    </div>
                </nav>

                {/* Main Content */}
                <div className="home-content">
                    <div className="home-container">
                        {/* Left Panel */}
                        <div className="left-panel">
                            <div className="welcome-section">
                                <h1 className="welcome-title">
                                    Welcome to <span className="gradient-text">MeetConnect</span>
                                </h1>
                                <p className="welcome-subtitle">
                                    Experience crystal-clear video calls with advanced features. 
                                    Connect with anyone, anywhere, anytime.
                                </p>
                            </div>

                            <div className="meeting-section">
                                <h2>Join or Create a Meeting</h2>
                                
                                <div className="meeting-input-group">
                                    <div className="input-wrapper">
                                        <FaVideo className="input-icon" />
                                        <input
                                            type="text"
                                            placeholder="Enter meeting code"
                                            value={meetingCode}
                                            onChange={(e) => setMeetingCode(e.target.value.toUpperCase())}
                                            className="meeting-input"
                                            maxLength="6"
                                        />
                                    </div>
                                    
                                    <div className="meeting-buttons">
                                        
                                        
                                        <button 
                                            className="btn btn-primary"
                                            onClick={handleJoinVideoCall}
                                            onMouseDown={() => console.log('Join button mouse down')}
                                            onTouchStart={() => console.log('Join button touch start')}
                                            disabled={isLoading || !meetingCode.trim()}
                                        >
                                            {isLoading ? (
                                                <div className="spinner"></div>
                                            ) : (
                                                <>
                                                    <FaPlay />
                                                    Join Meeting
                                                </>
                                            )}
                                        </button>
                                        
                                        <button 
                                            className="btn btn-outline"
                                            onClick={() => {
                                            
                                                const newCode = Math.random().toString(36).substring(2, 8).toUpperCase();
                                                setMeetingCode(newCode);
                                                navigate(`/${newCode}`);
                                            }}
                                           
                                        >
                                            Create New 
                                        </button>
                                    </div>
                                </div>

                                <div className="quick-actions">
                                    <h3>Quick Actions</h3>
                                    <div className="action-cards">
                                        <div className="action-card">
                                            <div className="action-icon">
                                                <FaUsers />
                                            </div>
                                            <h4>Team Meeting</h4>
                                            <p>Start a meeting with your team</p>
                                        </div>
                                        <div className="action-card">
                                            <div className="action-icon">
                                                <FaVideo />
                                            </div>
                                            <h4>One-on-One</h4>
                                            <p>Private video call</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Panel */}
                        <div className="right-panel">
                            <div className="video-preview">
                                <div className="video-screen">
                                    <div className="participant-grid">
                                        <div className="participant active">
                                            <div className="participant-avatar"></div>
                                            <div className="participant-name">You</div>
                                        </div>
                                        <div className="participant">
                                            <div className="participant-avatar"></div>
                                            <div className="participant-name">Aditya</div>
                                        </div>
                                        <div className="participant">
                                            <div className="participant-avatar"></div>
                                            <div className="participant-name">Asjdnnc</div>
                                        </div>
                                        <div className="participant">
                                            <div className="participant-avatar"></div>
                                            <div className="participant-name">Mike</div>
                                        </div>
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

                            <div className="features-showcase">
                                <h3>Why Choose MeetConnect?</h3>
                                <div className="feature-list">
                                    <div className="feature-item">
                                        <div className="feature-icon">🎥</div>
                                        <div>
                                            <h4>HD Video Quality</h4>
                                            <p>Crystal clear video calls</p>
                                        </div>
                                    </div>
                                    <div className="feature-item">
                                        <div className="feature-icon">🔒</div>
                                        <div>
                                            <h4>Secure & Private</h4>
                                            <p>End-to-end encryption</p>
                                        </div>
                                    </div>
                                    <div className="feature-item">
                                        <div className="feature-icon">👥</div>
                                        <div>
                                            <h4>Group Meetings</h4>
                                            <p>Unlimited participants</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default HomeComponent;
// export default withAuth(HomeComponent);
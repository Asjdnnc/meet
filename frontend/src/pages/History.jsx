import React, { useContext, useEffect, useState } from 'react'
import { AuthContext } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import HomeIcon from '@mui/icons-material/Home';
import HistoryEduIcon from '@mui/icons-material/HistoryEdu';
import axios from 'axios';
import './History.css'; // Add a custom CSS file for glassmorphism and background

export default function History() {
    const { getHistoryOfUser } = useContext(AuthContext);
    const [meetings, setMeetings] = useState([]);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const username = localStorage.getItem('username');
                const response = await axios.get(`${import.meta.env.VITE_backend_URL}/users/activity/get_all_activity?username=${username}`);
                const data = Array.isArray(response.data) ? response.data : [];
                setMeetings(data);
            } catch (err) {
                setError('Failed to load meeting history.');
            }
        };
        fetchHistory();
    }, [getHistoryOfUser]);

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return 'Invalid date';
        const day = date.getDate().toString().padStart(2, "0");
        const month = (date.getMonth() + 1).toString().padStart(2, "0");
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    return (
        <div className="history-bg">
            <div className="history-header-glass">
                <IconButton onClick={() => navigate("/home")}
                    className="history-home-btn"
                    sx={{ background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)' }}
                >
                    <HomeIcon fontSize="medium" />
                </IconButton>
                <HistoryEduIcon className="history-title-icon" fontSize="large" />
                <Typography variant="h4" className="history-title-text">
                    Meeting History
                </Typography>
            </div>
            <div className="history-content-glass">
                {error && (
                    <Typography color="error" align="center" sx={{ mb: 2 }}>
                        {error}
                    </Typography>
                )}
                {meetings.length > 0 ? (
                    meetings.map((meeting, i) => (
                        <Card key={meeting.meetingCode || i} className="history-card-glass" variant="outlined" sx={{ mb: 2 }}>
                            <CardContent>
                                <Typography sx={{ fontSize: 15, fontWeight: 600 }} color="primary" gutterBottom>
                                    Code: {meeting.meetingCode}
                                </Typography>
                                <Typography sx={{ mb: 1.5, fontSize: 14 }} color="text.secondary">
                                    Date: {formatDate(meeting.date)}
                                </Typography>
                            </CardContent>
                        </Card>
                    ))
                ) : !error ? (
                    <div className="history-empty-state">
                        <HistoryEduIcon className="empty-history-icon" fontSize="large" />
                        <Typography color="text.secondary" align="center" sx={{ mt: 2, fontSize: 18 }}>
                            No meeting history found.<br />
                            Join or create a meeting to see your history here!
                        </Typography>
                    </div>
                ) : null}
            </div>
        </div>
    );
}
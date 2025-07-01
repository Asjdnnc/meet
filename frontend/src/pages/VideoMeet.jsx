import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react'
import io from "socket.io-client";
import { Badge, IconButton, TextField } from '@mui/material';
import { Button } from '@mui/material';
import VideocamIcon from '@mui/icons-material/Videocam';
import VideocamOffIcon from '@mui/icons-material/VideocamOff'
import styles from "./videoComponent.module.css";
import CallEndIcon from '@mui/icons-material/CallEnd'
import MicIcon from '@mui/icons-material/Mic'
import MicOffIcon from '@mui/icons-material/MicOff'
import ScreenShareIcon from '@mui/icons-material/ScreenShare';
import StopScreenShareIcon from '@mui/icons-material/StopScreenShare'
import ChatIcon from '@mui/icons-material/Chat'
import PersonIcon from '@mui/icons-material/Person'
import './VideoMeet.css'
import axios from 'axios';
// import server from '../environment';

// const server_url = se rver;

var connections = {};

const peerConfigConnections = {
    "iceServers": [
        { "urls": "stun:stun.l.google.com:19302" }
    ]
}

// Add this function to log meeting activity
const logMeetingActivity = async (meetingCode) => {
    try {
        const token = localStorage.getItem('token');
        await axios.post(`${import.meta.env.VITE_backend_URL}/users/activity/add_activity`, {
            meetingCode,
            date: new Date(),
            userId: localStorage.getItem('username')
        }, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
    } catch (err) {
        console.error('Failed to log meeting activity:', err);
    }
};

export default function VideoMeet() {

    var socketRef = useRef();
    let socketIdRef = useRef(); //self socketId

    let localVideoref = useRef(); //self video

    let [videoAvailable, setVideoAvailable] = useState(true); //permission

    let [audioAvailable, setAudioAvailable] = useState(true); //permission

    let [video, setVideo] = useState([]);

    let [audio, setAudio] = useState();

    let [screen, setScreen] = useState();

    let [showModal, setModal] = useState(false);

    let [screenAvailable, setScreenAvailable] = useState(); //permission

    let [messages, setMessages] = useState([])

    let [message, setMessage] = useState(""); //self

    let [newMessages, setNewMessages] = useState(0);

    let [askForUsername, setAskForUsername] = useState(true); //guest user 

    let [username, setUsername] = useState(() => {
        const storedUsername = localStorage.getItem('username');
        console.log('Retrieved username from localStorage:', storedUsername);
        return storedUsername || 'Anonymous';
    });

    const videoRef = useRef([])

    let [videos, setVideos] = useState([])

    // Lobby controls state
    let [lobbyVideo, setLobbyVideo] = useState(true);
    let [lobbyAudio, setLobbyAudio] = useState(true);

    // Participant status tracking
    let [participantStatuses, setParticipantStatuses] = useState({});
    // Participant usernames tracking
    let [participantNames, setParticipantNames] = useState({});

    // Connection status
    let [connectionStatus, setConnectionStatus] = useState('disconnected');

    // TODO
    // if(isChrome() === false) {


    // }

    useEffect(() => {
        console.log("HELLO")
        getPermissions();

        // Cleanup function for component unmount
        return () => {
            // Clean up socket connection
            if (socketRef.current) {
                socketRef.current.disconnect();
            }
            
            // Clean up media streams
            if (localVideoref.current && localVideoref.current.srcObject) {
                const tracks = localVideoref.current.srcObject.getTracks();
                tracks.forEach(track => track.stop());
            }
            
            // Clean up peer connections
            Object.keys(connections).forEach(id => {
                if (connections[id]) {
                    connections[id].close();
                }
            });
            
            // Reset state
            setVideos([]);
            setParticipantStatuses({});
            setParticipantNames({});
        }
    }, [])

    useEffect(() => {
        if (localVideoref.current && localVideoref.current.srcObject) {
            // Apply lobby settings to existing stream
            if (!lobbyVideo) {
                const videoTracks = localVideoref.current.srcObject.getVideoTracks();
                videoTracks.forEach(track => {
                    track.enabled = false;
                });
            }
            
            if (!lobbyAudio) {
                const audioTracks = localVideoref.current.srcObject.getAudioTracks();
                audioTracks.forEach(track => {
                    track.enabled = false;
                });
            }
        }
    }, [lobbyVideo, lobbyAudio])

    let getDislayMedia = () => {
        if (screen) {
            if (navigator.mediaDevices.getDisplayMedia) {
                navigator.mediaDevices.getDisplayMedia({ video: true, audio: true })
                    .then(getDislayMediaSuccess)
                    .then((stream) => { })
                    .catch((e) => console.log(e))
            }
        }
    }

    const getPermissions = async () => {
        try {
            const videoPermission = await navigator.mediaDevices.getUserMedia({ video: true });
            if (videoPermission) {
                setVideoAvailable(true);
                console.log('Video permission granted');
            } else {
                setVideoAvailable(false);
                console.log('Video permission denied');
            }

            const audioPermission = await navigator.mediaDevices.getUserMedia({ audio: true });
            if (audioPermission) {
                setAudioAvailable(true);
                console.log('Audio permission granted');
            } else {
                setAudioAvailable(false);
                console.log('Audio permission denied');
            }

            if (navigator.mediaDevices.getDisplayMedia) {
                setScreenAvailable(true);
            } else {
                setScreenAvailable(false);
            }

            if (videoAvailable || audioAvailable) {
                const userMediaStream = await navigator.mediaDevices.getUserMedia({ video: videoAvailable, audio: audioAvailable });
                if (userMediaStream) {
                    window.localStream = userMediaStream;
                    
                    // Apply lobby settings to the stream
                    if (!lobbyVideo) {
                        const videoTracks = userMediaStream.getVideoTracks();
                        videoTracks.forEach(track => {
                            track.enabled = false;
                        });
                    }
                    
                    if (!lobbyAudio) {
                        const audioTracks = userMediaStream.getAudioTracks();
                        audioTracks.forEach(track => {
                            track.enabled = false;
                        });
                    }
                    
                    if (localVideoref.current) {
                        localVideoref.current.srcObject = userMediaStream;
                    }
                }
            }
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        if (video !== undefined && audio !== undefined) {
            getUserMedia();
            console.log("SET STATE HAS ", video, audio);

        }


    }, [video, audio])
    let getMedia = () => {
        setVideo(lobbyVideo);
        setAudio(lobbyAudio);
    }




    let getUserMediaSuccess = (stream) => {
        try {
            window.localStream.getTracks().forEach(track => track.stop())
        } catch (e) { console.log(e) }

        window.localStream = stream
        
        // Apply current video/audio state to the new stream
        if (!video) {
            const videoTracks = stream.getVideoTracks();
            videoTracks.forEach(track => {
                track.enabled = false;
            });
        }
        
        if (!audio) {
            const audioTracks = stream.getAudioTracks();
            audioTracks.forEach(track => {
                track.enabled = false;
            });
        }
        
        localVideoref.current.srcObject = stream

        for (let id in connections) {
            if (id === socketIdRef.current) continue
            connections[id].addStream(window.localStream)
            connections[id].createOffer().then((description) => {
                connections[id].setLocalDescription(description)
                    .then(() => {
                        socketRef.current.emit('signal', id, JSON.stringify({ 'sdp': connections[id].localDescription }))
                    })
                    .catch(e => console.log(e))
            })
        }

        stream.getTracks().forEach(track => track.onended = () => {
            setVideo(false);
            setAudio(false);
            try {
                let tracks = localVideoref.current.srcObject.getTracks()
                tracks.forEach(track => track.stop())
            } catch (e) { console.log(e) }
            let blackSilence = (...args) => new MediaStream([black(...args), silence()])
            window.localStream = blackSilence()
            localVideoref.current.srcObject = window.localStream
            for (let id in connections) {
                connections[id].addStream(window.localStream)
                connections[id].createOffer().then((description) => {
                    connections[id].setLocalDescription(description)
                        .then(() => {
                            socketRef.current.emit('signal', id, JSON.stringify({ 'sdp': connections[id].localDescription }))
                        })
                        .catch(e => console.log(e))
                })
            }
        })
    }

    let getUserMedia = () => {
        if ((video && videoAvailable) || (audio && audioAvailable)) {
            navigator.mediaDevices.getUserMedia({ video: video && videoAvailable, audio: audio && audioAvailable })
                .then(getUserMediaSuccess)
                .then((stream) => { })
                .catch((e) => console.log(e))
        } else {
            try {
                let tracks = localVideoref.current.srcObject.getTracks()
                tracks.forEach(track => track.stop())
            } catch (e) { }
        }
    }





    let getDislayMediaSuccess = (stream) => {
        try {
            window.localStream.getTracks().forEach(track => track.stop())
        } catch (e) { console.log(e) }
        window.localStream = stream
        localVideoref.current.srcObject = stream
        for (let id in connections) {
            if (id === socketIdRef.current) continue
            connections[id].addStream(window.localStream)
            connections[id].createOffer().then((description) => {
                connections[id].setLocalDescription(description)
                    .then(() => {
                        socketRef.current.emit('signal', id, JSON.stringify({ 'sdp': connections[id].localDescription }))
                    })
                    .catch(e => console.log(e))
            })
        }
        stream.getTracks().forEach(track => track.onended = () => {
            setScreen(false)
            try {
                let tracks = localVideoref.current.srcObject.getTracks()
                tracks.forEach(track => track.stop())
            } catch (e) { console.log(e) }
            let blackSilence = (...args) => new MediaStream([black(...args), silence()])
            window.localStream = blackSilence()
            localVideoref.current.srcObject = window.localStream
            getUserMedia()
        })
    }

    // Helper function to process queued ICE candidates
    const processQueuedIceCandidates = (connection) => {
        if (connection.queuedIceCandidates && connection.queuedIceCandidates.length > 0) {
            console.log('Processing', connection.queuedIceCandidates.length, 'queued ICE candidates');
            connection.queuedIceCandidates.forEach(candidate => {
                connection.addIceCandidate(candidate)
                    .catch(e => console.log('Error adding queued ICE candidate:', e));
            });
            connection.queuedIceCandidates = [];
        }
    };

    let gotMessageFromServer = (fromId, message) => {
        try {
        var signal = JSON.parse(message)

        if (fromId !== socketIdRef.current) {
            if (signal.sdp) {
                    if (!connections[fromId]) {
                        console.log('Creating new connection for:', fromId);
                        connections[fromId] = new RTCPeerConnection(peerConfigConnections)
                        
                        connections[fromId].onicecandidate = function (event) {
                            if (event.candidate != null) {
                                socketRef.current.emit('signal', fromId, JSON.stringify({ 'ice': event.candidate }))
                            }
                        }

                        connections[fromId].onaddstream = (event) => {
                            console.log("Stream received from:", fromId);
                            let videoExists = videoRef.current.find(video => video.socketId === fromId);

                            if (videoExists) {
                                setVideos(videos => {
                                    const updatedVideos = videos.map(video =>
                                        video.socketId === fromId ? { ...video, stream: event.stream } : video
                                    );
                                    videoRef.current = updatedVideos;
                                    return updatedVideos;
                                });
                            } else {
                                let newVideo = {
                                    socketId: fromId,
                                    stream: event.stream,
                                    autoplay: true,
                                    playsinline: true
                                };

                                setVideos(videos => {
                                    const updatedVideos = [...videos, newVideo];
                                    videoRef.current = updatedVideos;
                                    return updatedVideos;
                                });
                            }
                        };

                        // Add connection state change handler
                        connections[fromId].onconnectionstatechange = () => {
                            console.log('Connection state changed for', fromId, ':', connections[fromId].connectionState);
                        };

                        // Add signaling state change handler
                        connections[fromId].onsignalingstatechange = () => {
                            console.log('Signaling state changed for', fromId, ':', connections[fromId].signalingState);
                        };

                        if (window.localStream) {
                            connections[fromId].addStream(window.localStream)
                        }
                    }

                    // Check connection state before proceeding
                    if (!connections[fromId]) {
                        console.log('Connection not found for:', fromId);
                        return;
                    }

                    const connection = connections[fromId];
                    const sdp = new RTCSessionDescription(signal.sdp);

                    // Handle the SDP based on its type
                    if (signal.sdp.type === 'offer') {
                        // Handle incoming offer
                        connection.setRemoteDescription(sdp)
                            .then(() => {
                                console.log('Remote description set for offer from:', fromId);
                                // Process any queued ICE candidates
                                processQueuedIceCandidates(connection);
                                return connection.createAnswer();
                            })
                            .then((answer) => {
                                if (answer) {
                                    return connection.setLocalDescription(answer);
                                }
                            })
                            .then(() => {
                                if (connection.localDescription) {
                                    socketRef.current.emit('signal', fromId, JSON.stringify({ 'sdp': connection.localDescription }));
                                }
                            })
                            .catch(e => {
                                console.log('Error handling offer from', fromId, ':', e);
                                // If there's an error, try to reset the connection
                                if (connection.signalingState === 'stable') {
                                    console.log('Connection is stable, proceeding with offer');
                                    connection.setRemoteDescription(sdp)
                                        .then(() => connection.createAnswer())
                                        .then((answer) => answer ? connection.setLocalDescription(answer) : null)
                                        .then(() => {
                                            if (connection.localDescription) {
                                                socketRef.current.emit('signal', fromId, JSON.stringify({ 'sdp': connection.localDescription }));
                                            }
                                        })
                                        .catch(e2 => console.log('Retry failed:', e2));
                                }
                            });
                    } else if (signal.sdp.type === 'answer') {
                        // Handle incoming answer
                        if (connection.signalingState !== 'stable') {
                            connection.setRemoteDescription(sdp)
                                .then(() => {
                                    console.log('Remote description set for answer from:', fromId);
                                    // Process any queued ICE candidates
                                    processQueuedIceCandidates(connection);
                                })
                                .catch(e => {
                                    console.log('Error setting remote description for answer from', fromId, ':', e);
                                });
                        } else {
                            console.log('Connection is stable, skipping answer from:', fromId);
                        }
                    }
            }

            if (signal.ice) {
                    if (connections[fromId]) {
                        const connection = connections[fromId];
                        if (connection.remoteDescription && connection.remoteDescription.type) {
                            connection.addIceCandidate(new RTCIceCandidate(signal.ice))
                                .catch(e => console.log('Error adding ICE candidate:', e));
                        } else {
                            console.log('Remote description not set yet, queuing ICE candidate');
                            // Queue the ICE candidate for later
                            if (!connection.queuedIceCandidates) {
                                connection.queuedIceCandidates = [];
                            }
                            connection.queuedIceCandidates.push(new RTCIceCandidate(signal.ice));
                        }
                    }
                }
            }
        } catch (error) {
            console.error('Error processing signal message:', error);
        }
    }




    let connectToSocketServer = () => {
        const url = import.meta.env.VITE_backend_URL;
        console.log('Connecting to socket server at:', url);
        socketRef.current = io.connect(url, { 
            secure: false,
            transports: ['websocket', 'polling'],
            timeout: 10000,
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000
        })

        socketRef.current.on('connect', () => {
            console.log('Connected to server with ID:', socketRef.current.id);
            console.log('Sending username to server:', username);
            setConnectionStatus('connected');
            socketRef.current.emit('join-call', window.location.href, username)
            socketIdRef.current = socketRef.current.id

            // Log meeting activity after joining
            const meetingCode = window.location.pathname.split('/').pop();
            logMeetingActivity(meetingCode);

            // Add local username to participant names
            setParticipantNames(prev => {
                console.log('Setting local username:', username, 'for socket:', socketRef.current.id);
                const updatedNames = {
                    ...prev,
                    [socketRef.current.id]: username
                };
                console.log('Updated participant names after connection:', updatedNames);
                return updatedNames;
            });

            socketRef.current.on('chat-message', addMessage)

            socketRef.current.on('user-left', (id) => {
                console.log('User left:', id);
                setVideos((videos) => videos.filter((video) => video.socketId !== id))
                // Remove participant status and name when they leave
                setParticipantStatuses(prev => {
                    const newStatuses = { ...prev };
                    delete newStatuses[id];
                    return newStatuses;
                });
                setParticipantNames(prev => {
                    const newNames = { ...prev };
                    delete newNames[id];
                    return newNames;
                });
            })

            socketRef.current.on('username-update', (id, name) => {
                console.log('Username update received from server:', id, name);
                setParticipantNames(prev => {
                    console.log('Updating participant names:', { id, name, current: prev });
                    const updatedNames = {
                        ...prev,
                        [id]: name
                    };
                    console.log('Updated participant names:', updatedNames);
                    return updatedNames;
                });
            })

            socketRef.current.on('user-joined', (id, clients) => {
                console.log('User joined:', id, 'Total clients:', clients);
                
                // If this is a new user joining (not us), we need to send our username to them
                if (id !== socketIdRef.current) {
                    console.log('New user joined, sending our username to them');
                    // Send our username to the new participant
                    socketRef.current.emit('username-update', id, username);
                }
                
                // If we are the one who just joined, send our username to all existing participants
                if (id === socketIdRef.current) {
                    console.log('We joined, sending our username to all existing participants');
                    clients.forEach((participantId) => {
                        if (participantId !== socketIdRef.current) {
                            console.log('Sending username to existing participant:', participantId);
                            socketRef.current.emit('username-update', participantId, username);
                        }
                    });
                }
                
                clients.forEach((socketListId) => {
                    if (socketListId === socketIdRef.current) return; // Skip self

                    connections[socketListId] = new RTCPeerConnection(peerConfigConnections)
                    
                    // Wait for their ice candidate       
                    connections[socketListId].onicecandidate = function (event) {
                        if (event.candidate != null) {
                            socketRef.current.emit('signal', socketListId, JSON.stringify({ 'ice': event.candidate }))
                        }
                    }

                    // Wait for their video stream
                    connections[socketListId].onaddstream = (event) => {
                        console.log("Stream received from:", socketListId);

                        let videoExists = videoRef.current.find(video => video.socketId === socketListId);

                        if (videoExists) {
                            console.log("Updating existing video for:", socketListId);
                            setVideos(videos => {
                                const updatedVideos = videos.map(video =>
                                    video.socketId === socketListId ? { ...video, stream: event.stream } : video
                                );
                                videoRef.current = updatedVideos;
                                return updatedVideos;
                            });
                        } else {
                            console.log("Creating new video for:", socketListId);
                            let newVideo = {
                                socketId: socketListId,
                                stream: event.stream,
                                autoplay: true,
                                playsinline: true
                            };

                            setVideos(videos => {
                                const updatedVideos = [...videos, newVideo];
                                videoRef.current = updatedVideos;
                                return updatedVideos;
                            });
                        }
                    };

                    // Add connection state change handler
                    connections[socketListId].onconnectionstatechange = () => {
                        console.log('Connection state changed for', socketListId, ':', connections[socketListId].connectionState);
                    };

                    // Add signaling state change handler
                    connections[socketListId].onsignalingstatechange = () => {
                        console.log('Signaling state changed for', socketListId, ':', connections[socketListId].signalingState);
                    };

                    // Add the local video stream
                    if (window.localStream !== undefined && window.localStream !== null) {
                        connections[socketListId].addStream(window.localStream)
                    } else {
                        let blackSilence = (...args) => new MediaStream([black(...args), silence()])
                        window.localStream = blackSilence()
                        connections[socketListId].addStream(window.localStream)
                    }
                })

                if (id === socketIdRef.current) {
                    for (let id2 in connections) {
                        if (id2 === socketIdRef.current) continue

                        const connection = connections[id2];
                        
                        try {
                            connection.addStream(window.localStream)
                        } catch (e) { 
                            console.log('Error adding stream to connection:', e);
                        }

                        // Add event listener for when remote description is set
                        connection.ondatachannel = (event) => {
                            console.log('Data channel received from:', id2);
                        };

                        // Create offer with proper error handling
                        connection.createOffer()
                            .then((description) => {
                                console.log('Created offer for:', id2);
                                return connection.setLocalDescription(description);
                            })
                                .then(() => {
                                console.log('Local description set for:', id2);
                                if (connection.localDescription) {
                                    socketRef.current.emit('signal', id2, JSON.stringify({ 'sdp': connection.localDescription }));
                                }
                            })
                            .catch(e => {
                                console.log('Error in offer creation for', id2, ':', e);
                                // If there's an error, try to reset and retry
                                if (connection.signalingState === 'stable') {
                                    console.log('Retrying offer creation for:', id2);
                                    connection.createOffer()
                                        .then((description) => connection.setLocalDescription(description))
                                        .then(() => {
                                            if (connection.localDescription) {
                                                socketRef.current.emit('signal', id2, JSON.stringify({ 'sdp': connection.localDescription }));
                                            }
                                        })
                                        .catch(e2 => console.log('Retry failed for', id2, ':', e2));
                                }
                            });
                    }
                }
            })

            socketRef.current.on('participant-status', (participantId, status) => {
                console.log('Participant status update:', participantId, status);
                setParticipantStatuses(prev => ({
                    ...prev,
                    [participantId]: status
                }));
            })
        })

        socketRef.current.on('disconnect', () => {
            console.log('Disconnected from server');
            setConnectionStatus('disconnected');
        })

        socketRef.current.on('connect_error', (error) => {
            console.error('Connection error:', error);
            setConnectionStatus('error');
        })

        socketRef.current.on('reconnect', (attemptNumber) => {
            console.log('Reconnected to server after', attemptNumber, 'attempts');
            setConnectionStatus('connected');
            // Re-join the call after reconnection
            if (username) {
                socketRef.current.emit('join-call', window.location.href, username);
            }
        })

        socketRef.current.on('reconnecting', (attemptNumber) => {
            console.log('Attempting to reconnect...', attemptNumber);
            setConnectionStatus('reconnecting');
        })

        socketRef.current.on('signal', gotMessageFromServer)
    }

    let silence = () => {
        let ctx = new AudioContext()
        let oscillator = ctx.createOscillator()
        let dst = oscillator.connect(ctx.createMediaStreamDestination())
        oscillator.start()
        ctx.resume()
        return Object.assign(dst.stream.getAudioTracks()[0], { enabled: false })
    }
    let black = ({ width = 640, height = 480 } = {}) => {
        let canvas = Object.assign(document.createElement("canvas"), { width, height })
        canvas.getContext('2d').fillRect(0, 0, width, height)
        let stream = canvas.captureStream()
        return Object.assign(stream.getVideoTracks()[0], { enabled: false })
    }

    let handleVideo = useCallback(() => {
        const newVideoState = !video;
        setVideo(newVideoState);
        
        // Control the actual video track
        if (localVideoref.current && localVideoref.current.srcObject) {
            const videoTracks = localVideoref.current.srcObject.getVideoTracks();
            videoTracks.forEach(track => {
                track.enabled = newVideoState;
            });
        }
        
        // Also update the global stream if it exists
        if (window.localStream) {
            const videoTracks = window.localStream.getVideoTracks();
            videoTracks.forEach(track => {
                track.enabled = newVideoState;
            });
        }
        
        // Emit status update to other participants
        if (socketRef.current) {
            socketRef.current.emit('status-update', {
                video: newVideoState,
                audio: audio
            });
        }
    }, [video, audio])
    
    let handleAudio = useCallback(() => {
        const newAudioState = !audio;
        setAudio(newAudioState);
        
        // Control the actual audio track
        if (localVideoref.current && localVideoref.current.srcObject) {
            const audioTracks = localVideoref.current.srcObject.getAudioTracks();
            audioTracks.forEach(track => {
                track.enabled = newAudioState;
            });
        }
        
        // Also update the global stream if it exists
        if (window.localStream) {
            const audioTracks = window.localStream.getAudioTracks();
            audioTracks.forEach(track => {
                track.enabled = newAudioState;
            });
        }
        
        // Emit status update to other participants
        if (socketRef.current) {
            socketRef.current.emit('status-update', {
                video: video,
                audio: newAudioState
            });
        }
    }, [video, audio])

    useEffect(() => {
        if (screen !== undefined) {
            getDislayMedia();
        }
    }, [screen])
    let handleScreen = useCallback(() => {
        setScreen(!screen);
    }, [screen])

    let handleEndCall = useCallback(() => {
        try {
            let tracks = localVideoref.current.srcObject.getTracks()
            tracks.forEach(track => track.stop())
        } catch (e) { }
        window.location.href = "/home"
    }, [])

    let openChat = useCallback(() => {
        setModal(true);
        setNewMessages(0);
    }, [])
    let closeChat = useCallback(() => {
        setModal(false);
    }, [])
    let handleMessage = useCallback((e) => {
        setMessage(e.target.value);
    }, [])

    const addMessage = useCallback((data, sender, socketIdSender) => {
        setMessages((prevMessages) => [
            ...prevMessages,
            { sender: sender, data: data }
        ]);
        if (socketIdSender !== socketIdRef.current) {
            setNewMessages((prevNewMessages) => prevNewMessages + 1);
        }
    }, []);

    let sendMessage = useCallback(() => {
        if (socketRef.current && message.trim()) {
        socketRef.current.emit('chat-message', message, username)
        setMessage("");
    }
    }, [message, username])

    let connect = useCallback(() => {
        setAskForUsername(false);
        setVideo(lobbyVideo);
        setAudio(lobbyAudio);
        getMedia();
    }, [lobbyVideo, lobbyAudio])

    let handleLobbyVideo = useCallback(() => {
        const newVideoState = !lobbyVideo;
        setLobbyVideo(newVideoState);
        
        // Control the actual video track
        if (localVideoref.current && localVideoref.current.srcObject) {
            const videoTracks = localVideoref.current.srcObject.getVideoTracks();
            videoTracks.forEach(track => {
                track.enabled = newVideoState;
            });
        }
        
        // Also update the global stream if it exists
        if (window.localStream) {
            const videoTracks = window.localStream.getVideoTracks();
            videoTracks.forEach(track => {
                track.enabled = newVideoState;
            });
        }
    }, [lobbyVideo])

    let handleLobbyAudio = useCallback(() => {
        const newAudioState = !lobbyAudio;
        setLobbyAudio(newAudioState);
        
        // Control the actual audio track
        if (localVideoref.current && localVideoref.current.srcObject) {
            const audioTracks = localVideoref.current.srcObject.getAudioTracks();
            audioTracks.forEach(track => {
                track.enabled = newAudioState;
            });
        }
        
        // Also update the global stream if it exists
        if (window.localStream) {
            const audioTracks = window.localStream.getAudioTracks();
            audioTracks.forEach(track => {
                track.enabled = newAudioState;
            });
        }
    }, [lobbyAudio])

    // Memoized video grid component to prevent re-renders
    const VideoGrid = useMemo(() => {
        return (
            <div className={`remote-videos-container participants-${videos.length}`}>
                {videos.map((video) => {
                    const participantStatus = participantStatuses[video.socketId] || { video: true, audio: true };
                    const participantName = participantNames[video.socketId] || 'Participant';
                    return (
                        <div key={video.socketId} className="remote-video-item">
                            <video
                                data-socket={video.socketId}
                                ref={ref => {
                                    if (ref && video.stream) {
                                        ref.srcObject = video.stream;
                                    }
                                }}
                                autoPlay
                                className="remote-video"
                            />
                            {/* User Icon when video is off */}
                            {!participantStatus.video && (
                                <div className="video-off-overlay">
                                    <div className="user-icon-container">
                                        <PersonIcon className="user-icon" />
                                    </div>
                                </div>
                            )}
                            <div className="remote-video-overlay">
                                <div className="participant-info">
                                    <span className="participant-name">{participantName}</span>
                                    <div className="participant-status">
                                        {!participantStatus.video && <VideocamOffIcon className="status-icon" />}
                                        {!participantStatus.audio && <MicOffIcon className="status-icon" />}
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    }, [videos, participantStatuses, participantNames]);

    // Memoized local video component
    const LocalVideo = useMemo(() => {
        console.log('LocalVideo rendering with:', {
            username,
            video,
            audio,
            socketId: socketIdRef.current,
            participantNames
        });
        
        return (
            <div className="floating-local-video">
                <video 
                    className="local-video" 
                    ref={localVideoref} 
                    autoPlay 
                    muted
                ></video>
                {/* User Icon when local video is off */}
                {!video && (
                    <div className="video-off-overlay">
                        <div className="user-icon-container">
                            <PersonIcon className="user-icon" />
                    </div>
                    </div>
                )}
                <div className="local-video-overlay">
                    <div className="participant-info">
                        <span className="participant-name">{username || 'You'}</span>
                        <div className="participant-status">
                            {!video && <VideocamOffIcon className="status-icon" />}
                            {!audio && <MicOffIcon className="status-icon" />}
                        </div>
                    </div>
                </div>
            </div>
        );
    }, [video, audio, username]);

    // Memoized chat component to prevent re-renders
    const ChatModal = useMemo(() => {
        if (!showModal) return null;
        
        return (
            <div className="chat-modal">
                <div className="chat-header">
                    <h3>Meeting Chat</h3>
                    <IconButton 
                        onClick={closeChat}
                        className="close-chat-btn"
                    >
                        ×
                    </IconButton>
                </div>
                
                <div className="chat-messages">
                    {messages.length !== 0 ? messages.map((item, index) => (
                        <div key={index} className="chat-message">
                            <div className="message-sender">{item.sender}</div>
                            <div className="message-content">{item.data}</div>
                        </div>
                    )) : (
                        <div className="no-messages">
                            <ChatIcon className="no-messages-icon" />
                            <p>No messages yet</p>
                            <span>Start the conversation!</span>
                        </div>
                    )}
                </div>
                
                <div className="chat-input">
                    <TextField 
                        value={message} 
                        onChange={handleMessage}
                        placeholder="Type a message..."
                        variant="outlined"
                        fullWidth
                        size="small"
                        onKeyPress={(e) => {
                            if (e.key === 'Enter' && message.trim()) {
                                sendMessage();
                            }
                        }}
                    />
                    <Button 
                        variant="contained" 
                        onClick={sendMessage}
                        disabled={!message.trim()}
                        className="send-btn"
                    >
                        Send
                    </Button>
                </div>
            </div>
        );
    }, [showModal, messages, message, closeChat, handleMessage, sendMessage]);

    useEffect(() => {
        const storedUsername = localStorage.getItem('username');
        if (storedUsername) {
            setUsername(storedUsername);
            // setAskForUsername(false); // <--- REMOVE or COMMENT THIS OUT
        }
    }, []);

    // Debug effect to track username changes
    useEffect(() => {
        console.log('Current username state:', {
            username,
            participantNames,
            socketId: socketIdRef.current
        });
    }, [username, participantNames]);

    // Only call connectToSocketServer once on mount
    useEffect(() => {
        connectToSocketServer();
        return () => {
            if (socketRef.current) {
                socketRef.current.off && socketRef.current.off('chat-message');
                socketRef.current.disconnect();
            }
        };
    }, []);

                                    return (
        <div>

            {askForUsername === true ?

                <div className="lobby-container">
                    <div className="lobby-background">
                        <div className="lobby-shape shape-1"></div>
                        <div className="lobby-shape shape-2"></div>
                        <div className="lobby-shape shape-3"></div>
                                        </div>

                    <div className="lobby-content">
                        <div className="lobby-card">
                            <div className="lobby-header">
                                <div className="lobby-icon">
                                    <VideocamIcon />
                                </div>
                                <h1 className="lobby-title">Join Meeting</h1>
                                <p className="lobby-subtitle">Enter your name to join the video call</p>
                            </div>

                            <div className="lobby-form">
                                <div className="input-group">
                                    <TextField 
                                        id="username-input"
                                        label="Your Name" 
                                        value={username} 
                                        onChange={e => setUsername(e.target.value)}
                                        variant="outlined"
                                        fullWidth
                                        className="username-input"
                                        placeholder="Enter your name"
                                        onKeyPress={(e) => {
                                            if (e.key === 'Enter' && username.trim()) {
                                                connect();
                                            }
                                        }}
                                    />
                            </div>

                                <div className="lobby-controls">
                                    <div className="control-item">
                                        <span className="control-label">Camera</span>
                                        <IconButton 
                                            onClick={handleLobbyVideo}
                                            className={`control-button ${lobbyVideo ? 'active' : 'inactive'}`}
                                        >
                                            {lobbyVideo ? <VideocamIcon /> : <VideocamOffIcon />}
                                        </IconButton>
                            </div>

                                    <div className="control-item">
                                        <span className="control-label">Microphone</span>
                                        <IconButton 
                                            onClick={handleLobbyAudio}
                                            className={`control-button ${lobbyAudio ? 'active' : 'inactive'}`}
                                        >
                                            {lobbyAudio ? <MicIcon /> : <MicOffIcon />}
                                        </IconButton>
                                    </div>
                                </div>

                                <Button 
                                    variant="contained" 
                                    onClick={connect}
                                    disabled={!username.trim()}
                                    className="join-button"
                                    fullWidth
                                >
                                    Join Meeting
                                </Button>
                        </div>

                            <div className="lobby-preview">
                                <div className="preview-header">
                                    <h3>Meeting Preview</h3>
                                </div>
                                <div className="video-preview-container">
                                    <video 
                                        ref={localVideoref} 
                                        autoPlay 
                                        muted
                                        className="preview-video"
                                    ></video>
                                    <div className="preview-overlay">
                                        <div className="preview-info">
                                            {lobbyVideo ? (
                                                <>
                                                    <VideocamIcon className="preview-icon" />
                                                    <span>Camera Preview</span>
                                                </>
                                            ) : (
                                                <>
                                                    <VideocamOffIcon className="preview-icon" />
                                                    <span>Camera Disabled</span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div> :


                <div className="video-call-container">
                    {/* Header */}
                    <div className="call-header">
                        <div className="call-info">
                            <div className="call-icon">
                                <VideocamIcon />
                            </div>
                            <div className="call-details">
                                <h2 className="call-title">Video Meeting</h2>
                                <p className="call-subtitle">
                                    {connectionStatus === 'connected' && `Connected • ${videos.length + 1} participants`}
                                    {connectionStatus === 'connecting' && 'Connecting...'}
                                    {connectionStatus === 'reconnecting' && 'Reconnecting...'}
                                    {connectionStatus === 'error' && 'Connection Error'}
                                    {connectionStatus === 'disconnected' && 'Disconnected'}
                                </p>
                                {connectionStatus !== 'connected' && (
                                    <div className={`connection-status ${connectionStatus}`}>
                                        <div className="status-dot"></div>
                                        <span className="status-text">
                                            {connectionStatus === 'connecting' && 'Connecting...'}
                                            {connectionStatus === 'reconnecting' && 'Reconnecting...'}
                                            {connectionStatus === 'error' && 'Connection Error'}
                                            {connectionStatus === 'disconnected' && 'Disconnected'}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                        
                        <div className="call-actions">
                            <Button 
                                variant="outlined" 
                                onClick={handleEndCall}
                                className="end-call-btn"
                                startIcon={<CallEndIcon />}
                            >
                                End Call
                            </Button>
                        </div>
                    </div>

                    {/* Main Video Area */}
                    <div className="video-main-area">
                        {/* Remote Videos Grid */}
                        {VideoGrid}
                    </div>

                    {/* Floating Local Video */}
                    {LocalVideo}

                    {/* Control Bar */}
                    <div className="control-bar">
                        <div className="control-group">
                            <IconButton 
                                onClick={handleVideo} 
                                className={`control-btn ${video ? 'active' : 'inactive'}`}
                                title={video ? 'Turn off camera' : 'Turn on camera'}
                            >
                                {video ? <VideocamIcon /> : <VideocamOffIcon />}
                            </IconButton>
                            
                            <IconButton 
                                onClick={handleAudio} 
                                className={`control-btn ${audio ? 'active' : 'inactive'}`}
                                title={audio ? 'Mute microphone' : 'Unmute microphone'}
                            >
                                {audio ? <MicIcon /> : <MicOffIcon />}
                            </IconButton>

                            {screenAvailable && (
                                <IconButton 
                                    onClick={handleScreen} 
                                    className={`control-btn ${screen ? 'active' : 'inactive'}`}
                                    title={screen ? 'Stop sharing' : 'Share screen'}
                                >
                                    {screen ? <StopScreenShareIcon /> : <ScreenShareIcon />}
                                </IconButton>
                            )}
                            </div>

                        <div className="control-group">
                            <Badge badgeContent={newMessages} max={99} color="error">
                                <IconButton 
                                    onClick={() => setModal(!showModal)} 
                                    className="control-btn chat-btn"
                                    title="Chat"
                                >
                                    <ChatIcon />
                                </IconButton>
                            </Badge>
                        </div>
                    </div>

                    {/* Chat Modal */}
                    {ChatModal}
                </div>

            }

        </div>
    )
}
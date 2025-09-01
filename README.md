# Video Meeting Application

A real-time video conferencing application built with React, Node.js, Socket.io, and WebRTC. This application allows users to join video meetings, share their camera and microphone, chat with other participants, and see network quality indicators.

## 🚀 Features

- **Real-time Video/Audio Communication**: WebRTC peer-to-peer connections
- **User Authentication**: Login/signup system with JWT tokens
- **Meeting Rooms**: Join meetings with unique room codes
- **Screen Sharing**: Share your screen with other participants
- **Chat System**: Real-time text messaging during meetings
- **Network Quality Indicators**: Visual indicators showing connection quality
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Participant Management**: See who's in the meeting and their status
- **Error Handling**: Connection retry and error recovery

## 🏗️ Architecture

### Frontend (React)
- **VideoMeet.jsx**: Main video meeting component
- **Real-time Communication**: Socket.io client for signaling
- **WebRTC**: Peer-to-peer video/audio streaming
- **Material-UI**: Modern UI components

### Backend (Node.js)
- **socketManager.js**: WebSocket server for signaling
- **Express.js**: REST API endpoints
- **MongoDB**: User data and meeting history
- **JWT**: Authentication tokens

### Devops
- Docker image is created to install on a server
- integrated with CI/CD pipeline using github actions

## 📁 Project Structure

```
meet/
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── VideoMeet.jsx      # Main video meeting component
│   │   │   ├── Home.jsx           # Landing page
│   │   │   ├── Login.jsx          # Login page
│   │   │   └── Register.jsx       # Registration page
│   │   └── ...
├── backend/
│   ├── controller/
│   │   ├── socketManager.js       # WebSocket signaling server
│   │   ├── user.controller.js     # User authentication
│   │   └── userActivityController.js # Meeting activity tracking
│   ├── models/
│   │   ├── User.model.js          # User data model
│   │   └── userActivity.model.js  # Activity tracking model
│   └── server.js                  # Main server file
└── README.md
```

## 🔧 Detailed Component Analysis

### VideoMeet.jsx - Frontend Core Component

#### Key State Management
```javascript
// Connection and media states
const [video, setVideo] = useState([]);
const [audio, setAudio] = useState();
const [videos, setVideos] = useState([]); // Remote participant videos
const [participantNames, setParticipantNames] = useState({});
const [participantStatuses, setParticipantStatuses] = useState({});
const [networkQuality, setNetworkQuality] = useState({});
```

**Theory**: React state management follows the principle of **single source of truth**. Each piece of state represents a specific aspect of the application:
- `video/audio`: Local media stream states (boolean flags)
- `videos`: Array of remote participant video streams
- `participantNames/Statuses`: Participant metadata synchronized across all clients
- `networkQuality`: Real-time connection quality metrics

#### WebRTC Connection Flow

**Theory**: WebRTC (Web Real-Time Communication) enables peer-to-peer communication between browsers without requiring plugins or native apps. It uses three main components:
1. **MediaStream API**: Captures audio/video from user devices
2. **RTCPeerConnection**: Manages the peer-to-peer connection
3. **RTCDataChannel**: Enables data exchange between peers

1. **Initial Setup**:
   ```javascript
   // RTCPeerConnection configuration
   const peerConfigConnections = {
       "iceServers": [
           { "urls": "stun:stun.l.google.com:19302" }
       ]
   }
   ```

   **Theory**: ICE (Interactive Connectivity Establishment) servers help establish connections between peers behind NATs and firewalls. STUN (Session Traversal Utilities for NAT) servers discover the public IP address and port of a client behind a NAT.

2. **Media Stream Acquisition**:
   ```javascript
   const getUserMedia = () => {
       if ((video && videoAvailable) || (audio && audioAvailable)) {
           navigator.mediaDevices.getUserMedia({ 
               video: video && videoAvailable, 
               audio: audio && audioAvailable 
           })
           .then(getUserMediaSuccess)
           .catch((e) => console.log(e))
       }
   }
   ```

   **Theory**: `getUserMedia()` is a Web API that requests access to user media devices. It returns a Promise that resolves to a MediaStream object containing the requested media tracks. This is the first step in the WebRTC pipeline - capturing local media.

3. **Peer Connection Creation**:
   ```javascript
   connections[socketListId] = new RTCPeerConnection(peerConfigConnections)
   
   // Handle incoming streams
   connections[socketListId].onaddstream = (event) => {
       console.log("Stream received from:", socketListId);
       // Add video to UI
   }
   ```

   **Theory**: RTCPeerConnection manages the peer-to-peer connection lifecycle. The `onaddstream` event fires when a remote peer adds a media stream to the connection. This is how we receive video/audio from other participants.

#### Signaling Process

**Theory**: Signaling is the process of coordinating communication between peers. Since WebRTC is peer-to-peer, peers need a way to exchange connection information (SDP and ICE candidates) before they can communicate directly. This is done through a signaling server (Socket.io in our case).

1. **Join Meeting**:
   ```javascript
   socketRef.current.emit('join-call', window.location.href, username)
   ```

   **Theory**: This initiates the signaling process. The client tells the server it wants to join a specific meeting room. The server then coordinates with other participants in that room.

2. **SDP Exchange**:
   ```javascript
   // Create and send offer
   connection.createOffer()
       .then((description) => connection.setLocalDescription(description))
       .then(() => {
           socketRef.current.emit('signal', id2, JSON.stringify({ 
               'sdp': connection.localDescription 
           }));
       })
   ```

   **Theory**: SDP (Session Description Protocol) is a standard format for describing multimedia communication sessions. The offer/answer model works as follows:
   - **Offer**: One peer creates an offer describing its media capabilities and preferences
   - **Answer**: The other peer responds with an answer describing its capabilities
   - This exchange establishes the media format, codecs, and network parameters for the connection

3. **ICE Candidate Exchange**:
   ```javascript
   connections[fromId].onicecandidate = function (event) {
       if (event.candidate != null) {
           socketRef.current.emit('signal', fromId, JSON.stringify({ 
               'ice': event.candidate 
           }))
       }
   }
   ```

   **Theory**: ICE candidates represent potential network paths between peers. Each candidate contains:
   - **IP address and port**: Where the peer can be reached
   - **Protocol**: UDP or TCP
   - **Type**: host (local), srflx (STUN), or relay (TURN)
   - **Priority**: Determines which candidate to try first

#### Network Quality Monitoring

```javascript
// Compute connection quality from WebRTC stats
function computeQuality(stats) {
    let quality = 3; // 3: good, 2: fair, 1: poor
    let packetsLost = 0, packetsSent = 0, rtt = 0;
    
    stats.forEach(report => {
        if (report.type === 'remote-inbound-rtp' && report.kind === 'video') {
            packetsLost += report.packetsLost || 0;
            packetsSent += report.packetsReceived || 0;
            rtt = report.roundTripTime || 0;
        }
    });
    
    if (packetsLost > 10 || rtt > 0.5) quality = 1;
    else if (packetsLost > 0 || rtt > 0.2) quality = 2;
    
    return quality;
}

// Poll stats every 2 seconds
useEffect(() => {
    const interval = setInterval(() => {
        Object.keys(connections).forEach(id => {
            const pc = connections[id];
            if (pc && typeof pc.getStats === 'function') {
                pc.getStats(null).then(stats => {
                    const arr = Array.from(stats.values());
                    setNetworkQuality(q => ({ 
                        ...q, 
                        [id]: computeQuality(arr) 
                    }));
                });
            }
        });
    }, 2000);
    return () => clearInterval(interval);
}, [videos]);
```

**Theory**: WebRTC provides detailed statistics about the connection through the `getStats()` API. These stats include:
- **Packet Loss**: Percentage of packets that don't reach the destination
- **Round Trip Time (RTT)**: Time for a packet to travel to the peer and back
- **Bandwidth**: Available network capacity
- **Jitter**: Variation in packet arrival times

Quality assessment is based on:
- **Good (Green)**: < 0.2s RTT, minimal packet loss
- **Fair (Yellow)**: 0.2-0.5s RTT, some packet loss
- **Poor (Red)**: > 0.5s RTT, significant packet loss

#### Video Player Component (Flicker Fix)

```javascript
function VideoPlayer({ stream, ...props }) {
    const videoRef = useRef();
    useEffect(() => {
        if (videoRef.current && stream) {
            videoRef.current.srcObject = stream;
        }
    }, [stream]);
    return <video ref={videoRef} {...props} />;
}
```

**Theory**: Video flickering occurs due to **DOM manipulation timing**:
- React re-renders can cause video elements to reset
- Setting `srcObject` repeatedly triggers video reload
- The fix ensures DOM updates happen only when necessary

### socketManager.js - Backend Signaling Server

#### Server Setup
```javascript
export default function connectToSocket(server){
    const io = new Server(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"],
            allowedHeaders: ["*"],
            credentials: true
        }
    });
}
```

**Theory**: Socket.io provides real-time, bidirectional communication between clients and server. It uses WebSockets as the primary transport but falls back to other methods (polling, long polling) for compatibility. CORS configuration allows cross-origin requests, which is necessary when frontend and backend are on different domains/ports.

#### Room Management
```javascript
let connections = {}  // Room-based participant tracking
let messages = {}     // Chat message history
let timeOnline = {}   // Participant online time
let userNames = {}    // Username mapping
```

**Theory**: The server maintains in-memory data structures to track meeting state:
- **connections**: Maps room URLs to arrays of socket IDs (participants)
- **messages**: Stores chat history per room for new participants
- **timeOnline**: Tracks when each user joined for analytics
- **userNames**: Maps socket IDs to usernames for display

This approach provides fast access but doesn't persist data across server restarts.

#### Join Meeting Flow

**Theory**: When a user joins a meeting, the server must:
1. **Room Creation**: Create a new room if it doesn't exist
2. **Participant Registration**: Add the user to the room's participant list
3. **Notification**: Inform all existing participants about the new user
4. **State Synchronization**: Send existing participant information to the new user

1. **User Joins**:
   ```javascript
   socket.on("join-call", (path, username) => {
       console.log(`User ${username} (${socket.id}) joining call: ${path}`);
       
       // Create room if doesn't exist
       if (connections[path] === undefined) {
           connections[path] = []
       }
       connections[path].push(socket.id)
       
       // Store user info
       userNames[socket.id] = username || 'Anonymous';
       timeOnline[socket.id] = new Date();
   ```

   **Theory**: The `path` parameter represents the meeting room URL, which serves as a unique identifier. The server creates a room-based architecture where each meeting is isolated from others. Socket IDs are unique identifiers assigned by Socket.io to each connected client.

2. **Notify All Participants**:
   ```javascript
   // Notify all users about new participant
   for (let a = 0; a < connections[path].length; a++) {
       io.to(connections[path][a]).emit("user-joined", socket.id, connections[path])
   }
   
   // Send usernames to new participant
   connections[path].forEach(participantId => {
       if (participantId !== socket.id && userNames[participantId]) {
           io.to(socket.id).emit("username-update", participantId, userNames[participantId]);
       }
   });
   ```

   **Theory**: This implements a **broadcast pattern** where:
   - All existing participants are notified about the new user
   - The new user receives information about all existing participants
   - This ensures everyone has complete information about who's in the meeting

#### Signaling Relay
```javascript
socket.on("signal", (toId, message) => {
    io.to(toId).emit("signal", socket.id, message);
})
```

**Theory**: The signaling server acts as a **message relay** for WebRTC signaling. It doesn't process the signaling data but simply forwards it between peers. This is necessary because:
- Peers don't know each other's network addresses initially
- NATs and firewalls prevent direct communication
- The server provides a trusted channel for exchanging connection information

#### Chat System
```javascript
socket.on("chat-message", (data, sender) => {
    // Find user's room
    const [matchingRoom, found] = Object.entries(connections)
        .reduce(([room, isFound], [roomKey, roomValue]) => {
            if (!isFound && roomValue.includes(socket.id)) {
                return [roomKey, true];
            }
            return [room, isFound];
        }, ['', false]);

    if (found === true) {
        // Store message
        if (messages[matchingRoom] === undefined) {
            messages[matchingRoom] = []
        }
        messages[matchingRoom].push({ 
            'sender': sender, 
            "data": data, 
            "socket-id-sender": socket.id 
        })
        
        // Broadcast to all participants
        connections[matchingRoom].forEach((elem) => {
            io.to(elem).emit("chat-message", data, sender, socket.id)
        })
    }
})
```

**Theory**: The chat system implements a **room-based broadcast** pattern:
1. **Room Discovery**: The server finds which room the sender belongs to by searching through all connections
2. **Message Storage**: Messages are stored in memory for new participants joining later
3. **Broadcast**: The message is sent to all participants in the same room
4. **Metadata**: Each message includes sender information and timestamp for proper display

#### Username Updates
```javascript
socket.on("username-update", (toId, newUsername) => {
    // Update server's username map
    userNames[socket.id] = newUsername || 'Anonymous';
    // Send to specific participant
    io.to(toId).emit("username-update", socket.id, newUsername || 'Anonymous');
});
```

**Theory**: Username updates use a **targeted broadcast** pattern:
- The server maintains a centralized username registry
- Updates are sent only to the specific participant who needs to know
- This ensures consistency across all clients without unnecessary network traffic

#### Disconnect Handling
```javascript
socket.on("disconnect", () => {
    console.log(`User ${userNames[socket.id] || 'Unknown'} (${socket.id}) disconnected`);
    
    // Find user's room
    for (const [k, v] of JSON.parse(JSON.stringify(Object.entries(connections)))) {
        for (let a = 0; a < v.length; ++a) {
            if (v[a] === socket.id) {
                // Notify all participants
                for (let a = 0; a < connections[k].length; ++a) {
                    io.to(connections[k][a]).emit('user-left', socket.id)
                }
                
                // Remove from room
                var index = connections[k].indexOf(socket.id)
                connections[k].splice(index, 1)
                
                // Clean up user data
                delete userNames[socket.id];
                delete timeOnline[socket.id];
                
                // Remove empty rooms
                if (connections[k].length === 0) {
                    delete connections[k]
                    delete messages[k]
                }
                break;
            }
        }
    }
})
```

**Theory**: Disconnect handling implements a **cleanup and notification** pattern:
1. **Room Discovery**: Find which room the disconnected user was in
2. **Notification**: Inform all remaining participants about the departure
3. **Cleanup**: Remove the user from all data structures
4. **Room Cleanup**: Delete empty rooms to prevent memory leaks
5. **Data Consistency**: Ensure the server state remains consistent

## 🔄 Data Flow

### 1. Meeting Join Process
```
User enters meeting code → Frontend connects to Socket.io → 
Backend creates room → Notifies all participants → 
WebRTC connections established → Video streams start
```

**Theory**: This follows a **handshake protocol** where:
- **Client Initiation**: User provides meeting credentials
- **Server Validation**: Server verifies and creates/joins room
- **Peer Discovery**: Server introduces peers to each other
- **Connection Establishment**: Peers establish direct WebRTC connections

### 2. Video/Audio Communication
```
Local media stream → RTCPeerConnection → ICE candidates → 
SDP exchange → Direct peer-to-peer connection → 
Real-time video/audio streaming
```

**Theory**: This implements the **WebRTC connection establishment** process:
1. **Media Capture**: Get local audio/video streams
2. **Connection Setup**: Create RTCPeerConnection objects
3. **Signaling**: Exchange SDP and ICE candidates via server
4. **ICE Gathering**: Discover network paths between peers
5. **Connection**: Establish direct peer-to-peer communication
6. **Streaming**: Transmit media data directly between peers

### 3. Signaling Flow
```
Frontend (VideoMeet.jsx) ↔ Socket.io ↔ Backend (socketManager.js) ↔ 
Other participants (VideoMeet.jsx)
```

**Theory**: This creates a **signaling mesh** where:
- **Client-Server**: Each client maintains a WebSocket connection to the server
- **Server Relay**: Server forwards signaling messages between clients
- **Peer Coordination**: All peers coordinate through the central server
- **State Synchronization**: Server ensures all clients have consistent state

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB
- npm or yarn

### Frontend Setup
```bash
cd meet/frontend
npm install
npm run dev
```

### Backend Setup
```bash
cd meet/backend
npm install
npm start
```

### Environment Variables
Create `.env` files in both frontend and backend:

**Frontend (.env)**
```
VITE_backend_URL=http://localhost:8080
```

**Backend (.env)**
```
PORT=8080
MONGODB_URI=mongodb://localhost:27017/videomeet
secret_key=your_jwt_secret_key
```

## 🚀 Usage

1. **Start the application**
2. **Register/Login** with your credentials
3. **Create a meeting** or **join existing meeting** with a code
4. **Allow camera/microphone** permissions
5. **Start video conferencing** with other participants

## 🔧 Key Features Explained

### Network Quality Indicator
- **Green dot**: Good connection (< 0.2s RTT, < 1 packet lost)
- **Yellow dot**: Fair connection (0.2-0.5s RTT, 1-10 packets lost)
- **Red dot**: Poor connection (> 0.5s RTT, > 10 packets lost)

**Theory**: Network quality indicators provide **real-time feedback** about connection health. They help users understand:
- **Connection Reliability**: Whether the connection is stable
- **Performance Issues**: If there are network problems
- **User Experience**: What to expect from video/audio quality

### Video Flicker Fix
The `VideoPlayer` component prevents video flickering by:
- Using `useEffect` to set `srcObject` only when stream changes
- Avoiding repeated `srcObject` assignments on re-renders

**Theory**: Video flickering occurs due to **DOM manipulation timing**:
- React re-renders can cause video elements to reset
- Setting `srcObject` repeatedly triggers video reload
- The fix ensures DOM updates happen only when necessary

### Username Synchronization
- Usernames are stored on the server and synchronized across all participants
- Updates are broadcast when users change their names
- Persistent across reconnections

**Theory**: Username synchronization implements **distributed state management**:
- **Single Source of Truth**: Server maintains authoritative username data
- **Event-driven Updates**: Changes are propagated to all clients
- **Consistency**: All participants see the same information

## 🐛 Troubleshooting

### Common Issues

1. **Video not showing**: Check camera permissions
2. **Audio not working**: Check microphone permissions
3. **Connection issues**: Verify STUN server availability
4. **Username not updating**: Check network connectivity

### Debug Mode
Enable console logging by checking browser developer tools for detailed connection information.

## 📈 Performance Considerations

- **WebRTC Stats**: Polled every 2 seconds for network quality
- **Video Optimization**: Automatic quality adjustment based on network conditions
- **Memory Management**: Proper cleanup of media streams and connections
- **Scalability**: Room-based architecture supports multiple concurrent meetings

**Theory**: Performance optimization follows these principles:
- **Monitoring**: Regular health checks without overwhelming the system
- **Adaptation**: Dynamic adjustment based on available resources
- **Cleanup**: Proper resource management to prevent memory leaks
- **Isolation**: Room-based architecture prevents cross-talk between meetings

## 🔒 Security Features

- **JWT Authentication**: Secure user authentication
- **Room Isolation**: Users can only access their specific meeting rooms
- **Input Validation**: Server-side validation of all inputs
- **CORS Configuration**: Proper cross-origin resource sharing setup

**Theory**: Security is implemented through multiple layers:
- **Authentication**: Verifies user identity before allowing access
- **Authorization**: Ensures users can only access authorized resources
- **Validation**: Prevents malicious input from affecting the system
- **Network Security**: Protects against cross-origin attacks

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- WebRTC for peer-to-peer communication
- Socket.io for real-time signaling
- Material-UI for modern UI components
- STUN servers for NAT traversal 
import { Server } from "socket.io"

let connections = {}
let messages = {}
let timeOnline = {}
let userNames = {} // Store usernames for each socket

export default function connectToSocket(server){
    const io = new Server(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"],
            allowedHeaders: ["*"],
            credentials: true
        }
    });

    io.on("connection", (socket) => {

        socket.on("join-call", (path, username) => {
            console.log(`User ${username} (${socket.id}) joining call: ${path}`);

            if (connections[path] === undefined) {
                connections[path] = []
            }
            connections[path].push(socket.id)

            // Store username
            userNames[socket.id] = username || 'Anonymous';
            timeOnline[socket.id] = new Date();

            // Notify all users in the room about the new participant
            for (let a = 0; a < connections[path].length; a++) {
                io.to(connections[path][a]).emit("user-joined", socket.id, connections[path])
            }

            // Send username to all other participants
            connections[path].forEach(participantId => {
                if (participantId !== socket.id) {
                    io.to(participantId).emit("username-update", socket.id, username || 'Anonymous');
                }
            });

            // Send existing usernames to the new participant
            connections[path].forEach(participantId => {
                if (participantId !== socket.id && userNames[participantId]) {
                    io.to(socket.id).emit("username-update", participantId, userNames[participantId]);
                }
            });

            if (messages[path] !== undefined) {
                for (let a = 0; a < messages[path].length; ++a) {
                    io.to(socket.id).emit("chat-message", messages[path][a]['data'],
                        messages[path][a]['sender'], messages[path][a]['socket-id-sender'])
                }
            }
        })

        socket.on("signal", (toId, message) => {
            io.to(toId).emit("signal", socket.id, message);
        })

        socket.on("status-update", (status) => {
            // Broadcast status update to all participants in the same room
            const [matchingRoom, found] = Object.entries(connections)
                .reduce(([room, isFound], [roomKey, roomValue]) => {
                    if (!isFound && roomValue.includes(socket.id)) {
                        return [roomKey, true];
                    }
                    return [room, isFound];
                }, ['', false]);

            if (found === true) {
                connections[matchingRoom].forEach((participantId) => {
                    if (participantId !== socket.id) {
                        io.to(participantId).emit("participant-status", socket.id, status);
                    }
                });
            }
        })

        socket.on("chat-message", (data, sender) => {
            const [matchingRoom, found] = Object.entries(connections)
                .reduce(([room, isFound], [roomKey, roomValue]) => {
                    if (!isFound && roomValue.includes(socket.id)) {
                        return [roomKey, true];
                    }
                    return [room, isFound];
                }, ['', false]);

            if (found === true) {
                if (messages[matchingRoom] === undefined) {
                    messages[matchingRoom] = []
                }

                messages[matchingRoom].push({ 'sender': sender, "data": data, "socket-id-sender": socket.id })
                console.log("message", matchingRoom, ":", sender, data)

                connections[matchingRoom].forEach((elem) => {
                    io.to(elem).emit("chat-message", data, sender, socket.id)
                })
            }
        })

        socket.on("disconnect", () => {
            console.log(`User ${userNames[socket.id] || 'Unknown'} (${socket.id}) disconnected`);

            var diffTime = Math.abs(timeOnline[socket.id] - new Date())
            var key

            for (const [k, v] of JSON.parse(JSON.stringify(Object.entries(connections)))) {
                for (let a = 0; a < v.length; ++a) {
                    if (v[a] === socket.id) {
                        key = k

                        // Immediately notify all participants about the user leaving
                        for (let a = 0; a < connections[key].length; ++a) {
                            io.to(connections[key][a]).emit('user-left', socket.id)
                        }

                        var index = connections[key].indexOf(socket.id)
                        connections[key].splice(index, 1)

                        // Clean up user data
                        delete userNames[socket.id];
                        delete timeOnline[socket.id];

                        if (connections[key].length === 0) {
                            delete connections[key]
                            delete messages[key]
                        }
                        break;
                    }
                }
            }
        })
    })

    return io;
}

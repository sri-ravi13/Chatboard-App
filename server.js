
const express = require('express');
const http = require('http');
const { Server } = require("socket.io");
const cors = require('cors');


const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",    methods: ["GET", "POST"]
  }
});

const PORT = 3001;

let users = [];
let conversations = {};
let whiteboardElements = [];
let whiteboardTextBoxes = [];

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);  socket.emit('initial-data', { users, conversations, whiteboardElements, whiteboardTextBoxes });  socket.on('login', (user) => {
    const existingUser = users.find(u => u.id === user.id);
    if (existingUser) {
        existingUser.status = 'online';
        existingUser.socketId = socket.id;
    } else {
        users.push({ ...user, socketId: socket.id, status: 'online' });
    }
    io.emit('users-update', users);
  });

  socket.on('send-message', (message) => {
    const chatKey = [message.senderId, message.receiverId].sort().join('-');
    if (!conversations[chatKey]) {
      conversations[chatKey] = [];
    }
    conversations[chatKey].push(message);    const receiver = users.find(u => u.id === message.receiverId);
    if (receiver && receiver.socketId) {
      io.to(receiver.socketId).emit('message-received', message);
    }
  });

  socket.on('mark-as-read', ({ userId, readerId }) => {
    const chatKey = [userId, readerId].sort().join('-');
    if (conversations[chatKey]) {
        conversations[chatKey].forEach(msg => {
            if (msg.receiverId === readerId) msg.read = true;
        });
    }
    const readerSocket = users.find(u => u.id === readerId)?.socketId;
    if(readerSocket) {
        io.to(readerSocket).emit('read-receipt-update', { chatKey, messages: conversations[chatKey] });
    }
  });
  socket.on('draw-stroke', (data) => {
    whiteboardElements = data.elements;
    socket.broadcast.emit('whiteboard-update-elements', whiteboardElements);
  });
  
  socket.on('add-shape', (data) => {
    whiteboardElements = data.elements;
    socket.broadcast.emit('whiteboard-update-elements', whiteboardElements);
  });
  
  socket.on('update-textbox', (data) => {
    whiteboardTextBoxes = data.textBoxes;
    socket.broadcast.emit('whiteboard-update-textboxes', whiteboardTextBoxes);
  });
  
  socket.on('clear-canvas', () => {
    whiteboardElements = [];
    whiteboardTextBoxes = [];
    io.emit('whiteboard-cleared');  });  
    socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
    const user = users.find(u => u.socketId === socket.id);
    if (user) {
      user.status = 'offline';
      user.lastSeen = new Date().toISOString();
    }
    io.emit('users-update', users);
  });
});

server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
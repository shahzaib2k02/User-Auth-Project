const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const socketio = require('socket.io');
require('dotenv').config();
const cors = require('cors'); // Import CORS middleware

const authRoutes = require('./routes/authRoutes');
const messageRoutes = require('./routes/messageRoutes');
const Message = require('./models/Message');
const User = require('./models/User');

const app = express();
const PORT = process.env.PORT || 3001;
const HOST = '127.16.70.106';

app.use(cors()); // Enable CORS for all routes
app.use(express.json());

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('Connected to MongoDB');
  const server = app.listen(PORT, HOST, () => { // Specify HOST along with PORT
    console.log(`Server is running on http://${HOST}:${PORT}`);
  });

  const io = socketio(server);

  io.use((socket, next) => {
    const token = socket.handshake.query.token;
    if (!token) {
      return next(new Error('Authentication error: Token not provided'));
    }
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        return next(new Error('Authentication error: Invalid token'));
      }
      socket.user = decoded;
      next();
    });
  });

  io.on('connection', (socket) => {
    console.log('User connected:', socket.user.username);

    socket.on('message', async (data) => { // Changed 'socket.io' to 'socket.on'
      try {
        const newMessage = new Message({
          sender: socket.user._id,
          recipient: data.recipient,
          content: data.content
        });
        await newMessage.save();
        io.to(data.recipient).emit('message', newMessage);
      } catch (error) {
        console.error('Error sending message:', error);
      }
    });

    socket.on('disconnect', () => {
      console.log('User disconnected', socket.user.username);
    });
  });

  app.use('/api/auth', authRoutes);
  app.use('/api/messages', messageRoutes);

}).catch((err) => {
  console.error('Error connecting to MongoDB:', err);
});

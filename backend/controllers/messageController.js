// controllers/messageController.js

const Message = require('../models/Message');

exports.sendMessage = async (req, res) => {
  const { recipient, content } = req.body;
  const sender = req.user.username; // Use sender's username
  try {
    const newMessage = new Message({ sender, recipient, content });
    await newMessage.save();
    res.status(201).json({ message: 'Message sent successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error sending message' });
  }
};

exports.getMessages = async (req, res) => {
  const username = req.user.username;
  try {
    const messages = await Message.find({ recipient: username });
    res.status(200).json(messages);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error retrieving messages' });
  }
};

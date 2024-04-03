const express = require('express');
const path = require('path');

const userRoutes = require('./routes/userRoutes');
const plantRoutes = require('./routes/plantRoutes');
const tagsRoutes = require('./routes/tagsRoutes');
const gardenRoutes = require('./routes/gardenRoutes');
const botanistRoutes = require('./routes/botanistRoutes');
const messageRoutes = require('./routes/messageRoutes');
const authMiddleware = require("./middleware/authMiddleware");
var app = express();


app.use(express.json());
app.use(authMiddleware);
app.use('/api/users', userRoutes);
app.use('/api/plants', plantRoutes);
app.use('/api/tags', tagsRoutes);
app.use('/api/gardens', gardenRoutes);
app.use('/api/botanists', botanistRoutes);
app.use('/api/messages', messageRoutes);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

module.exports = app;
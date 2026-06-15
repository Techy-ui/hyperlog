const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const authRoutes = require('./routes/authRoutes');
const postRoutes = require('./routes/postRoutes'); // 1. Import post routes
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Database Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('🚀 HyperLog Database connected seamlessly!'))
    .catch((err) => console.error('❌ Database connection failure:', err));

// Routes Configuration
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes); // 2. Link post routes

// Base Test Route
app.get('/', (req, res) => {
    res.send('HyperLog API is alive and kicking!');
});

// Start the server
app.listen(PORT, () => {
    console.log(`⚡ Server roaring to life on port ${PORT}`);
});
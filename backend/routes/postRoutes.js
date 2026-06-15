const express = require('express');
const router = express.Router();
const { createPost, getAllPosts, getPostById, clapPost } = require('../controllers/postController');
const { protect } = require('../middleware/authMiddleware'); // Import our secure bouncer

// Public Routes (Anyone can view or clap)
router.get('/', getAllPosts);
router.get('/:id', getPostById);
router.put('/:id/clap', clapPost);

// Protected Routes (Must be logged in to create a post)
router.post('/', protect, createPost);

module.exports = router;
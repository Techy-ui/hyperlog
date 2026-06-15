const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    content: {
        type: String, // This will store our Markdown text
        required: true
    },
    coverImage: {
        type: String, // URL of a sleek uploaded banner image
        default: ""
    },
    tags: {
        type: [String], // Array for tech tags like ['web3', 'react', 'nextjs']
        default: []
    },
    claps: {
        type: Number,
        default: 0
    },
    readingTime: {
        type: String, // Dynamic reading estimation string (e.g., "4 min read")
        default: "1 min read"
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Binds this post directly to a registered author account
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Post', PostSchema);
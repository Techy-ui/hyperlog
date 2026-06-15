const Post = require('../models/Post');

// 1. CREATE A NEW BLOG POST
exports.createPost = async (req, res) => {
    try {
        const { title, content, tags, coverImage } = req.body;

        // Dynamic Reading Time Calculation Engine (Thrilling Upgrade!)
        const wordsPerMinute = 200; // Average reading speed
        const wordCount = content.split(/\s+/).length;
        const calcMinutes = Math.ceil(wordCount / wordsPerMinute);
        const readingTime = `${calcMinutes} min read`;

        // Save post linked to the authorized author (provided by our bouncer)
        const newPost = new Post({
            title,
            content,
            tags,
            coverImage,
            readingTime,
            author: req.user.id // Captured securely from the JWT token
        });

        const savedPost = await newPost.save();
        res.status(201).json(savedPost);
    } catch (error) {
        res.status(500).json({ message: 'Failed to create post', error: error.message });
    }
};

// 2. GET ALL POSTS (With Author details populated)
exports.getAllPosts = async (req, res) => {
    try {
        // Fetch posts and swap the author ID for the actual author's username and email
        const posts = await Post.find().populate('author', 'username email').sort({ createdAt: -1 });
        res.status(200).json(posts);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch posts', error: error.message });
    }
};

// 3. GET A SINGLE POST BY ID
exports.getPostById = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id).populate('author', 'username email');
        if (!post) return res.status(404).json({ message: 'Post not found' });
        res.status(200).json(post);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving post', error: error.message });
    }
};

// 4. INTERACTIVE CLAP FEATURE (Dynamic Upgrade!)
exports.clapPost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ message: 'Post not found' });

        post.claps += 1;
        await post.save();

        res.status(200).json({ message: 'Clapped!', claps: post.claps });
    } catch (error) {
        res.status(500).json({ message: 'Clap failed', error: error.message });
    }
};
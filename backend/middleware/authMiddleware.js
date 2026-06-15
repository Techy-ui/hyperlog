const jwt = require('jsonwebtoken');

const protect = (req, res, next) => {
    let token;

    // Check if the request contains a token in the headers
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Extract the token from the "Bearer <TOKEN>" string
            token = req.headers.authorization.split(' ')[1];

            // Verify the token using our secret key from the .env file
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Attach the decoded user data (id and username) directly to the request object
            req.user = decoded;

            // Move on to the actual route logic (the controller)
            next();
        } catch (error) {
            return res.status(401).json({ message: 'Not authorized, token validation failed' });
        }
    }

    // If no token exists at all
    if (!token) {
        return res.status(401).json({ message: 'Not authorized, no token found' });
    }
};

module.exports = { protect };
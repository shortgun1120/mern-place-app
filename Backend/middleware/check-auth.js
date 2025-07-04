const HttpError = require('../models/http-error');
const jwt = require('jsonwebtoken');
module.exports = (req, res, next) => {

    if (req.method === 'OPTIONS') {
        return next(); // If it's an OPTIONS request, just call next
    }

    try {
        const token = req.headers.authorization.split(' ')[1]; // Get the token from the Authorization header
        if (!token) {
            throw new Error('Authentication failed, token missing.');
        }

        const decodedToken = jwt.verify(token, process.env.JWT_KEY); // Verify the token using the secret key
        req.userData = { userId: decodedToken.userId }; // Attach user data to the request object
        next(); // Call the next middleware or route handler
        
    } catch {
        const error = new HttpError('Authentication failed, token missing.', 403);
        return next(error);
    }
}
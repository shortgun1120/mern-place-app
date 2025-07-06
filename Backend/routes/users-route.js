const express = require('express');

const { check } = require('express-validator');

const usersController = require('../controllers/users-controller');
const fileUpload = require('../middleware/file-upload');

const router = express.Router();

router.get('/', usersController.getUsers);

router.post(
    '/signup',
    fileUpload.single('image'), // Middleware to handle file upload
    [
        check('name')
            .not()
            .isEmpty(),
        check('email')
            .normalizeEmail()
            .isEmail(),
        check('password')
            .isLength({ min: 6 })
    ], 
    usersController.signup
);

router.post('/login', usersController.login);

module.exports = router;
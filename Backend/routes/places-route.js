const express = require('express');
const { check } = require('express-validator');

const router = express.Router();

const placesController = require('../controllers/places-controller');
const fileUpload = require('../middleware/file-upload');
const checkAuth = require('../middleware/check-auth');

router.get('/:pid' ,placesController.getPlaceById);

router.get('/user/:uid', placesController.getPlacesByUserId);

router.use(checkAuth); // Protect all routes below this middleware

router.post(
    '/',
    fileUpload.single('image'), // Middleware to handle file upload
    [
        check('title')
            .not()
            .isEmpty(),
        check('description').isLength({ min: 5 }),
        check('address')
            .not()
            .isEmpty(),
    ],
    placesController.createPlace
);

router.patch(
    '/:pid',
    [
        check('title')
            .not()
            .isEmpty(),
        check('description').isLength({ min: 5 })
    ],
     placesController.updatePlace
);

router.delete('/:pid', placesController.deletePlace);

module.exports = router; 
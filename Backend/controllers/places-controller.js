const fs = require('fs');
const HttpError = require('../models/http-error');
const mongoose = require('mongoose');
const { validationResult } = require('express-validator');
const getCoordsForAddress = require('../util/location');
const Place = require('../models/place');
const User = require('../models/user');

const getPlaceById = async (req, res, next) => {
    const placeId = req.params.pid;

    let place;
    try {
        place = await Place.findById(placeId);
    } catch (err) {
        const error = new HttpError(
            'Something went wrong, could not find a place.', 500
        );
        return next(error);
    }
    
    if (!place) {
        const error = new HttpError(
            'Could not find a place for the provided id.', 
            404
        );
        return next(error);
    }

    res.json({ place: place.toObject({ getters: true }) }); // Convert Mongoose document to plain object
};


const getPlacesByUserId = async (req, res, next) => {
    const userId = req.params.uid;
    
    //let places;
    let userWithPlaces;
    try {
        userWithPlaces = await User.findById(userId).populate('places');
    } catch (err) {
        const error = new HttpError(
            'Fetching places failed, please try again later.', 
            500
        );
        return next(error);
    }

    if (!userWithPlaces || userWithPlaces.length === 0) {
        return next(
            new HttpError('Could not find places for the provided user id.', 404)
        );
    }

    res.json({
        places: userWithPlaces.places.map(place => place.toObject({ getters: true }))
    });
};

const createPlace = async (req, res, next) => { 
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        next( new HttpError('Invalid inputs passed, please check your data.', 422));
    }
    const { title, description, address } = req.body;


    // try {
    //     const coordinates = await getCoordsForAddress(address);
    // } catch (err) {
    //     return next(err);
    // }
    // const coordinates = { lat: 40.748817, lng: -73.985428 }; // Mocked coordinates for testing

    const coordinates = await getCoordsForAddress(address);

    const createdPlace = new Place({
        title,
        description,
        address,
        location: coordinates,
        image: req.file.path, // Assuming the image is uploaded and available in req.file
        creator: req.userData.userId // Assuming user ID is stored in req.userData
    });

    let user;
    try {
        user = await User.findById(req.userData.userId);
    } catch (err) {
        const error = new HttpError(
            'Could not find user for provided id.', 404
        );
        return next(error);
    }

    if (!user) {
        const error = new HttpError(
            'Could not find user for provided id.', 404
        );
        return next(error);
    }

    try {
        const session = await mongoose.startSession();
        session.startTransaction();
        await createdPlace.save({ session });
        user.places.push(createdPlace);
        await user.save({ session });
        await session.commitTransaction();
    } catch (err) {
        const error = new HttpError(
            'Creating place failed, please try again.',
            500
        );
        return next(error);
    }

    res.status(201).json({ place: createdPlace });
};

const updatePlace = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        throw new HttpError('Invalid inputs passed, please check your data.', 422);
    }
    const { title, description } = req.body;
    const placeId = req.params.pid;

    let place;
    try {
        place = await Place.findById(placeId);
    } catch (err) {
        const error = new HttpError(
            'Something went wrong, could not update place.', 500
        );
        return next(error);
    }

    if(place.creator.toString() !== req.userData.userId) {
        const error = new HttpError(
            'You are not allowed to edit this place.', 401
        );
        return next(error);
    }

    place.title = title;
    place.description = description;

    try {
        await place.save();
    } catch (err) {
        const error = new HttpError(
            'Something went wrong, could not update place.', 500
        );
        return next(error);
    }

    res.status(200).json(
        {
            place: place.toObject(
                {
                    getters: true
                }
            )
        });
};

const deletePlace = async (req, res, next) => {
    const placeId = req.params.pid;

    let place;
    try {
        place = await Place
            .findById(placeId)
            .populate('creator');

        if (!place) {
            return next(
                new HttpError('Could not find a place for this id.', 404)
            );
        }
    } catch (err) {
        const error = new HttpError(
            'Something went wrong, could not delete place.', 500
        );
        return next(error);
    }

    if (place.creator.id !== req.userData.userId) {
        const error = new HttpError(
            'You are not allowed to delete this place.', 401
        );
        return next(error);
    }

    const imagePath = place.image;

    try {
        const sess = await mongoose.startSession();
        sess.startTransaction();
        await place.deleteOne({ session: sess });
        place.creator.places.pull(place);
        await place.creator.save({ session: sess });
        await sess.commitTransaction();
    } catch (err) {
        const error = new HttpError(
            'Something went wrong, could not delete place.', 500
        );
        return next(error);
    }

    fs.unlink(imagePath, err => {
        if (err) {
            return next(
                new HttpError('Could not delete image.', 500)
            );
        }
    });

    res.status(200).json({ message: 'Deleted place.' });
};

exports.getPlaceById = getPlaceById;
exports.getPlacesByUserId = getPlacesByUserId;
exports.createPlace = createPlace;
exports.updatePlace = updatePlace;
exports.deletePlace = deletePlace;
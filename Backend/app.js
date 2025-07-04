const fs = require('fs');
const path = require('path');
require('dotenv').config(); // Load environment variables from .env file

const express = require('express');
const bodyParser = require('body-parser');  
const HttpError = require('./models/http-error');
const mongoose = require('mongoose');

const placesRoutes = require('./routes/places-route');
const usersRoutes = require('./routes/users-route');

const app = express();

app.use(bodyParser.json()); // for parsing application/json

app.use('/uploads/images', express.static(path.join('uploads', 'images'))); // Serve static files from the uploads/images directory

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*'); // Allow requests from any origin
    res.setHeader(
        'Access-Control-Allow-Headers', 
        'Origin, X-Requested-With, Content-Type, Accept, Authorization'
    ); // Allow specific headers
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE'); // Allow specific HTTP methods
    
    next();
});

app.use('/api/places',placesRoutes);

app.use('/api/users', usersRoutes);

app.use((req, res, next) => {
    const error = new HttpError('Could not find this route.', 404);
    throw error;
});

app.use((error, req, res, next) => {
    if(req.file) {
        fs.unlink(req.file.path, err => {
            console.log(err);
        });
    }
    if (res.headerSent) {
        return next(error);
    }
    res.status(error.code || 500);
    res.json({ message: error.message || 'An unknown error occurred!' });
});

const url = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.7ebk2af.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
mongoose
    .connect(url)
    .then(() => {
        app.listen(2000);
    })
    .catch(err => {
        console.log('Connection failed!');
    });

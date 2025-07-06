//const axios = require('axios');

const HttpError = require('../models/http-error');
//const API_KEY = process.env.GOOGLE_API_KEY; // Ensure you have set this in your .env file

async function getCoordsForAddress(address) {

    // const response = await axios.get(
    //     `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${API_KEY}`
    // );

    // const data = response.data;

    // if (!data || data.status === 'ZERO_RESULTS') {
    //     const error = new HttpError('Could not find location for the specified address.', 422);
    //     throw error;
    // }

    // console.log(data);
    // //const coordinates = data.results[0].location;
    const coordinates = {
        lat: 40.748817,
        lng: -73.985429
    };

    return coordinates;
  
}

module.exports = getCoordsForAddress;
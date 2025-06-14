const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const coordinatesSchema = new mongoose.Schema({
    latitude: {
        type: Number,
        required: true, // исправил require на required
    },
    longitude: {
        type: Number,
        required: true, // исправил require на required
    }
});

const HavasSchema = new Schema({
    address: {
        type: String,
        required: true, // исправил require на required
    },
    city: {
        type: String,
        required: true, // исправил require на required
    },
    coordinates: coordinatesSchema, // указываем одиночный объект, а не массив
});

module.exports = mongoose.model("Havas", HavasSchema);

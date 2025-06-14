const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const cardSchema = new Schema({
    name: {
        type: String,
        require: true,
    },
    description: {
        type: String,
        require: true,
    },
    conditions: {
        type: String,
    },
    expiration_date: {
        type: Number,
        require: true,
    },
    kilo_kal: {
        type: Number,
        require: true,
    },
    belki: {
        type: Number,
        require: true,
    },
    jiri: {
        type: Number,
        require: true,
    },
    uglevods: {
        type: Number,
        require: true,
    },
    massa: {
        type: Number,
        require: true,
    },
    tag: {
        type: String,
        require: true,
    },
    subTag: {
        type: String,
    },
    photo: {
        type: String,
    },
    price: {
        type: Number,
    },
    isStock: {
        type: Boolean,
        default: false
    },
    stockPercent: {
        type: Number,
        default: 0
    }
});

module.exports = mongoose.model("Card", cardSchema);
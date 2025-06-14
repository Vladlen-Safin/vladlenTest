const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const productGroupSchema = new Schema({
    groupname: {
        type: String,
        require: true,
        min: 3,
        max: 30,
        unique: true,
    }
});

module.exports = mongoose.model("ProductGroup", productGroupSchema);
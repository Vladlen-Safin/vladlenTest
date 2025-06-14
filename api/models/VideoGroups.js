const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const VideoGroupsSchema = new Schema({
    groupname: {
        type: String,
        require: true,
        unique: true,
    }
});

module.exports = mongoose.model("VideoGroups", VideoGroupsSchema);
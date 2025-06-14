const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const subProductGroup = new Schema({
    groupId: {
        type: mongoose.Schema.Types.ObjectId,
        require: true,
        ref: 'ProductGroup' // Ссылка на таблицу Product Group
    },
    subgroupname: {
        type: String,
        require: true,
        min: 3,
        max: 30,
        unique: true,
    }
});

module.exports = mongoose.model("SubProductGroup", subProductGroup);
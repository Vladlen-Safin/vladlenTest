const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Схема комментариев под роликом
const commentShema = new mongoose.Schema({
    userName: {
        type: String,
        required: true
    },
    text: {
        type: String,
        required: true
    },
    commentDate: {
        type: Date,
        default: Date.now
    }
});

const tagsSchema = new mongoose.Schema({
    _id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'VideoGroups', 
    },
    groupname: {
        type: String, // Добавляем название группы в сам объект
    }
});

const videoSchema = new Schema({
    title: {
        type: String,
    },
    videoUrl: {
        type: String,
    },
    likes: {
        type: Number,
    },
    disLike: {
        type: Number
    },
    description: {
        type: Object
    },
    tags: [tagsSchema],
    comments: [commentShema] // Массив комментариев
});

module.exports = mongoose.model("Video", videoSchema);
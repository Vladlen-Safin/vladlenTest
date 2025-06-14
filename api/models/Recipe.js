const mongoose = require('mongoose');

// Схема продкутов для рецептов 
const recipeItemSchema = new mongoose.Schema({
    cardId: { 
        type: mongoose.Schema.Types.ObjectId,
        require: true,
        ref: 'Card' // Ссылка на коллекцию Card (продукты)
    },
    name: { // Название 
        type: String,
        required: true,
    },
    quantity: { // Количество
        type: Number,
        required: true,
        min: 1,
        max: 100
    }
});

// Схема шагов для рецепта
const stepsRecipe = new mongoose.Schema({
    stepDescription: {
        type: String
    },
    stepImage: {
        type: String
    }
});

// Схема комментариев для рецепта
const recipeComments = new mongoose.Schema({
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
        default: Date.now()
    }
});

// Схема для тэгов видео
const tagsSchema = new mongoose.Schema({
    _id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'VideoGroups', 
    },
    groupname: {
        type: String, // Добавляем название группы в сам объект
    }
});

// Схема рецепта
const recipeShema = new mongoose.Schema({
    nameRecipe: { // Название рецепта
        type: String,
        required: true,
    },
    descriptionRecipe: { // Описание рецепта
        type: String,
        required: true
    },
    items: [recipeItemSchema], // Массив продкутов для рецепта
    steps: [stepsRecipe], // Массив шагов для рецептов
    comments: [recipeComments], // Массив комментариев
    tags: [tagsSchema], // Массив тэгов для видео
    photo: {
        type: String
    }
});

module.exports = mongoose.model('Recipe', recipeShema);


const mongoose = require('mongoose')

// Схема для отдельного продукта в корзине
const cartItemSchema = new mongoose.Schema({
    cardId: {
        type: mongoose.Schema.Types.ObjectId,
        require: true,
        ref: 'Card' // Ссылка на коллекцию продуктов (cards)
    },
    name: {
        type: String,
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 1,
        max: 100
    }
});

// Схема корзины
const cartSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users', // Ссылка на коллекцию пользователей (users)
        required: true
    },
    items: [cartItemSchema], // Массив товаров в корзине
    status: {
        type: String,
        enum: ['active', 'paid'],
        default: 'active'
    },
    paidAt: { // Добавляем поле с датой оплаты
        type: Date
    }
});

module.exports = mongoose.model('Cart', cartSchema);
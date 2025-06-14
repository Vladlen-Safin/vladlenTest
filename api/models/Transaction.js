const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const transactionSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true }, // ID пользователя
    cart: { type: Schema.Types.Mixed, required: true }, // Гибкое поле для хранения корзины
    amount: { type: Number, required: true }, // Сумма транзакции
    paymentType: { type: Number, required: true }, // 0 - Наличные, 1 - Карта
    cardId: { type: Schema.Types.ObjectId, ref: "User.paymentCard" }, // ID карты (если оплата картой)
    status: { 
        type: String, 
        enum: ["pending", "completed", "failed", "refunded"], 
        default: "pending" 
    }, // Статус транзакции
    createdAt: { type: Date, default: Date.now } // Дата создания
});

module.exports = mongoose.model("Transaction", transactionSchema);

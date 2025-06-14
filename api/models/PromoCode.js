const mongoose = require('mongoose');
const Schema = mongoose.Schema

// Схема промо-кодов
const promoCodeSchema = new Schema({
    code: { type: String, required: true}, // Сам код (BONUS-001)
    isUsed: { type: Boolean, default: false}, // Использован или нет
    expires_at: { type: Date}, // срок годности
})

module.exports = mongoose.model("PromoCode", promoCodeSchema);
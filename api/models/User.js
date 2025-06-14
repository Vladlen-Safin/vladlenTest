const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const paymentCardSchema = new Schema({
    cardFIO: { type: String, required: true },
    cardNUM: { type: String, required: true },
    cardMMY: { type: String, required: true }, // MM/YY в виде строки
    cardCVV: { type: String, required: true },
    cardCASH: {type: Number, required: true}
});

const userSchema = new Schema({
    username: { type: String, required: true, min: 3, max: 20, unique: true },
    email: { type: String, required: true, max: 50, unique: false },
    password: { type: String, min: 6 },
    phone: { type: String },
    fio: { type: String },
    isAdmin: { type: Boolean, default: false },
    googleId: { type: String, default: null },
    avatar: { type: String },
    paymentType: { type: Number }, // 0 - наличные, 1 - карта
    paymentCash: { type: Number },
    paymentCard: { type: [paymentCardSchema], default: [] }, // Явно указываем массив
    address: { type: Schema.Types.ObjectId, ref: "Havas"}, // ссылка на адреса
    loyalty: {
        points: {type: Number, default: 0}, // баллы пользователя
        cardNumber: {type: String, default: 'LOYAL-' + Date.now().toString().slice(-8)},
        acitvatedDt: {type: Date, default: Date.now()},
        level: { type: String, enum: ['Бронза', 'Серебро', 'Золото'], default: 'Бронза' },
    }
});

module.exports = mongoose.model("User", userSchema);

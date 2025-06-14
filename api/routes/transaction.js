const express = require("express");
const router = express.Router();
const Transaction = require("../models/Transaction");
const User = require("../models/User");
const CartProduct = require("../models/cartSchema");
const PromoCode = require("../models/PromoCode");

// // Проведение транзакции (оплата)
// router.post("/:id/transaction", async (req, res) => {
//     try {
//         const { amount, paymentType, cardId, cartId, loyaltyCode, isStockPay } = req.body;
//         const user = await User.findById(req.params.id);
//         const cart = await CartProduct.findById(cartId);

//         if (!user) {
//             return res.status(404).json({ message: "Пользователь не найден" });
//         }

//         if (!cart) {
//             return res.status(404).json({ message: "Корзина не найдена" });
//         }

//         if (cart.status === "paid") {
//             return res.status(400).json({ message: "Эта корзина уже оплачена" });
//         }

//         let isSuccess = false;

//         let finalAmount = amount; // Изначальная сумма, которую нужно заплатить
//         let loyaltyPoints = user.loyalty.points; // баллы лояльности накопленные пользователем

//         if (isStockPay && user.loyalty && user.loyalty.points > 0) {
//             const maxPossibleDiscount = user.loyalty.points; // Можем использовать баллы, но не больше, чем сумма
//             const discount = Math.min(maxPossibleDiscount, finalAmount); // Сколько можно вычесть

//             finalAmount -= discount; // Уменьшаем итоговую сумму

//             // Вычитаем баллы с карты лояльности
//             user.loyalty.points -= discount;
//             await user.save();
//         }

//         // Обработка оплаты с учётом оставшейся суммы
//         if (paymentType === 0) { // Оплата наличными
//             if (user.paymentCash >= finalAmount) {
//                 user.paymentCash -= finalAmount;
//                 isSuccess = true;
//             } else {
//                 return res.status(400).json({ message: "Недостаточно наличных средств" });
//             }
//         } else if (paymentType === 1) { // Оплата картой
//             const card = user.paymentCard.id(cardId);
//             if (!card) {
//                 return res.status(404).json({ message: "Карта не найдена" });
//             }
//             if (card.cardCASH >= finalAmount) {
//                 card.cardCASH -= finalAmount;
//                 isSuccess = true;
//             } else {
//                 return res.status(400).json({ message: "Недостаточно средств на карте" });
//             }
//         } else {
//             return res.status(400).json({ message: "Неверный тип оплаты" });
//         }

//         if (isSuccess) {
//             // Изменяем статус корзины на "paid"
//             cart.status = "paid";
//             await cart.save();

//             // Создание транзакции
//             const transaction = new Transaction({
//                 userId: user._id,
//                 cart: cart,
//                 amount: finalAmount, // Отправляем итоговую сумму
//                 paymentType,
//                 cardId: paymentType === 1 ? cardId : null,
//                 status: "completed"
//             });

//             await transaction.save();

//             // --- Работа с программой лояльности, если loyaltyCode передан ---
//             if (loyaltyCode && loyaltyCode.trim() !== '') {
//                 if (!user.loyalty) {
//                     user.loyalty = {
//                         points: 0,
//                         level: 'Бронза',
//                         cardNumber: 'LOYAL-' + Date.now().toString().slice(-8),
//                         activatedAt: new Date()
//                     };
//                 }

//                 let bonusPercent = 0.01; // по умолчанию Бронза
//                 const currentLevel = user.loyalty.level;

//                 if (currentLevel === 'Серебро') {
//                     bonusPercent = 0.03;
//                 } else if (currentLevel === 'Золото') {
//                     bonusPercent = 0.05;
//                 }

//                 const earnedPoints = Math.floor(amount * bonusPercent);
//                 user.loyalty.points += earnedPoints;

//                 // --- Повышение уровня ---
//                 if (user.loyalty.points >= 700000 && currentLevel !== 'Золото') {
//                     user.loyalty.level = 'Золото';
//                 } else if (user.loyalty.points >= 500000 && currentLevel === 'Бронза') {
//                     user.loyalty.level = 'Серебро';
//                 }

//                 await user.save();
//             }

//             return res.status(201).json({ message: "Оплата успешно проведена", transaction, cart });
//         } else {
//             return res.status(500).json({ message: "Ошибка при обработке транзакции" });
//         }
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: "Ошибка сервера", error });
//     }
// });

// Проведение транзакции (оплата)
router.post("/:id/transaction", async (req, res) => {
    try {
        const { amount, paymentType, cardId, cartId, loyaltyCode, isStockPay } = req.body;
        const user = await User.findById(req.params.id);
        const cart = await CartProduct.findById(cartId);

        if (!user) {
            return res.status(404).json({status: "warning", message: "Пользователь не найден" });
        }

        if (!cart) {
            return res.status(404).json({status: "warning", message: "Корзина не найдена" });
        }

        if (cart.status === "paid") {
            return res.status(400).json({status: "error", message: "Эта корзина уже оплачена" });
        }

        let isSuccess = false;

        let finalAmount = amount; // Изначальная сумма, которую нужно заплатить
        let loyaltyPoints = user.loyalty.points; // баллы лояльности накопленные пользователем

        if (isStockPay && user.loyalty && user.loyalty.points > 0) {
            const maxPossibleDiscount = user.loyalty.points; // Можем использовать баллы, но не больше, чем сумма
            const discount = Math.min(maxPossibleDiscount, finalAmount); // Сколько можно вычесть

            finalAmount -= discount; // Уменьшаем итоговую сумму

            // Вычитаем баллы с карты лояльности
            user.loyalty.points -= discount;
            await user.save();
        }

        // Обработка оплаты с учётом оставшейся суммы
        if (paymentType === 0) { // Оплата наличными
            if (user.paymentCash >= finalAmount) {
                user.paymentCash -= finalAmount;
                isSuccess = true;
            } else {
                return res.status(400).json({status: "warning", message: "Недостаточно наличных средств" });
            }
        } else if (paymentType === 1) { // Оплата картой
            const card = user.paymentCard.id(cardId);
            if (!card) {
                return res.status(404).json({status: "warning", message: "Карта не найдена" });
            }
            if (card.cardCASH >= finalAmount) {
                card.cardCASH -= finalAmount;
                isSuccess = true;
            } else {
                return res.status(400).json({status: "warning", message: "Недостаточно средств на карте" });
            }
        } else {
            return res.status(400).json({status: "warning", message: "Неверный тип оплаты" });
        }

        if (isSuccess) {
            // Изменяем статус корзины на "paid"
            cart.status = "paid";

            // Создание транзакции
            const transaction = new Transaction({
                userId: user._id,
                cart: cart,
                amount: finalAmount, // Отправляем итоговую сумму
                paymentType,
                cardId: paymentType === 1 ? cardId : null,
                status: "completed"
            });

            if(!loyaltyCode){
                await cart.save();
                await transaction.save();
                return res.status(201).json({status: "success", message: "Оплата успешно проведена", transaction, cart });
            }

            
            const promoCode = await PromoCode.findOne({"code": loyaltyCode})

            // --- Работа с программой лояльности, если loyaltyCode передан ---
            if(promoCode && !promoCode.isUsed && promoCode.expires_at > Date.now()) {
                if (!user.loyalty) {
                    user.loyalty = {
                        points: 0,
                        level: 'Бронза',
                        cardNumber: 'LOYAL-' + Date.now().toString().slice(-8),
                        activatedAt: new Date()
                    };
                }

                let bonusPercent = 0.01; // по умолчанию Бронза
                const currentLevel = user.loyalty.level;

                if (currentLevel === 'Серебро') {
                    bonusPercent = 0.03;
                } else if (currentLevel === 'Золото') {
                    bonusPercent = 0.05;
                }

                const earnedPoints = Math.floor(amount * bonusPercent);
                user.loyalty.points += earnedPoints;

                // --- Повышение уровня ---
                if (user.loyalty.points >= 700000 && currentLevel !== 'Золото') {
                    user.loyalty.level = 'Золото';
                } else if (user.loyalty.points >= 500000 && currentLevel === 'Бронза') {
                    user.loyalty.level = 'Серебро';
                }

                // Обновляем в базе, что код использован
                await PromoCode.findByIdAndUpdate(promoCode._id, { isUsed: true });
                await cart.save();
                await transaction.save();
                await user.save();

            } else if (new Date(promoCode?.expires_at).getTime() < Date.now()) {
                return res.status(400).json({status: "warning", message: "Промо-код не действителен!" });
            } else {
                return res.status(404).json({status: "warning",message: "Промо-код не найден!"});
            }

            return res.status(201).json({status: "success", message: "Оплата успешно проведена", transaction, cart });
        } else {
            console.error(error);
            return res.status(500).json({status: 'error', message: "Ошибка сервера" });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({status: 'error', message: "Ошибка сервера" });
    }
});

// Получение всех транзацкий пользователя
router.get("/:id/transactions", async (req, res) => {
    try {
        const transactions = await Transaction.find({ userId: req.params.id });
        res.status(200).json(transactions);
    } catch (error) {
        console.error(error);
        return res.status(500).json({status: 'error', message: "Ошибка сервера" });
    }
});

// Отмена транзации, возврат средств
router.put("/:userId/transaction/:transactionId/refund", async (req, res) => {
    try {
        const transaction = await Transaction.findById(req.params.transactionId);
        const user = await User.findById(req.params.userId);

        if (!transaction || !user) {
            return res.status(404).json({status: "warning", message: "Транзакция или пользователь не найден" });
        }

        if (transaction.status !== "completed") {
            return res.status(400).json({status: "warning", message: "Нельзя вернуть деньги за незавершенную транзакцию" });
        }

        if (transaction.paymentType === 0) {
            user.paymentCash += transaction.amount;
        } else {
            const card = user.paymentCard.id(transaction.cardId);
            if (card) {
                card.cardCASH += transaction.amount;
            }
        }

        // Если cart отсутствует, создаем пустой объект (или можно попытаться загрузить из БД)
        if (!transaction.cart) {
            transaction.cart = {}; 
        }

        transaction.status = "refunded";
        await transaction.save();
        await user.save();

        res.status(200).json({status: "success", message: "Деньги успешно возвращены", transaction });
    } catch (error) {
        console.error(error);
        return res.status(500).json({status: 'error', message: "Ошибка сервера" });
    }
});

module.exports = router;
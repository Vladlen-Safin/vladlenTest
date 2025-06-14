const User = require("../models/User");
const router = require("express").Router();
const bcrypt = require("bcrypt");

//update user
// router.put("/:id", async (req, res) => {
//     if (req.body.userId === req.params.id || req.body.isAdmin) {
//         if (req.body.password) {
//             try {
//                 const salt = await bcrypt.genSalt(10);
//                 req.body.password = await bcrypt.hash(req.body.password, salt);
//             } catch (err) {
//                 res.status(500).json(err);
//             }
//         }
//         try {
//             const user = await User.findByIdAndUpdate(req.params.id, {
//                 $set: req.body,
//             });
//             res.status(200).json("Account has been updated");
//         } catch (err) {
//             return res.status(500).json(err);
//         }
//     } else {
//         return res.status(403).json("You can update only your account!")
//     }
// });

// Update user
router.put("/:id", async (req, res) => {
    if (req.body.userId === req.params.id || req.body.isAdmin) {
        try {
            // Если обновляется пароль, хэшируем
            if (req.body.password) {
                const salt = await bcrypt.genSalt(10);
                req.body.password = await bcrypt.hash(req.body.password, salt);
            }

            // Обновляем пользователя
            const updatedUser = await User.findByIdAndUpdate(
                req.params.id,
                { $set: req.body }, // Устанавливаем новые значения
                { new: true } // Возвращаем обновлённый документ
            );

            res.status(200).json(updatedUser);
        } catch (error) {
            console.error(error);
            return res.status(500).json({status: 'error', message: "Ошибка сервера" });
        }
    } else {
        return res.status(403).json({status: "error", message: "Можно обновлять только свой аккаунт!" });
    }
});

// Add card pay
router.put("/:id/payment-card", async (req, res) => {
    try {
        const { paymentType, paymentCard } = req.body;

        if (!Array.isArray(paymentCard) || paymentCard.length === 0) {
            return res.status(400).json({status: "warning", message: "Передайте хотя бы одну карту" });
        }

        // Добавляем поле cardCASH со значением 1000 к каждой карте
        const updatedPaymentCards = paymentCard.map(card => ({
            ...card,
            cardCASH: 1000
        }));

        const user = await User.findByIdAndUpdate(
            req.params.id,
            { 
                $set: { paymentType }, // Обновляем тип оплаты
                $push: { paymentCard: { $each: updatedPaymentCards } } // Добавляем карты
            }, 
            { new: true, runValidators: true }
        );

        if (!user) {
            return res.status(404).json({status: "warning", message: "Пользователь не найден" });
        }

        res.status(200).json(user);
    } catch (error) {
        console.error(error);
        return res.status(500).json({status: 'error', message: "Ошибка сервера" });
    }
});

// Add/Remove Admin
router.put("/:id/admin", async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({status: "warning", message: "Пользователь не найден" });
        }

        // Переключаем isAdmin на противоположное значение
        user.isAdmin = !user.isAdmin;
        await user.save();

        return res.status(200).json(user);
    } catch (error) {
        console.error(error);
        return res.status(500).json({status: 'error', message: "Ошибка сервера" });
    }
});

// Add cash
router.put("/:id/payment-cash", async (req, res) => {
    try {

        const { paymentType } = req.body;

        const user = await User.findByIdAndUpdate(
            req.params.id,
            { $set: { paymentType }}, // Обновляем тип оплаты
            { $inc: { paymentCash: 1000 } }, // Прибавляем 1000 к полю paymentCash
            { new: true }
        );

        if (!user) {
            return res.status(404).json({status: "warning", message: "Пользователь не найден" });
        }

        res.status(200).json(user);
    } catch (err) {
        console.error(err);
        res.status(500).json({status: "error", message: "Ошибка добавления суммы наличных", error: err });
    }
});

// add or update address
router.put("/:id/havas", async (req, res) => {
    try {
        const { address } = req.body;

        if (!address) {
            return res.status(400).json({status: "warning", message: "Адрес обязателен" });
        }

        let user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({status: "warning", message: "Пользователь не найден" });
        }

        // Если у пользователя нет address, добавляем его
        if (!user.address) {
            user.address = address;
        } else {
            // Если уже есть, обновляем
            user.address = address;
        }

        await user.save(); // Сохраняем изменения

        return res.status(200).json({status: "success", message: "Адрес обновлен успешно!",user});
    } catch (error) {
        console.error(error);
        return res.status(500).json({status: 'error', message: "Ошибка сервера" });
    }
});

//delete user
router.delete("/:id", async (req, res) => {
    if (req.body.userId === req.params.id || req.body.isAdmin) {
        try {
            await User.findByIdAndDelete(req.params.id);
            res.status(200).json({status: "success", message: "Account has been deleted"});
        } catch (err) {
            console.error(error);
            return res.status(500).json({status: 'error', message: "Ошибка сервера" });
        }
    } else {
        return res.status(403).json({status: "warning", message:"You can delete only your account!"});
    }
});

// gel all users
router.get("/all", async (req, res) => {
    try {
        const users = await User.find({}); // Фикс: передан пустой объект
        res.status(200).json(users);
    } catch (error) {
        console.error(error);
        return res.status(500).json({status: 'error', message: "Ошибка сервера" });
    }
});

//get a user
router.get("/:id", async (req, res) => {
    const userId = req.params.id
    //const userId = req.query.userId;
    const username = req.query.username;
    try {
        const user = userId
            ? await User.findById(userId)
            : await User.findOne({ username: username });
            const { password, updatedAt, ...other } = user._doc;
            res.status(200).json(other);
    } catch (err) {
        console.error(error);
        return res.status(500).json({status: 'error', message: "Ошибка сервера" });
    }
});
module.exports = router;
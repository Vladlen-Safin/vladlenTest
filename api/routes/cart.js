const router = require("express").Router();
const cartSchema = require("../models/cartSchema");
const cardSchema = require("../models/Card");

// Добавление товара в корзину
router.post("/add", async (req, res) => {
    try {
        const { userId, items } = req.body;

        if (!userId || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({status: "error", message: "Неверные данные" });
        }

        let cart = await cartSchema.findOne({ userId, status: "active" });

        if (!cart) {
            cart = new cartSchema({ userId, items: [], status: "active" });
        }

        for (const { cardId, name, quantity } of items) {
            if (!cardId || !name || quantity <= 0) {
                console.warn("Пропущен некорректный товар:", { cardId, name, quantity });
                continue;
            }

            // Ищем саму карточку товара в БД
            const product = await cardSchema.findById(cardId);
            if (!product) {
                console.warn("Товар не найден:", cardId);
                continue;
            }

            // Проверяем, есть ли этот товар в корзине
            const existingItem = cart.items.find(item => item.cardId.toString() === cardId.toString());

            if (existingItem) {
                existingItem.quantity += quantity;
            } else {
                cart.items.push({
                    cardId: product._id, // Сохраняем только ObjectId товара
                    name: product.name, // Обновляем имя из карточки
                    quantity
                });
            }
        }

        await cart.save();
        return res.status(200).json({ status: "success", message: "Товар добавлен в корзину", cart });
    } catch (error) {
        console.error("Ошибка сервера:", error);
        return res.status(500).json({ message: "Ошибка сервера" });
    }
});

// Получение содержимого корзины по userId
router.get("/:userId", async (req, res) => {
    try {
        const { userId } = req.params;

        let cart = await cartSchema.findOne({ userId, status: "active" }).populate("items.cardId");

        if (!cart) {
            // return res.status(404).json({ message: "Корзина пуста" });
            cart = new cartSchema({ userId, items: [], status: "active" });
        }

        return res.status(200).json(cart);
    } catch (error) {
        console.error(error);
        return res.status(500).json({status: 'error', message: "Ошибка сервера" });
    }
});

// Удаление товара из корзины по cardId
router.delete("/:userId/:cardId", async (req, res) => {
    try {
        const { userId, cardId } = req.params;

        const cart = await cartSchema.findOne({ userId, status: "active" });

        if (!cart) {
            return res.status(404).json({status: 'warning', message: "Корзина не найдена" });
        }

        cart.items = cart.items.filter(item => item._id.toString() !== cardId);

        await cart.save();
        console.log("удалил товар")
        return res.status(200).json({status: 'success', message: "Товар удален", cart });
    } catch (error) {
        console.error(error);
        return res.status(500).json({status: 'error', message: "Ошибка сервера" });
    }
});

// Очистка корзины пользователя
router.delete("/:userId", async (req, res) => {
    try {
        const { userId } = req.params;

        const cart = await cartSchema.findOne({ userId, status: "active" });

        if (!cart) {
            return res.status(404).json({ status: "error", message: "Корзина не найдена" });
        }

        cart.items = [];
        await cart.save();

        return res.status(200).json({status: "success", message: "Корзина очищена" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({status: 'error', message: "Ошибка сервера" });
    }
});

module.exports = router;
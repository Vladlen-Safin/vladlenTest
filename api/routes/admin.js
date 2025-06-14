const router = require("express").Router();
const Card = require("../models/Card");

// Create card of product
router.post("/create", async(req, res) => {
    try {

        const { name, description, conditions, expiration_date, kilo_kal, belki, jiri, uglevods, massa, tag, stock, stockPercent,price, subGroup} = req.body;

        // Проверяем обязательные поля (кроме photo)
        if (
            !name ||
            !description ||
            !conditions ||
            !expiration_date ||
            !kilo_kal ||
            !belki ||
            !jiri ||
            !uglevods ||
            !massa ||
            !tag ||
            !price
        ) {
            return res.status(400).json({status: "warning", message: "Пожалуйста, заполните все обязательные поля."});
        }

        // create card
        const newCard = new Card({
            name: req.body.name,
            description: req.body.description,
            conditions: req.body.conditions,
            expiration_date: req.body.expiration_date,
            kilo_kal: req.body.expiration_date,
            belki: req.body.belki,
            jiri: req.body.jiri,
            uglevods: req.body.uglevods,
            massa: req.body.massa,
            tag: req.body.tag,
            isStock: req.body.stock,
            subTag: req.body?.subGroup || '',
            photo: req.body.photo,
            stockPercent: req.body.stockPercent,
            price: req.body.price
        });

        //save card and respond
        const card = await newCard.save();
        return res.status(200).json({status: "success", message: "Карточка была добавлена успешно!"});
    } catch (error) {
        console.log(error);
        return res.status(500).json({status: "error", message: "Ошибка сервера"});
    }
});

// Добавление акционного товара
router.put("/addStock", async (req, res) => {
    try {
        const { products } = req.body; // Получаем массив объектов { label, value }

        if (!Array.isArray(products) || products.length === 0) {
            return res.status(400).json({ status: "error",  message: "Неверный запрос: продукты должны быть непустым массивом" });
        }

        // Извлекаем ID карточек
        const cardIds = products.map(product => product.value);

        // Обновляем все указанные карточки, меняя isStock на true
        const updatedCards = await Card.updateMany(
            { _id: { $in: cardIds } }, // Ищем карточки по их ID
            { $set: { isStock: true } } // Меняем только isStock
        );

        return res.status(200).json({ status: "success", message: "Карточка обновлена успешно!", modifiedCount: updatedCards.modifiedCount });
    } catch (error) {
        console.log(error);
        return res.status(500).json({status: "error", message: "Ошибка сервера" });
    }
});

// Удаление акционного товара
router.put("/delStock", async (req, res) => {
    try {
        const { products } = req.body; // Получаем массив объектов { label, value }

        if (!Array.isArray(products) || products.length === 0) {
            return res.status(400).json({ status: "error", message: "Неверный запрос: продукты должны быть непустым массивом" });
        }

        // Извлекаем ID карточек
        const cardIds = products.map(product => product.value);

        // Обновляем все указанные карточки, меняя isStock на true
        const updatedCards = await Card.updateMany(
            { _id: { $in: cardIds } }, // Ищем карточки по их ID
            { $set: { isStock: false } } // Меняем только isStock
        );

        return res.status(200).json({status: "success", message: "Карточка обновлена успешно!", modifiedCount: updatedCards.modifiedCount });
    } catch (error) {
        console.log(error);
        return res.status(500).json({status: "error", message: "Ошибка сервера" });
    }
});

// Добавление скидки товара по id
router.put("/addStock/:id", async (req, res) => {
    try {
        const { stockPercent } = req.body;

        // Проверяем, передан ли корректный процент скидки
        if (!stockPercent || stockPercent <= 0 || stockPercent >= 100) {
            return res.status(400).json({status: "error", message: "Некорректное значение скидки" });
        }

        // Получаем текущую цену товара
        const card = await Card.findById(req.params.id);
        if (!card) {
            return res.status(404).json({status: "error", message: "Товар не найден" });
        }

        // Вычисляем новую цену с учетом скидки
        const newPrice = card.price - (card.price * (stockPercent / 100)); // 37.5 от 50 || 0.25 

        // Обновляем данные карточки товара
        const updatedStockCard = await Card.findByIdAndUpdate(
            req.params.id,
            {
                $set: {
                    price: newPrice.toFixed(2), // Округляем до 2 знаков
                    stockPercent: stockPercent
                },
            },
            { new: true }
        );

        return res.status(200).json({status: "success", message: "Скидка была добавлена успешно!", updatedStockCard});
    } catch (error) {
        console.log(error);
        return res.status(500).json({status: "error", message: "Ошибка сервера" });
    }
});

// Добавление скидки товара по id
router.put("/delStock/:id", async (req, res) => {
    try {
        const { stockPercent } = req.body;

        // Проверяем, передан ли корректный процент скидки
        if (!stockPercent || stockPercent <= 0 || stockPercent >= 100) {
            return res.status(400).json({status: "error", message: "Некорректное значение скидки" });
        }

        // Получаем текущую цену товара
        const card = await Card.findById(req.params.id);
        if (!card) {
            return res.status(404).json({ status: "error", message: "Товар не найден" });
        }

        // Вычисляем новую цену с учетом скидки
        const newPrice = (card.price)/(1 - (stockPercent/100));

        // Обновляем данные карточки товара
        const updatedStockCard = await Card.findByIdAndUpdate(
            req.params.id,
            {
                $set: {
                    price: newPrice.toFixed(2), // Округляем до 2 знаков
                    stockPercent: 0
                },
            },
            { new: true }
        );

        return res.status(200).json({ status: "success", message: "Скидка была удалена успешно!", updatedStockCard});
    } catch (error) {
        console.log(error);
        return res.status(500).json({status: "error", message: "Ошибка сервера" });
    }
});

// Update card of product by ID
router.put("/:id", async (req, res) => {
    try {
        const updatedCard = await Card.findByIdAndUpdate(
            req.params.id, // ID карточки из параметров URL
            {
                $set: { // Обновляем поля, указанные в теле запроса
                    name: req.body.name,
                    description: req.body.description,
                    conditions: req.body.conditions,
                    expiration_date: req.body.expiration_date,
                    kilo_kal: req.body.kilo_kal,
                    belki: req.body.belki,
                    jiri: req.body.jiri,
                    uglevods: req.body.uglevods,
                    massa: req.body.massa,
                    tag: req.body.tag,
                    subTag: req.body.subTag,
                    photo: req.body.photo,
                    price: req.body.price,
                    isStock: req.body.stock,
                    stockPercent: req.body.stockPercent
                },
            },
            { new: true } // Возвращаем обновленный документ
        );

        // Проверяем, существует ли карточка
        if (!updatedCard) {
            return res.status(404).json({status: "error", message: "Карта не найдена!" });
        }

        return res.status(200).json({status: "success", message: "Карточка обновлена успешно!", updatedCard});
    } catch (error) {
        console.log(error);
        return res.status(500).json({status: "error", message: "Ошибка сервера"});
    }
});

// Delete card of product by ID
router.delete("/delete/:id", async (req, res) => {
    try {
        const deletedCard = await Card.findByIdAndDelete(req.params.id);

        // Проверка, существует ли карточка
        if (!deletedCard) {
            return res.status(404).json({status: "warning", message: "Карточка не найдена" });
        }

        return res.status(200).json({status: "success", message: "Карточка была удалена успешно!" });
    } catch (error) {
        console.log(error);
        return res.status(500).json({status: "error", message: "Ошибка сервера"});
    }
});

router.get("/all", async (req, res) => {
    try {
        const { tag, subTag, name } = req.query; // Получаем параметры из запроса
        let filter = {};

        if (subTag) filter.subTag = { $regex: subTag, $options: "i" }; // Фильтр по тегу (поиск по подстроке, регистронезависимо)
        if (tag) filter.tag = { $regex: tag, $options: "i" }; // Фильтр по тегу (поиск по подстроке, регистронезависимо)
        if (name) filter.name = { $regex: name, $options: "i" }; // Фильтр по имени (поиск по подстроке, регистронезависимо)

        const cards = await Card.find(filter).sort({isStock: -1}); // Сортировка по IsStock в перед
        return res.status(200).json(cards);
    } catch (error) {
        console.log(error);
        return res.status(500).json({status: "error", message: "Ошибка сервера"});
    }
});

// Get card by id
router.get("/:id", async (req, res) => {
    try {
        const card = await Card.findById(req.params.id) // ID карточки из параметров URL
        
        if(!card) {
            return res.status(404).json({status: "error", message:"Карта не найдена!"});
        }

        return res.status(200).json(card);
    } catch (error) {
        console.log(error);
        return res.status(500).json({status: "error", message: "Ошибка сервера"});
    }
});

module.exports = router;
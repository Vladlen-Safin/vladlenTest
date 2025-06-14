const router = require("express").Router();
const recipeShema = require("../models/Recipe");
const mongoose = require("mongoose");

// Добавление рецепта
router.post("/add", async (req, res) => {
    try {
        const { nameRecipe, descriptionRecipe, items, photo, tags } = req.body;

        // Проверка наличия необходимых данных
        if (!nameRecipe || !descriptionRecipe || !Array.isArray(items) || items.length === 0 || !Array.isArray(tags)) {
            return res.status(400).json({status: "warning", message: "Введены неверные данные" });
        }

        // Поиск существующего рецепта по имени
        let recipe = await recipeShema.findOne({ nameRecipe });

        if (!recipe) {
            // Если рецепт не найден, создаем новый
            recipe = new recipeShema({ nameRecipe, descriptionRecipe, items: [], photo, tags: [] });
        }

        // Обработка каждого продукта из массива
        items.forEach(({ cardId, name, quantity }) => {
            const parsedQuantity = parseInt(quantity, 10);

            if (!cardId || !name || parsedQuantity <= 0) {
                return; // Пропускаем некорректные записи
            }

            // Проверка наличия продукта в рецепте
            const existingItem = recipe.items.find(item => item.cardId.toString() === cardId);

            if (existingItem) {
                existingItem.quantity += parsedQuantity;
            } else {
                recipe.items.push({ cardId, name, quantity: parsedQuantity });
            }
        });

        await recipe.save();
        return res.status(200).json({status: "success", message: "Рецепт добавлен в базу", recipe });
    } catch (error) {
        console.error(error);
        return res.status(500).json({status: 'error', message: "Ошибка сервера" });
    }
});

// Получение всех рецептов
router.get("/all", async(req, res) => {
    try {
        const recipes = await recipeShema.find(); // Get all groups from DB
        res.status(200).json(recipes);
    } catch (error) {
        console.error(error);
        return res.status(500).json({status: 'error', message: "Ошибка сервера" });
    }
});

// Получение рецепта по id 
router.get("/:id", async (req, res) => {
    try {
        const { id } = req.params; // Деструктуризация параметра id
        if (!id) {
            return res.status(400).json({status: "error", message: "Не был передан ID рецепта" });
        }

        // Поиск рецепта по id
        const recipe = await recipeShema.findById(id);

        if (!recipe) {
            return res.status(404).json({status: "warning", message: "Рецепт не найден" });
        }

        return res.status(200).json(recipe);
    } catch (error) {
        console.error(error);
        return res.status(500).json({status: 'error', message: "Ошибка сервера" });
    }
});

// Изменения рецепта по id (НЕ НУЖНЫЙ МЕТОД НУЖНО УДАЛИТЬ ?)
router.put("/:id", async (req, res) => {
    try {
        const { cardId, name, quantity, nameRecipe, descriptionRecipe, photo, tags } = req.body;
        const { id } = req.params; // Берем id из params

        // Проверка на корректность введенных данных
        if (!nameRecipe || !descriptionRecipe) {
            return res.status(400).json({status: "error", message: "Некорректные данные: название и описание обязательны" });
        }

        // Поиск рецепта по id
        let recipe = await recipeShema.findById(id);
        if (!recipe) {
            return res.status(404).json({status: "warning", message: "Рецепт не найден" });
        }

        // Обновляем данные в рецепте
        recipe.nameRecipe = nameRecipe;
        recipe.descriptionRecipe = descriptionRecipe;
        recipe.tags = tags;
         
        // Добавляем поле photo, если его нет
        if (!recipe.photo && photo) {
            recipe.photo = photo;
        }

        // Если пришел новый продукт, добавляем его
        if (cardId && name && quantity > 0) {
            const existingItem = recipe.items.find(item => item.cardId.toString() === cardId);

            if (existingItem) {
                existingItem.quantity += quantity; // Обновляем количество
            } else {
                recipe.items.push({ cardId, name, quantity }); // Добавляем новый продукт
            }
        }

        await recipe.save();
        return res.status(200).json({status: "success", message: "Рецепт успешно обновлен", recipe });
    } catch (error) {
        console.error(error);
        return res.status(500).json({status: 'error', message: "Ошибка сервера" });
    }
});

// Удаление рецепта по id
router.delete("/:id", async (req, res) => {
    try {
        const recipe = await recipeShema.findByIdAndDelete(req.params.id);

        // Если рецепт не был найден
        if(!recipe){
            return res.status(404).json({status: "warning", message: "Рецепт не был найден"});
        }

        res.status(200).json({status: "success", message: "Рецепт был удален"});
    } catch (error) {
        console.error(error);
        return res.status(500).json({status: 'error', message: "Ошибка сервера" });
    }
});

//------------------------------ НОВАЯ ЛОГИКА РЕЦЕПТОВ

// Добавление ингредиента рецепту
router.post("/:id/items", async (req, res) => {
    try {
        // Нахождение рецепта по id
        const recipe = await recipeShema.findById(req.params.id);

        if (!recipe) {
            return res.status(404).json({status: "warning", message: "Рецепт не был найден" });
        }

        if (!recipe.items) {
            recipe.items = [];
        }

        // Проверка и приведение входных данных
        const cardId = mongoose.Types.ObjectId.isValid(req.body.cardId) ? req.body.cardId : null;
        const name = req.body.name && req.body.name.trim() !== "" ? req.body.name : "Без названия"; // если пустое, то дефолтное имя
        const quantity = req.body.quantity > 0 ? req.body.quantity : 1; // если 0 или меньше, то ставим 1

        // Теперь проверка cardId не ломает сервер, просто игнорируем его
        if (!cardId) {
            console.warn("Предупреждение: cardId пустой или некорректный, ингредиент добавляется без него.");
        }

        // Добавляем ингредиент
        recipe.items.push({ cardId, name, quantity });

        await recipe.save();
        return res.json({status: "success", message: "Ингредиент добавлен", items: recipe.items });

    } catch (error) {
        console.error(error);
        return res.status(500).json({status: 'error', message: "Ошибка сервера" });
    }
});

// Изменение ингредиента по id
router.put("/:recipeId/items/:itemId", async (req, res) => {
    try {
        const { recipeId, itemId } = req.params;
        const { cardId, name, quantity } = req.body;

        // Находим рецепт
        const recipe = await recipeShema.findById(recipeId);

        if (!recipe) {
            return res.status(404).json({status: "warning", message: "Рецепт не был найден" });
        }

        // Находим нужный ингредиент по его _id
        const item = recipe.items.id(itemId);
        if (!item) {
            return res.status(404).json({status: "warning", message: "Ингредиент не найден" });
        }

        // Обновляем данные ингредиента
        if (cardId !== undefined) item.cardId = cardId;
        if (name !== undefined) item.name = name;
        if (quantity !== undefined) item.quantity = quantity;

        // Сохраняем изменения в базе
        await recipe.save();

        // Возвращаем обновленный ингредиент
        return res.status(200).json({
            status: "success",
            message: "Ингредиент был успешно изменен",
            updatedItem: item,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({status: 'error', message: "Ошибка сервера" });
    }
});

// Получение всех ингредиентов рецепта по id рецепта
router.get("/:id/items", async (req, res) => {
    try {
        const recipe = await recipeShema.findById(req.params.id);

        if (!recipe) {
            return res.status(404).json({status: "warning", message: "Рецепт не найден" });
        }

        return res.status(200).json(recipe.items);
    } catch (error) {
        console.error(error);
        return res.status(500).json({status: 'error', message: "Ошибка сервера" });
    }
});

// Удаление ингредиента по id  и по id рецепта
router.delete("/:recipeId/items/:itemId", async (req, res) => {
    try {
        const { recipeId, itemId } = req.params;

        // Находим и обновляем рецепт, удаляя шаг из массива
        const updatedRecipe = await recipeShema.findByIdAndUpdate(
            recipeId,
            { $pull: { items: { _id: itemId } } }, // Удаление шага с указанным _id
            { new: true } // Чтобы вернуть обновленный документ
        );

        if (!updatedRecipe) {
            return res.status(404).json({status: "warning", message: "Рецепт не найден" });
        }

        return res.status(200).json({status: "success", message: "Ингредиент успешно удален", updatedRecipe });
    } catch (error) {
        console.error(error);
        return res.status(500).json({status: 'error', message: "Ошибка сервера" });
    }
});

// Добавление нового шага для рецепта
router.post("/:id", async (req, res) => {
    try {
        const recipe = await recipeShema.findById(req.params.id);

        if (!recipe) {
            return res.status(404).json({status: "warning", message: "Рецепт не был найден" });
        }

        // Если поле steps отсутствует, инициализируем его пустым массивом
        if (!recipe.steps) {
            recipe.steps = [];
        }

        // Добавляем новый шаг в массив
        recipe.steps.push({
            stepDescription: req.body.stepDescription || "",
            stepImage: req.body.stepImage || ""
        });

        // Сохраняем изменения
        await recipe.save();

        return res.status(200).json(recipe);
    } catch (error) {
        console.error(error);
        return res.status(500).json({status: 'error', message: "Ошибка сервера" });
    }
});

// Получение всех шагов рецепта
router.get("/:id/steps", async (req, res) => {
    try {
        const recipe = await recipeShema.findById(req.params.id);

        if (!recipe) {
            return res.status(404).json({status: "warning", message: "Рецепт не найден" });
        }

        return res.status(200).json(recipe.steps);
    } catch (error) {
        console.error(error);
        return res.status(500).json({status: 'error', message: "Ошибка сервера" });
    }
});

// Удаление шага по id рецепту и id шага
router.delete("/:recipeId/steps/:stepId", async (req, res) => {
    try {
        const { recipeId, stepId } = req.params;

        // Находим и обновляем рецепт, удаляя шаг из массива
        const updatedRecipe = await recipeShema.findByIdAndUpdate(
            recipeId,
            { $pull: { steps: { _id: stepId } } }, // Удаление шага с указанным _id
            { new: true } // Чтобы вернуть обновленный документ
        );

        if (!updatedRecipe) {
            return res.status(404).json({status: "warning", message: "Рецепт не найден" });
        }

        return res.status(200).json({status: "success", message: "Шаг успешно удален", updatedRecipe });
    } catch (error) {
        console.error(error);
        return res.status(500).json({status: 'error', message: "Ошибка сервера" });
    }
});

// Обновление шага рецепта по id рецепта и id шага
router.put("/:recipeId/steps/:stepId", async (req, res) => {
    try {
        const { recipeId, stepId } = req.params;
        const { stepDescription, stepImage } = req.body;

        // Находим рецепт
        const recipe = await recipeShema.findById(recipeId);
        if (!recipe) {
            return res.status(404).json({status: "warning", message: "Рецепт не найден" });
        }

        // Находим нужный шаг по его _id
        const step = recipe.steps.id(stepId);
        if (!step) {
            return res.status(404).json({status: "warning", message: "Шаг не найден" });
        }

        // Обновляем данные шага
        if (stepDescription !== undefined) step.stepDescription = stepDescription;
        if (stepImage !== undefined) step.stepImage = stepImage;

        // Сохраняем изменения в базе
        await recipe.save();

        return res.status(200).json({status: "success", message: "Шаг успешно обновлен", updatedStep: step });
    } catch (error) {
        console.error(error);
        return res.status(500).json({status: 'error', message: "Ошибка сервера" });
    }
});

// Добавление комментария по рецепт id
router.put("/:recipeId/comment", async (req, res) => {
    try {
        const recipe = await recipeShema.findById(req.params.recipeId);

        // Проверка на наличие рецепта
        if (!recipe) {
            return res.status(404).json({status: "warning", message: "Рецепт не был найден"});
        }
        
        // Проверка на наличие массива комментариев, если их не то создать пустой массив
        if (!recipe.comments) {
            recipe.comments = [];
        }

        // Добавление нового комментария
        recipe.comments.push({
            userName: req.body.userName || "",
            text: req.body.text || ""
        });

        // Сохраняем изменения
        await recipe.save();

        return res.status(200).json({status: "success", message: "Комментарий был успешно добавлен"});
    } catch (error) {
        console.error(error);
        return res.status(500).json({status: 'error', message: "Ошибка сервера" });
    }
});

// Удалить комментарий по рецепт id и id комментария 
router.delete("/:recipeId/comment/:commentId", async (req, res) => {
    try {
        const { recipeId, commentId } = req.params;

        // Нахоидм и обновляем рецепт, удаляя комментарий из массива
        const updateRecipe = await recipeShema.findByIdAndUpdate(
            recipeId,
            { $pull: { comments: {_id : commentId}}}, // Удаление комментария по _id
            { new: true} // ЧТобы вернуть обновленное состояние
        );

        // Проверка на наличие рецепта
        if (!updateRecipe) {
            return res.status(404).json({status: "warning", message: "Рецепт не был найден"});
        }

        return res.status(200).json({status: "success", message: "Комментарий был успешно удален"});
    } catch (error) {
        console.error(error);
        return res.status(500).json({status: 'error', message: "Ошибка сервера" });
    }
});

// Получить все комментарии
router.get("/:recipeId/comments", async (req, res) => {
    try {
        const recipe = await recipeShema.findById(req.params.id);

        if (!recipe) {
            return res.status(404).json({status: "warning", message: "Видео не найдено" });
        }

        return res.status(200).json(recipe.comments);
    } catch (error) {
        console.error(error);
        return res.status(500).json({status: 'error', message: "Ошибка сервера" });
    }
});

// Добавление тэгов рецепту
router.put("/:recipeId/video/add", async (req, res) => {
    try {
        let { tags } = req.body; // Ожидаем массив объектов [{ value, label }]

        if (!tags || !Array.isArray(tags)) {
            return res.status(400).json({status: "warning", message: "Теги должны быть массивом" });
        }

        const recipe = await recipeShema.findById(req.params.recipeId);

        if (!recipe) {
            return res.status(404).json({status: "warning", message: "Рецепт не найден" });
        }

        // Если у рецепта нет массива tags, создаем его
        if (!Array.isArray(recipe.tags)) {
            recipe.tags = [];
        }

        // Преобразуем входные данные в формат, соответствующий схеме
        const formattedTags = tags.map(tag => ({
            _id: tag._id, // Записываем value как _id
            groupname: tag.groupname // Записываем label как groupname
        }));

        // Добавляем теги, избегая дубликатов
        const existingTagIds = new Set(recipe.tags.map(tag => tag._id.toString()));
        const newTags = formattedTags.filter(tag => !existingTagIds.has(tag._id));

        recipe.tags.push(...newTags);

        await recipe.save();

        res.status(200).json({status: "success", message: "Тэг был добавлен рецепту успешно!", recipe});
    } catch (error) {
        console.error(error);
        return res.status(500).json({status: 'error', message: "Ошибка сервера" });
    }
});

// Удаление тэгов у рецепта
router.put("/:recipeId/video/del", async (req, res) => {
    try {
        const { tags } = req.body;

        if (!tags || !Array.isArray(tags)) {
            return res.status(400).json({status: "warning", message: "Теги должны быть массивом" });
        }

        const tagIds = tags.map(tag => new mongoose.Types.ObjectId(tag.value));

        const updatedRecipe = await recipeShema.findByIdAndUpdate(
            req.params.recipeId,
            {
                $pull: {
                    tags: {
                        _id: { $in: tagIds }
                    }
                }
            },
            { new: true }
        );

        if (!updatedRecipe) {
            return res.status(404).json({status: "warning", message: "Рецепт не найден" });
        }

        res.status(200).json({status: "success", message: "Тэги у рецепта удалены успешно!", updatedRecipe});
    } catch (error) {
        console.error(error);
        return res.status(500).json({status: 'error', message: "Ошибка сервера" });
    }
});

// Удаление тэга по его id
router.put("/:recipeId/video/delId", async (req, res) => {
    try {
        const { tagId } = req.body; // ID удаляемого тега

        if (!tagId) {
            return res.status(400).json({status: "warning", message: "Не указан ID тега" });
        }

        const recipe = await recipeShema.findById(req.params.recipeId);

        if (!recipe) {
            return res.status(404).json({status: "warning", message: "Рецепт не найден" });
        }

        // Проверяем, есть ли массив tags у рецепта
        if (!Array.isArray(recipe.tags)) {
            return res.status(400).json({status: "warning", message: "У рецепта нет тэгов" });
        }

        // Фильтруем теги, удаляя тег с указанным ID
        recipe.tags = recipe.tags.filter(tag => tag._id.toString() !== tagId);

        await recipe.save();

        res.status(200).json({status: "success", message: "Тэг удален", recipe });
    } catch (error) {
        console.error(error);
        return res.status(500).json({status: 'error', message: "Ошибка сервера" });
    }
});

module.exports = router;
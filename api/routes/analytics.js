const express = require("express");
const router = express.Router();
const Cart = require("../models/cartSchema");
const Transaction = require("../models/Transaction");
const { v4: uuidv4 } = require("uuid"); // Импорт генератора UUID

// Функция для опрделения сезона по месяцу
const getSeason = (month) => {
    if (month >= 3 && month <= 5) return "Весна";
    if (month >= 6 && month <= 8) return "Лето";
    if (month >= 9 && month <= 11) return "Осень"
    return "Зима";
};

// Получение списка самых покупаемых товаров с фильтрацией по дате
router.get("/top-products", async (req, res) => {
    try {
        let { startDate, endDate } = req.query;

        // Если даты не переданы, по умолчанию берем последний месяц
        if (!startDate || !endDate) {
            const now = new Date();
            endDate = now.toISOString(); // Текущая дата
            startDate = new Date(now.setMonth(now.getMonth() - 1)).toISOString(); // Месяц назад
        }

        const topProducts = await Cart.aggregate([
            { 
                $match: { 
                    status: "paid", 
                    paidAt: { $gte: new Date(startDate), $lte: new Date(endDate) } 
                } 
            },
            { $unwind: "$items" },
            { 
                $group: {
                    _id: "$items.cardId",
                    name: { $first: "$items.name" },
                    totalQuantity: { $sum: "$items.quantity" },
                }
            },
            { $sort: { totalQuantity: -1 } },
            { $limit: 10 }
        ]);

        res.status(200).json(topProducts);
    } catch (error) {
        console.error(error);
        return res.status(500).json({status: 'error', message: "Ошибка сервера" });
    }
});

// Получение самых популярных групп товаров
router.get("/top-groups", async (req, res) => {
    try {

        let { startDate, endDate } = req.query;

        // Если даты не переданы, берем последний месяц
        if (!startDate || !endDate) {
            const now = new Date();
            endDate = now.toISOString(); // Текущая дата
            startDate = new Date(now.setMonth(now.getMonth() - 1)).toISOString(); // Месяц назад
        }

        const popularGroups = await Cart.aggregate([
            { $match: { 
                    status: "paid",
                    paidAt: { $gte: new Date(startDate), $lte: new Date(endDate) } 
                }
            }, // Фильтруем оплаченные корзины
            { $unwind: "$items" }, // Разворачиваем товары
            {
                $lookup: {
                    from: "cards", // Продукты
                    localField: "items.cardId",
                    foreignField: "_id",
                    as: "product"
                }
            },
            { $unwind: "$product" }, // Преобразуем массив в объект
            {
                $lookup: {
                    from: "productgroups", // Группы товаров
                    localField: "product.tag",  // Используем `tag` из `cards`
                    foreignField: "groupname",       // Связываем с `name` в `productgroups`
                    as: "group"
                }
            },
            { $unwind: "$group" }, // Преобразуем массив в объект
            {
                $group: {
                    _id: "$group._id",
                    name: { $first: "$group.groupname" }, // Исправлено с `groupname` на `name`
                    totalSales: { $sum: "$items.quantity" }
                }
            },
            { $sort: { totalSales: -1 } }, // Сортируем по популярности
            { $limit: 10 } // Берем топ-10 групп
        ]);

        res.status(200).json(popularGroups);
    } catch (error) {
        console.error(error);
        return res.status(500).json({status: 'error', message: "Ошибка сервера" });
    }
});

// Получение самых популярных подгрупп товаров
router.get("/top-subgroups", async (req, res) => {
    try {

        let { startDate, endDate } = req.query;

        // Если даты не переданы, берем последний месяц
        if (!startDate || !endDate) {
            const now = new Date();
            endDate = now.toISOString(); // Текущая дата
            startDate = new Date(now.setMonth(now.getMonth() - 1)).toISOString(); // Месяц назад
        }

        const popularSubGroups = await Cart.aggregate([
            { $match: { 
                    status: "paid",
                    paidAt: { $gte: new Date(startDate), $lte: new Date(endDate) } 
                }
             }, // Фильтруем оплаченные корзины
            { $unwind: "$items" }, // Разворачиваем товары
            {
                $lookup: {
                    from: "cards", // Продукты
                    localField: "items.cardId",
                    foreignField: "_id",
                    as: "product"
                }
            },
            { $unwind: "$product" },
            {
                $lookup: {
                    from: "subproductgroups", // Подгруппы товаров
                    localField: "product.subTag",
                    foreignField: "subgroupname",
                    as: "subgroup"
                }
            },
            { $unwind: "$subgroup" },
            {
                $group: {
                    _id: "$subgroup._id",
                    name: { $first: "$subgroup.subgroupname" },
                    totalSales: { $sum: "$items.quantity" }
                }
            },
            { $sort: { totalSales: -1 } },
            { $limit: 10 } // ТОП-10 подгрупп
        ]);

        res.status(200).json(popularSubGroups);
    } catch (error) {
        console.error(error);
        return res.status(500).json({status: 'error', message: "Ошибка сервера" });
    }
});

// Роут для анализа сезонности покупок
router.get("/seasonality", async (req, res) => {
    try {
        let { startDate, endDate } = req.query;

        // Если даты не переданы, берем последние 12 месяцев
        if (!startDate || !endDate) {
            const now = new Date();
            endDate = now.toISOString();
            startDate = new Date(now.setFullYear(now.getFullYear() - 1)).toISOString(); // Год назад
        }

        const seasonalTrends = await Cart.aggregate([
            { $match: { status: "paid", paidAt: { $gte: new Date(startDate), $lte: new Date(endDate) } } },
            {
                $project: {
                    season: { $switch: {
                        branches: [
                            { case: { $in: [{ $month: "$paidAt" }, [3, 4, 5]] }, then: "Весна" },
                            { case: { $in: [{ $month: "$paidAt" }, [6, 7, 8]] }, then: "Лето" },
                            { case: { $in: [{ $month: "$paidAt" }, [9, 10, 11]] }, then: "Осень" }
                        ],
                        default: "Зима"
                    }},
                },
            },
            {
                $group: {
                    _id: "$season",
                    count: { $sum: 1 } // Подсчет количества покупок в каждом сезоне
                },
            },
            { $sort: { count: -1 } } // Сортируем от самого популярного сезона
        ]);

        // Преобразуем в нужный формат с UUID
        const response = seasonalTrends.map(({ _id, count }) => ({
            _id: uuidv4(), // Генерация случайного UUID
            name: _id,
            count
        }));

        res.status(200).json(response);
    } catch (error) {
        console.error(error);
        return res.status(500).json({status: 'error', message: "Ошибка сервера" });
    }
});

// Получение статистики по чекам
router.get("/check-stats", async (req, res) => {
    try {

        let { startDate, endDate } = req.query;

        // Если даты не переданы, берем последний месяц
        if (!startDate || !endDate) {
            const now = new Date();
            endDate = now.toISOString(); // Текущая дата
            startDate = new Date(now.setMonth(now.getMonth() - 1)).toISOString(); // Месяц назад
        }

        const stats = await Transaction.aggregate([
            { $match: { 
                    status: "completed",
                    createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) }
                } }, // Фильтруем только завершенные транзакции
            {
                $group: {
                    _id: null, // Группируем все транзакции
                    averageCheck: { $avg: "$amount" }, // Средний чек
                    maxCheck: { $max: "$amount" }, // Самый большой чек
                    minCheck: { $min: "$amount" }, // Самый маленький чек
                    totalTransactions: { $sum: 1 } // Количество транзакций
                }
            }
        ]);

        if (stats.length === 0) {
            return res.status(404).json({ message: "Нет завершенных транзакций" });
        }

        res.status(200).json(stats[0]);
    } catch (error) {
        console.error(error);
        return res.status(500).json({status: 'error', message: "Ошибка сервера" });
    }
});

// Анализ трафика покупок по дням недели и часам
router.get("/traffic", async (req, res) => {
    try {
        let { startDate, endDate } = req.query;

        // Если даты не переданы, берем последний месяц
        if (!startDate || !endDate) {
            const now = new Date();
            endDate = now.toISOString(); // Текущая дата
            startDate = new Date(now.setMonth(now.getMonth() - 1)).toISOString(); // Месяц назад
        }

        const trafficStats = await Transaction.aggregate([
            { 
                $match: { 
                    status: "completed",
                    createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) }
                } 
            }, // Фильтруем завершенные транзакции
            {
                $project: {
                    dayOfWeek: { $dayOfWeek: "$createdAt" }, // День недели (1 - воскресенье, 7 - суббота)
                    hour: { $hour: "$createdAt" } // Час покупки
                }
            },
            {
                $group: {
                    _id: { day: "$dayOfWeek", hour: "$hour" },
                    count: { $sum: 1 } // Считаем количество покупок
                }
            },
            { $sort: { "_id.day": 1, "_id.hour": 1 } } // Сортируем по дням недели и часам
        ]);

        res.status(200).json(trafficStats);
    } catch (error) {
        console.error(error);
        return res.status(500).json({status: 'error', message: "Ошибка сервера" });
    }
});

module.exports = router;
const HavasSchema = require('../models/Havas');
const router = require('express').Router();;

// Добавление нового адреса магазина
router.post("/add", async (req, res) => {
    try {
        // создание магазина
        const NewHavas = new HavasSchema({
            address: req.body.address,
            city: req.body.city,
            coordinates: req.body.coordinates
        });

        // сохранение магазина
        const havas = await NewHavas.save();
        return res.status(200).json({status: "success", message: "Адрес добавлен успешно!", havas});
    } catch (error) {
        console.error(error);
        return res.status(500).json({status: 'error', message: "Ошибка сервера" });
    }
});

// Изменеие магазина по id
router.put("/:id", async (req, res) => {
    try {
        const updateHavas = await HavasSchema.findByIdAndUpdate(
            req.params.id,
            {
                $set: {
                    address: req.body.address,
                    city: req.body.city,
                    coordinates: req.body.coordinates
                },
            },
            {new: true}
        )
        return res.status(200).json({ status: "success", message: "Магазин был обновлен!", updateHavas});
    } catch (error) {
        console.error(error);
        return res.status(500).json({status: 'error', message: "Ошибка сервера" });
    }
});

// Удааление магазина по id
router.delete("/:id", async (req, res) => {
    try {
        const deleteHavas = await HavasSchema.findByIdAndDelete(req.params.id);

        if(!deleteHavas) {
            return res.status(404).json({status: "warning", message: "Havas not found"});
        }

        return res.status(200).json({ status: "success", message: "Адрес успешно удален!"});
    } catch (error) {
        console.error(error);
        return res.status(500).json({status: 'error', message: "Ошибка сервера" });
    }
});

// Получение всех магазинов
router.get("/all", async (req, res) => {
    try {
        const allHavas = await HavasSchema.find();
        return res.status(200).json(allHavas);
    } catch (error) {
        console.error(error);
        return res.status(500).json({status: 'error', message: "Ошибка сервера" });
    }
});

module.exports = router;
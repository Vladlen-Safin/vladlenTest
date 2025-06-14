const PromoCode = require("../models/PromoCode");
const router = require("express").Router();

// Добавление нового промо-кода
router.post("/add", async(req, res) => {
    try {
        // создание нового промо-кода
        const newPromoCode = new PromoCode({
            code: req.body.code,
            isUsed: false,
            expires_at: req.body.expires_at
        });

        // сохранение 
        await newPromoCode.save();
        return res.status(200).json({status: "success", message: "Промо-код добавлен успешно!", newPromoCode});
    } catch (error) {
        console.error(error);
        return res.status(500).json({status: 'error', message: "Ошибка сервера" });
    }
});

// Изменение промо-кода
router.put("/:id", async(req, res) => {
    try {
        const promoCode = await PromoCode.findByIdAndUpdate(
            req.params.id,
            {
                $set: {
                    code: req.body.code,
                    expires_at: req.body.expires_at,
                    isUsed: req.body.isUsed
                },
            },
            {
                new: true
            }
        );

        if(!promoCode){
            return res.status(404).json({status: "warning", message: "Код не найден!"});
        }

        return res.status(200).json({status: "success", message: "Промо-код был изменен успешно!", promoCode});
    } catch (error) {
        console.error(error);
        return res.status(500).json({status: 'error', message: "Ошибка сервера" });
    }
});

// Удаление промо-кода
router.delete("/:id", async(req, res) => {
    try {
        const promoCode = await PromoCode.findByIdAndDelete(req.params.id);
        
        if(!promoCode) {
            return res.status(404).json({status: "warning",  message: "Промо-код не найден!"});
        }

        return res.status(200).json({status: "success", message: "Промо-код бьл успешно удален!"});
    } catch (error) {
        console.error(error);
        return res.status(500).json({status: 'error', message: "Ошибка сервера" });
    }
});

// Получение всех промо-кодов
router.get("/all", async(req, res) => {
    try {
        const promoCode = await PromoCode.find();
        return res.status(200).json(promoCode);
    } catch (error) {
        console.error(error);
        return res.status(500).json({status: 'error', message: "Ошибка сервера" });
    }
});

module.exports = router;
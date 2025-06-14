const VideoGroups = require("../models/VideoGroups");
const router = require("express").Router();

// Создание тэга
router.post("/addNewVideoGroup", async(req, res) => {
    try {
        // create group
        const NewGroup = new VideoGroups({
            groupname: req.body.groupname
        });

        // save group and respond
        const group = await NewGroup.save();
        res.status(200).json(group);
        console.log("Тэг был добавлен в корзину");
    } catch (error) {
        console.error(error);
        return res.status(500).json({status: 'error', message: "Ошибка сервера" });
    }
});

// Получение всех тэгов для видео
router.get('/all', async (req, res) => {
    try {
        const videogroups = await VideoGroups.find();

        if(!videogroups) {
            return res.status(404).json({status: "warning", message: 'Тэги не найдены'});
        }

        return res.status(200).json(videogroups);
    } catch (error) {
        console.error(error);
        return res.status(500).json({status: 'error', message: "Ошибка сервера" });
    }
});

// Получение конкретного тэга по id
router.get('/:id', async (req, res) => {
    try {
        const videogroup = VideoGroups.findById(req.params.id);

        if (!videogroup) {
            return res.status(404).json({status: "warning", message: 'Тэги не найдены' });
        }

        return res.status(200).json(videogroup);
    } catch (error) {
        console.error(error);
        return res.status(500).json({status: 'error', message: "Ошибка сервера" });
    }
});

// Редактирование тэга
router.put('/:id', async (req, res) => {
    try {
        const videogroup = await VideoGroups.findByIdAndUpdate(
            req.params.id,
            { $set: req.body }, // Устанавливаем новые значения
            { new: true } // Возвращаем обновлённый документ
        );
        return res.status(200).json({status: "success", message: "Тэг обновлен успешно!",videogroup});
    } catch (error) {
        console.error(error);
        return res.status(500).json({status: 'error', message: "Ошибка сервера" });
    }
});

// Удаление тэга
router.delete('/:id', async (req, res) => {
    try {
        await VideoGroups.findByIdAndDelete(req.params.id);
        return res.status(200).json({status: "warning", message:"Тэг был удален успешно!"});
    } catch (error) {
        console.error(error);
        return res.status(500).json({status: 'error', message: "Ошибка сервера" });
    }
});

module.exports = router;
const Video = require("../models/Video");
const router = require("express").Router();

// Получение всех видео из базы
router.get('/all', async (req, res) => {
    try {
        const { groupname } = req.query; // Получаем параметры из запроса
        let filter = {}; // объект фильтра
    
        if (groupname) {
            filter['tags.groupname'] = { $regex: groupname, $options: "i" };
        }

        const videos = await Video.find(filter); // Получаем все видео из базы
        return res.status(200).json(videos); // Отправляем список видео
    } catch (error) {
        console.error(error);
        return res.status(500).json({status: 'error', message: "Ошибка сервера" });
    }
});

// Получение конкретного видео по ID
router.get('/:id', async (req, res) => {
    try {
        const video = await Video.findById(req.params.id); // Ищем видео по ID

        if (!video) {
            return res.status(404).json({status:"error", message: 'Видео не найдено' });
        }

        res.status(200).json(video);
    } catch (error) {
        console.error(error);
        return res.status(500).json({status: 'error', message: "Ошибка сервера" });
    }
});

// Редактирование видео
// router.put("/:id", async (req, res) => {
//     try {
//         const video = await Video.findByIdAndUpdate(
//             req.params.id,
//             { $set: req.body }, // Устанавливаем новые значения
//             { new: true } // Возвращаем обновлённый документ
//         );

//         return res.status(200).json(video);
//     } catch (error) {
//         return res.status(500).json(error);
//     }
// });
router.put("/:id", async (req, res) => {
    try {
        const video = await Video.findByIdAndUpdate(
            req.params.id,
            { 
                $set: {
                    title: req.body.title,
                    description: req.body.description,
                    tags: req.body.tags // Передаём массив объектов с _id и groupname
                }
            }, 
            { new: true } // Возвращаем обновлённый документ
        );

        return res.status(200).json({status: "success", message: "Видео обновлено успешно!", video});
    } catch (error) {
        console.error(error);
        return res.status(500).json({status: 'error', message: "Ошибка сервера" });
    }
});

// Добавить лайк
router.put("/:id/like", async (req, res) => {
    try {
        const video = await Video.findById(req.params.id);

        if (!video) {
            return res.status(404).json({status: "warning", message: "Видео не найдено" });
        }

        video.likes = (video.likes || 0) + 1; // Увеличиваем лайки
        await video.save();

        res.status(200).json({status: "success", message: "Лайк добавлен", likes: video.likes });
    } catch (error) {
        console.error(error);
        return res.status(500).json({status: 'error', message: "Ошибка сервера" });
    }
});

// Удалить лайк
router.put("/:id/unlike", async (req, res) => {
    try {
        const video = await Video.findById(req.params.id);

        if (!video) {
            return res.status(404).json({status: "warning", message: "Видео не найдено" });
        }

        video.likes = Math.max(0, (video.likes || 0) - 1); // Уменьшаем лайки, но не ниже 0
        await video.save();

        res.status(200).json({status: "success", message: "Лайк удален", likes: video.likes });
    } catch (error) {
        console.error(error);
        return res.status(500).json({status: 'error', message: "Ошибка сервера" });
    }
});

// Добавить дизлайк
router.put("/:id/dislike", async (req, res) => {
    try {
        const video = await Video.findById(req.params.id);

        if (!video) {
            return res.status(404).json({status: "warning", message: "Видео не найдено" });
        }

        video.disLike = (video.disLike || 0) + 1; // Увеличиваем дизлайки
        await video.save();

        res.status(200).json({status: "success", message: "Дизлайк добавлен", disLike: video.disLike });
    } catch (error) {
        console.error(error);
        return res.status(500).json({status: 'error', message: "Ошибка сервера" });
    }
});

// Удалить дизлайк
router.put("/:id/undislike", async (req, res) => {
    try {
        const video = await Video.findById(req.params.id);

        if (!video) {
            return res.status(404).json({status: "warning", message: "Видео не найдено" });
        }

        video.disLike = Math.max(0, (video.disLike || 0) - 1); // Уменьшаем дизлайки, но не ниже 0
        await video.save();

        res.status(200).json({status: "success", message: "Дизлайк удален", disLike: video.disLike });
    } catch (error) {
        console.error(error);
        return res.status(500).json({status: 'error', message: "Ошибка сервера" });
    }
});

// Добавить комментарий
router.put("/:id/comment", async (req, res) => {
    try {
        const video = await Video.findById(req.params.id);

        // Проверка на наличие видео
        if (!video) {
            return res.status(404).json({status: "warning", message: "Видео не было найдно"});
        }

        // Проверка на наличие комментариев, иначе пустой массив
        if(!video.comments) {
            video.comments = [];
        }

        // Добавляем новый комментарий
        video.comments.push({
            userName: req.body.userName || "",
            text: req.body.text || ""
        });

        // Сохраняем изменения
        await video.save();

        return res.status(200).json({status: "success", message:"Комментарий был успешно добавлен"});
    } catch (error) {
        console.error(error);
        return res.status(500).json({status: 'error', message: "Ошибка сервера" });
    }
});

// Редактировать комментарий
router.put("/:id/comment/:commentId", async (req, res) => {
    try {
        const { id, commentId } = req.params;
        const { userName, text } = req.body;

        // Находим Видео
        const video = await Video.findById(id);
        
        // Проверка на наличие видео
        if (!video) {
            return res.status(404).json({status: "warning", message: "Видео не было найдно"});
        }

        const comment = video.comments.id(commentId);
        // Проверка на наличие комментария к видео
        if (!comment) {
            return res.status(404).json({status: "warning", message: "Комментарий не было найден"});
        }

        // Обновляем данные комментария
        if (userName !== undefined) comment.userName = userName;
        if (text !== undefined) comment.text = text;

        // Сохраняем изменения
        await video.save();

        return res.status(200).json({status: "success", message: "Комментарий был успешно обновлен"});

    } catch (error) {
        console.error(error);
        return res.status(500).json({status: 'error', message: "Ошибка сервера" });
    }
});

// Удалить комментарий
router.delete("/:id/comment/:commentId", async (req, res) => {
    try {
        const { id, commentId } = req.params;
        
        // Находим и обновляем видео, удаляя комментарий из массива
        const updateVideo = await Video.findByIdAndUpdate(
            id,
            { $pull: { comments: {_id : commentId}}}, // Удаление комментария по _id
            { new: true} // Чтобы вернуть обновленное видео
        );

        if (!updateVideo) {
            return res.status(404).json({status: "warning", message: "Видео не было найдено"});
        }
        
        return res.status(200).json({status: "success", message: "Комментарий был успешно удален"});
        
    } catch (error) {
        console.error(error);
        return res.status(500).json({status: 'error', message: "Ошибка сервера" });
    }
});

// Удаление видео
router.delete("/:id", async(req, res) => {
    try {
        await Video.findByIdAndDelete(req.params.id);
        return res.status(200).json({status: "success", message: "Видео было удалено"});
    } catch (error) {
        console.error(error);
        return res.status(500).json({status: 'error', message: "Ошибка сервера" });
    }
});

// Получить все комментарии
router.get("/:id/comments", async (req, res) => {
    try {
        const video = await Video.findById(req.params.id);

        if (!video) {
            return res.status(404).json({status: "warning", message: "Видео не найдено" });
        }

        return res.status(200).json(video.comments);
    } catch (error) {
        console.error(error);
        return res.status(500).json({status: 'error', message: "Ошибка сервера" });
    }
});

module.exports = router;
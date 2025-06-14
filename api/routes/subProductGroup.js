const SubProductGroup = require('../models/SubProductGroups');
const router = require("express").Router();

// Добавление новой Подгруппы к опрделенной группе по id группы
router.post("/:groupId", async(req, res) => {
    try {
        // создание подгруппы (объект)
        const NewsubGroup = new SubProductGroup({
            groupId: req.params.groupId,
            subgroupname: req.body.subgroupname
        });

        const subGroup = await NewsubGroup.save();
        console.log("Успешно добавлена подгруппа");
        return res.status(200).json({status: "success", message: "Добавлена подгруппа к группе успешно!",subGroup});
    } catch (error) {
        console.error(error);
        return res.status(500).json({status: 'error', message: "Ошибка сервера" });
    }
});

// Получение всех подгрупп
router.get("/all", async (req, res) => {
    try {
        const allSubGroups = await SubProductGroup.find();
        return res.status(200).json(allSubGroups);
    } catch (error) {
        console.error(error);
        return res.status(500).json({status: 'error', message: "Ошибка сервера" });
    }
});

// Получение поддгруппы по id
router.get("/:id", async(req, res) => {
    try {
        const subGroup = await SubProductGroup.findById(req.params.id);
        
        if(!subGroup) {
            return res.status(404).json({status: "success", message: "Подгруппа не была найдена"});
        }
        
        return res.status(200).json(subGroup);     
    } catch (error) {
        console.error(error);
        return res.status(500).json({status: 'error', message: "Ошибка сервера" });
    }
});

// Удаление подгруппы по id
router.delete("/:id", async(req, res) => {
    try {
        const deleteSubGroup = await SubProductGroup.findByIdAndDelete(req.params.id);
        
        if(!deleteSubGroup) {
            res.status(404).json({status: "warning", message: "Подгруппа не была найдена"});
        }
        
        return res.status(200).json({status: "success", message: "Подгруппа была успешно удалена"});
    } catch (error) {
        console.error(error);
        return res.status(500).json({status: 'error', message: "Ошибка сервера" });
    }
});

// Изменение подгруппы по id
router.put("/:id", async(req, res) => {
    try {
        const updateSubGroup = await SubProductGroup.findByIdAndUpdate(
            req.params.id,
            {
                $set: {
                    groupId: req.body.groupId,
                    subgroupname: req.body.subgroupname
                },
            },
            {new: true}
        );

        if (!updateSubGroup) {
            return res.status(404).json({status: "warning", message: "Подгруппа не была найдена"});
        }

        console.log("Подгруппа была успешно обновлена");
        return res.status(200).json({status: "success", message: "Подгруппа была успешно обновлена",updateSubGroup});
    } catch (error) {
        console.error(error);
        return res.status(500).json({status: 'error', message: "Ошибка сервера" });
    }
});

module.exports = router;
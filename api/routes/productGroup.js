const ProductGroup = require('../models/ProductGroup');
const router = require("express").Router();

// Add new group
router.post("/addNewGroup", async(req, res) => {
    try {
        // create group
        const NewGroup = new ProductGroup({
            groupname: req.body.groupName
        });

        // save group and respond
        const group = await NewGroup.save();
        return res.status(200).json({status: "success", message: "Группа была добавлена успешно!", group});
    } catch (error) {
        console.error(error);
        return res.status(500).json({status: 'error', message: "Ошибка сервера" });
    }
});

// Update group by ID
router.put("/:id", async(req, res) => {
    try {
        const updateGroup = await ProductGroup.findByIdAndUpdate(
            req.params.id,
            {
                $set: { // Update name of group and other fields
                    groupname: req.body.name
                },
            },
            {new: true} // return new group
        );

        // If group does not exist
        if(!updateGroup){
            return res.status(404).json({status: "warning", message: "Group not found"});
        }

        return res.status(200).json({status: "success", message: "Карточка обновлена успешно!", updateGroup});
    } catch (error) {
        console.error(error);
        return res.status(500).json({status: 'error', message: "Ошибка сервера" });
    }
});

// Delete group by ID
router.delete("/delete/:id", async(req, res) => {
    try {
        const deleteGroup = await ProductGroup.findByIdAndDelete(req.params.id);

        // if group not exist
        if(!deleteGroup){
            return res.status(404).json({status: "warning", message: "Group not found"});
        }

        return res.status(200).json({status: "success", message: "Group deleted successfully"});
    } catch (error) {
        console.error(error);
        return res.status(500).json({status: 'error', message: "Ошибка сервера" });
    }
});

// Get all groups of products
router.get("/all", async(req, res) => {
    try {
        const groups = await ProductGroup.find(); // Get all groups from DB
        res.status(200).json(groups);
    } catch (error) {
        console.error(error);
        return res.status(500).json({status: 'error', message: "Ошибка сервера" });
    }
});

router.get("/:id", async(req, res) => {
    try {
        const group = await ProductGroup.findById(req.params.id) // Get group by id
        res.status(200).json(group);
    } catch (error) {
        console.error(error);
        return res.status(500).json({status: 'error', message: "Ошибка сервера" });
    }
});

module.exports = router;
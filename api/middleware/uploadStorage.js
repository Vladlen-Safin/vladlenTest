const multer = require("multer");
const { GridFsStorage } = require("multer-gridfs-storage");
const dotenv = require('dotenv');

dotenv.config();

// Создаем хранилище GridFS
const storage = new GridFsStorage({
  url: process.env.MONGO || 'mongodb+srv://ismailovakamilla193:Love_anime19@clustervkr.nm7uq.mongodb.net/VKR',
  file: (req, file) => {
    console.log("FILE: ", file);
    
    return {
      filename: `${Date.now()}-${file.originalname}`, // Уникальное имя файла
      bucketName: "uploads", // Должно совпадать с gfs.collection()
    };
  },
});

const upload = multer({ storage });

module.exports = upload
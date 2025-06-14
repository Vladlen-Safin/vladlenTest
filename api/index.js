const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const Video = require('./models/Video');
const PromoCode = require('./models/PromoCode')

const authRoute = require("./routes/auth");
const cardRoute = require("./routes/admin");
const productGroup = require("./routes/productGroup");
const cartRoute = require("./routes/cart");
const recipeRoute = require("./routes/recipe");
const userRoute = require("./routes/users")
const havasRoute = require("./routes/havas");
const subGroupRoute = require("./routes/subProductGroup");
const videoRoute = require("./routes/video");
const transactionRoute = require("./routes/transaction");
const receiptRoute = require("./routes/receipt");
const analyticsRoute = require("./routes/analytics");
const videoGroupsRoute = require("./routes/videoGroups");
const promoCodeRoute = require("./routes/promoCode");

// Импорт Telegram-бота (запускается автоматически)
require('./middleware/telegramBot');

const Grid = require("gridfs-stream");
const upload = require("./middleware/uploadStorage");

// Авторизация через гугл
const passport = require('passport');
const session = require('express-session');
const MongoStore = require('connect-mongo');
require('./config/passport')(passport)

const { GridFSBucket } = require("mongodb");


const PORT = process.env.PORT || 3010;
const app = express();
const db = 'mongodb+srv://ismailovakamilla193:Love_anime19@clustervkr.nm7uq.mongodb.net/VKR'

mongoose
    .connect(db)
    .then((res) => {console.log('Connected to DB')})
    .catch((err) => {console.log(err)});

dotenv.config();
app.use(express.json());
app.use(cors());
app.use(express.json());

// Initialize middleware and setup database for storing sessions.
app.use(express.urlencoded({extended:true}))
app.use(
  session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO, 
      ttl: 14 * 24 * 60 * 60, // время жизни сессии (в секундах)
    }),
    cookie: {
      maxAge: 60 * 60 * 1000, // 60 минут в миллисекундах
      httpOnly: true,
      sameSite: 'lax',
    }
  })
);
  // Passport middleware
app.use(passport.initialize())
app.use(passport.session())


const conn = mongoose.connection;

// Инициализация GridFS
let gfs;
conn.once("open", () => {
  gfs = Grid(conn.db, mongoose.mongo);
  gfs.collection("uploads"); // Коллекция для хранения файлов
});

// Загрузка изображения
app.post("/upload", upload.single("file"), (req, res) => {
    res.json({ file: req.file });
  });
  
// Получение изображения по имени
app.get("/image/:filename", async (req, res) => {
  try {
      const bucket = new GridFSBucket(conn.db, { bucketName: "uploads" });

      // Проверяем, есть ли файл в базе
      const file = await conn.db.collection("uploads.files").findOne({ filename: req.params.filename });

      if (!file) {
          return res.status(404).json({ message: "Файл не найден" });
      }

      // Проверяем, является ли файл изображением
      if (!file.contentType.includes("image")) {
          return res.status(400).json({ message: "Файл не является изображением" });
      }

      // Создаем поток чтения из GridFSBucket
      const readStream = bucket.openDownloadStreamByName(req.params.filename);
      res.set("Content-Type", file.contentType);
      readStream.pipe(res);
  } catch (error) {
      console.error("Ошибка при получении изображения:", error);
      res.status(500).json({ message: "Ошибка сервера" });
  }
});

// Работа над шортсами

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure Multer for video upload
const storage = multer.memoryStorage();
const uploadVideo = multer({ storage: storage });

// Загрузка видео
app.post('/upload/video', uploadVideo.single('video'), async (req, res) => {
    try {
      // Check if req.file is defined
      if (!req.file || !req.file.buffer) {
        return res.status(400).json({ error: 'No file provided in the request' });
      }
  
      // Upload video to Cloudinary
      const result = await cloudinary.uploader.upload_stream({ resource_type: 'video' }, async (error, result) => {
        if (error) {
          console.error('Error uploading to Cloudinary:', error);
          return res.status(500).json({ error: 'Error uploading to Cloudinary' });
        }
  
        // Save video details to MongoDB with Cloudinary URL
        const video = new Video({
          title: req.body.title || 'Untitled Video',
          videoUrl: result.secure_url,
          description: req.body.description,
          likes: req.body.likes || 0,
          disLike: req.body.disLike || 0
        });
  
        await video.save();
  
        res.status(201).json({ message: 'Video uploaded successfully'});
      }).end(req.file.buffer);
    } catch (error) {
      console.error('Error uploading video:', error);
      res.status(500).json({ error: 'Error uploading video' });
    }
});

app.use(express.json()); // парсер JSON
app.use('/auth', authRoute);
app.use('/admin', cardRoute);
app.use('/productGroup', productGroup);
app.use('/cart', cartRoute);
app.use('/recipe', recipeRoute);
app.use('/user', userRoute);
app.use('/havas', havasRoute);
app.use('/subgroup', subGroupRoute);
app.use('/video', videoRoute);
app.use('/transaction', transactionRoute);
app.use('/receipt', receiptRoute);
app.use('/analytics', analyticsRoute);
app.use('/videoGroups', videoGroupsRoute);
app.use('/promocode', promoCodeRoute);

app.listen(PORT, ()=> {
    console.log(`Server listening on ${PORT}`);
});

// Функция update карт 
// const updateAllCards = async () => {
//   try {
//       const result = await Card.updateMany(
//           { stockPercent: { $exists: false } }, // Найти карточки без isStock
//           { $set: { stockPercent: 0 } } // Добавить isStock: false
//       );
//       console.log(`Updated ${result.modifiedCount} cards, added isStock: false`);
//   } catch (error) {
//       console.error("Error updating cards:", error);
//   }
// };
// // Вызов функции (используй в скрипте или при инициализации сервера)
// updateAllCards();
// Функция генерации случайного промокода
// function generateCode(index) {
//   return `BONUS-${String(index).padStart(3, '0')}`; // Пример формата: BONUS-001
// }
// // Функция для создания и сохранения 50 промокодов
// async function generatePromoCodes() {
//   const promoCodes = [];

//   for (let i = 1; i <= 50; i++) {
//     const code = generateCode(i);
//     promoCodes.push({
//       code,
//       isUsed: false,
//       expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // срок годности 30 дней от текущей даты
//     });
//   }

//   try {
//     await PromoCode.insertMany(promoCodes);
//     console.log('50 промокодов успешно созданы');
//   } catch (err) {
//     console.error('Ошибка при создании промокодов:', err);
//   }
// }

// generatePromoCodes()
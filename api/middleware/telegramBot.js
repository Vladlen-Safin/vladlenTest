const TelegramBot = require('node-telegram-bot-api');
const dotenv = require('dotenv');
const QRCode = require("qrcode");
const fs = require('fs');
const path = require('path');
const PromoCode = require("../models/PromoCode"); 

dotenv.config();

const bot = new TelegramBot(process.env.API_KEY_BOT, {
    polling: {
        interval: 300,
        autoStart: true
    }
});

console.log("Telegram Bot has been started");

process.removeAllListeners('warning');  // Это удаляет все слушатели предупреждений
process.on('warning', (warning) => {
    if (warning.name !== 'DeprecationWarning') {
        console.warn(warning.name, warning.message);
    }
});

bot.on("polling_error", (err) => {
    console.error("Polling error:", err?.response?.error || err.message || err);
  }); 

const commands = [

    {
        command: "start",
        description: "Запуск бота"
    },
    {
        command: "code",
        description: "Получить уникальный код"
    },
    {
        command: "qrcode",
        description: "Получить уникальный QR-код"
    },
    {
        command: "menu",
        description: "Меню"
    }

]

bot.setMyCommands(commands);

bot.on('text', async msg => {
    try {
        const chatId = msg.chat.id;
        const youtubeLink = "https://www.youtube.com/watch?v=dQw4w9WgXcQ";

        if (msg.text === '/start') {
            await bot.sendMessage(chatId, 'Вы запустили бота!');
        } else if (msg.text === '/code') {
            const promoCodes = await PromoCode.find({ isUsed: false });

            if (!promoCodes || promoCodes.length === 0) {
                await bot.sendMessage(chatId, 'Промокоды закончились или возникла ошибка!');
                return;
            }

            const randomIndex = Math.floor(Math.random() * promoCodes.length);
            const selectedPromo = promoCodes[randomIndex];

            // Отправляем код пользователю
            await bot.sendMessage(chatId, 'Ваш уникальный код: ' + selectedPromo.code);

            // Удаляем из локального массива, если нужно
            promoCodes.splice(randomIndex, 1);

        } else if (msg.text === '/qrcode') {
            const youtubeLink = "https://www.youtube.com/watch?v=dQw4w9WgXcQ";
            
            // Генерация QR-кода
            const qrBuffer = await QRCode.toBuffer(youtubeLink);

            // Сохраняем QR-код в файл
            const filePath = path.join(__dirname, 'qrcode.png');
            fs.writeFileSync(filePath, qrBuffer);

            // Отправляем QR-код как фото
            await bot.sendPhoto(msg.chat.id, filePath, {
                caption: 'Вот ваш QR-код для сканирования'
            });

            // Удаляем файл после отправки
            fs.unlinkSync(filePath);
        } else if(msg.text == '/menu') {

            await bot.sendMessage(msg.chat.id, `Меню бота`, {
        
                reply_markup: {
        
                    keyboard: [
        
                        ['⭐️ QR-код'],
                        ['⭐️ Уникальный код'],
                        ['❌ Закрыть меню']
        
                    ],
                    resize_keyboard: true
        
                }
        
            })
        
        } else if(msg.text == '⭐️ QR-код') {
            const youtubeLink = "https://www.youtube.com/watch?v=dQw4w9WgXcQ";
            
            // Генерация QR-кода
            const qrBuffer = await QRCode.toBuffer(youtubeLink);

            // Сохраняем QR-код в файл
            const filePath = path.join(__dirname, 'qrcode.png');
            fs.writeFileSync(filePath, qrBuffer);

            // Отправляем QR-код как фото
            await bot.sendPhoto(msg.chat.id, filePath, {
                caption: 'Вот ваш QR-код для сканирования'
            });

            // Удаляем файл после отправки
            fs.unlinkSync(filePath);
        } else if(msg.text == '⭐️ Уникальный код') {
            
            const promoCodes = await PromoCode.find({ isUsed: false });

            if (!promoCodes || promoCodes.length === 0) {
                await bot.sendMessage(chatId, 'Промокоды закончились или возникла ошибка!');
                return;
            }

            const randomIndex = Math.floor(Math.random() * promoCodes.length);
            const selectedPromo = promoCodes[randomIndex];

            // Отправляем код пользователю
            await bot.sendMessage(chatId, 'Ваш уникальный код: ' + selectedPromo.code);

            // Удаляем из локального массива, если нужно
            promoCodes.splice(randomIndex, 1);
            
        } else if(msg.text == '❌ Закрыть меню') {
            await bot.sendMessage(msg.chat.id, 'Меню закрыто', {
                reply_markup: {
                    remove_keyboard: true
                }
            })
        } else {
            await bot.sendMessage(chatId, 'Неизвестная команда. Используйте /start, /code или /qrcode.');
        }
    } catch (error) {
        console.error(error);
        await bot.sendMessage(msg.chat.id, 'Произошла ошибка. Попробуйте позже.');
    }
});

const express = require("express");
const router = express.Router();
const PDFDocument = require("pdfkit");
const Transaction = require("../models/Transaction");
const cartSchema = require("../models/cartSchema");
const QRCode = require("qrcode");
const path = require("path");

// Generate and display PDF receipt
router.get("/:transactionId/receipt", async (req, res) => {
    try {
        // Find transaction by transactionId
        const transaction = await Transaction.findById(req.params.transactionId);
        const cart = await cartSchema.findById(transaction.cart).populate("items.cardId");

        if (!transaction) {
            return res.status(404).json({status:"warning", message: "Транзакция не найдена!" });
        }

        // YouTube link to encode in QR
        const youtubeLink = "https://www.youtube.com/watch?v=dQw4w9WgXcQ";

        // Generate QR Code
        const qrCodeImage = await QRCode.toDataURL(youtubeLink);

        // Create PDF document
        const doc = new PDFDocument();
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", `inline; filename=receipt_${transaction._id}.pdf`);

        doc.pipe(res);
        
        // Use standard font
        doc.font(path.join(__dirname, "../fonts/arialmt.ttf"));

        // Header
        doc.fontSize(20).text("Квитанция", { align: "center" }).moveDown(1);
        doc.fontSize(14).text(`Транзакция: ${transaction._id}`);
        doc.text(`Дата: ${new Date(transaction.createdAt).toLocaleString()}`);
        doc.text(`Итоговая сумма: ${transaction.amount} USD`);
        doc.text(`Тип оплаты: ${transaction.paymentType === 0 ? "Наличные" : "Карта"}`);

        // Card ID if payment type is card
        if (transaction.paymentType === 1 && transaction.cardId) {
            doc.text(`Card ID: ${transaction.cardId}`);
        }

        doc.moveDown(1);
        doc.fontSize(16).text("Состав корзины:", { underline: true }).moveDown(0.5);

        // Проверяем, существует ли корзина и содержит ли она товары
        if (cart && Array.isArray(cart.items) && cart.items.length > 0) {

            cart.items.forEach((item, index) => {
                const totalPrice = item.quantity * item.cardId.price; // Рассчитываем стоимость товара

                // Выравниваем элементы в строку
                doc
                    .fontSize(14)
                    .text(`${index + 1}. ${item.name} - ${item.quantity} шт`, 50, doc.y, { width: 300 })
                    .text(`${totalPrice} SUMM`, 400, doc.y-10); // Выводим цену справа
            });
        } else {
            doc.fontSize(14).text("No items in cart.");
        }

        doc.moveDown(2);
        doc.text("Спасибо за покупку!", { align: "center" });

        // Add QR code with YouTube link
        // doc.image(qrCodeImage, { fit: [150, 150], align: "center" });
        // doc.moveDown(1);
        // doc.text("Сканируйте QR-код для получения дополнительной информации", { align: "center" });

        // Вставляем QR-код слева и текст справа
        const qrX = 50; // X-координата QR-кода
        const qrY = doc.y + 20; // Y-координата QR-кода

        doc.image(qrCodeImage, qrX, qrY, { width: 150, height: 150 });

        const textX = qrX + 150; // Размещаем текст правее QR-кода
        const textY = qrY + 40; // Смещаем текст по центру QR-кода

        doc.fontSize(14).text("Сканируйте QR-код для получения дополнительной информации", textX, textY);


        doc.end();
    } catch (error) {
        console.error(error);
        return res.status(500).json({status: 'error', message: "Ошибка сервера" });
    }
});

module.exports = router;

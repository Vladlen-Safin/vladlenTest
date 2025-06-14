const bcrypt = require('bcryptjs');
const User = require("../models/User");
const express = require('express');
const passport = require('passport');
const router = require("express").Router();
const { ensureAuth } = require('../middleware/auth')

//REGISTER  "type": "module",
router.post("/register", async(req, res) => {
    try {
        const existingUser = await User.findOne({ email: req.body.email });
        if (existingUser && existingUser.googleId) {
            return res.status(400).json({status: "error", message: "Пользователь уже зарегистрирован через Google" });
        }

        if (existingUser) {
            return res.status(400).json({status: "error", message: "Email уже используется" });
        }

        //generate new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(req.body.password, salt);

        //create new user
        const newUser = new User({
            username: req.body.username,
            email: req.body.email,
            password: hashedPassword,
        });

        //save user and respond
        const user = await newUser.save();
        res.status(200).json(user);
        console.log("Added user for DB")
    }
    catch (err) {
        console.error(error);
        return res.status(500).json({status: 'error', message: "Ошибка сервера" });
    }
})

//LOGIN
router.post("/login", async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email });
        if (!user) return res.status(404).json({status: "error", message:"Пользователь не найден"});

        const validPassword = await bcrypt.compare(req.body.password, user.password);
        if (!validPassword) return res.status(400).json({status: "error", message:"Неверный пароль"});

        res.status(200).json(user);
    } catch (err) {
        console.error(error);
        return res.status(500).json({status: 'error', message: "Ошибка сервера" });
    }
});

// НОВАЯ ЛОГИКА ДЛЯ АВТОРИЗАЦИИ ЧЕРЕЗ ГУГЛ
// Инициирует процесс авторизации через Google
router.get('/google', passport.authenticate('google', { scope: ['profile','email'] }));

// Обрабатывает ответ от Google и возвращает данные пользователя в случае успешной авторизации
router.get("/google/callback", passport.authenticate('google', { failureRedirect: "http://localhost:3000/" }), (req, res) => {
    res.redirect(`${process.env.FRONTEND_URL}?user=${encodeURIComponent(JSON.stringify(req.user))}`);
});

// Завершает сессию пользователя
router.get('/logout', (req, res) => {
    req.logout(function(err) {
        if (err) { return next(err); }
        res.redirect("http://localhost:3000/");
    });    
}); 

// Возвращает данные пользователя, если он авторизован
router.get("/log",ensureAuth, async(req,res)=>{
    res.status(200).json(req.user);
});

// Проверяет авторизацию пользователя и возвращает данные или ошибку в зависимости от статуса авторизации
router.get("/me", (req, res) => {
    if (req.isAuthenticated()) {
      res.status(200).json(req.user);
    } else {
      res.status(401).json({ message: "Unauthorized" });
    }
});

module.exports = router;
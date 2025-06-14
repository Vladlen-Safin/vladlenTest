import axios from "axios";
import React, { useRef } from "react";
import { useNavigate } from "react-router";
import "./register.css";
import {notify} from "../../Middleware/toast"

export default function Register() {
    const username = useRef();
    const email = useRef();
    const password = useRef();
    const passwordAgain = useRef();
    const navigate = useNavigate();

    const handleClick = async (e) => {
        e.preventDefault();

        passwordAgain.current.setCustomValidity("");

        if (passwordAgain.current.value !== password.current.value) {
            passwordAgain.current.setCustomValidity("Passwords don't match!");
        } else {
            const user = {
                username: username.current.value,
                email: email.current.value,
                password: password.current.value,
            };
            try {
                const response = await axios.post(`${process.env.REACT_APP_BACKEND}auth/register`, user);
                const {status, message} = response.data;
                notify(status, message);
                navigate('/');
            } catch (error) {
                if (error.response) {
                    const { status, message } = error.response.data;
                    notify(status || 'error', message || 'Что-то пошло не так!');
                } else {
                    notify('error', 'Возникла ошибка на стороне сервера!');
                }
            }
        }
    };

    const moveLogin = (e) => {
        e.preventDefault();
        navigate('/');
    };

    return (
        <div className="register-container">
            <form onSubmit={handleClick} className="register-form">
                <h1 className="register-title">Register</h1>
                <input 
                    type="text" 
                    placeholder="Username" 
                    ref={username} 
                    required 
                    className="register-input"
                />
                <input 
                    type="email" 
                    placeholder="Email" 
                    ref={email} 
                    required 
                    className="register-input"
                />
                <input 
                    type="password" 
                    placeholder="Password" 
                    ref={password} 
                    required 
                    className="register-input"
                />
                <input 
                    type="password" 
                    placeholder="Password again" 
                    ref={passwordAgain} 
                    required 
                    className="register-input"
                />
                <button type="submit" className="register-button">Sign up</button>
                <button onClick={moveLogin} className="login-button">Log into account</button>
            </form>
        </div>
    );
}

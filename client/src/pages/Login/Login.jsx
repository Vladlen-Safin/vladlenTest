import React, { useContext, useRef } from "react";
import { AuthContext } from "../../context/AuthContext";
import { loginCall } from "../../apiCalls";
import { useNavigate } from "react-router-dom";
import { notify} from "../../Middleware/toast"
import "./login.css";

const Login = ({ setIsLoginModalOpen }) => { // Используем правильное имя пропса
    const email = useRef();
    const password = useRef();
    const { dispatch } = useContext(AuthContext);
    const navigate = useNavigate();

    // const handleClick = (e) => {
    //     e.preventDefault();
    //     loginCall(
    //         { email: email.current.value, password: password.current.value },
    //         dispatch
    //     );
    //     alert("Authorization was completed successfully");
    //     setIsLoginModalOpen(false); // Закрыть модальное окно после успешной авторизации
    //     navigate("/"); // Перенаправить на главную страницу
    // };
    const handleClick = async (e) => {
        e.preventDefault();
    
        const result = await loginCall(
            { email: email.current.value, password: password.current.value },
            dispatch
        );
    
        if (result.success) {
            notify("success", "Авторизация прошла успешно!");
            setIsLoginModalOpen(false);
            navigate("/");
        } else {
            if (result.error.split(' ').pop() === "400") {
                notify("error", "Неверный пароль!");
            } else if (result.error.split(' ').pop() === "404") {
                notify("error", "Пользователь не найден!")
            } else {
                notify("error", "Возникла ошибка на стороне сервера!");
            }
        }
    };
    

    const moveRegis = (e) => {
        e.preventDefault();
        navigate('/register');
    };

    const handleClickGoogle = (e) => {
        e.preventDefault();
        window.location.href = `${process.env.REACT_APP_BACKEND}auth/google`; // Перенаправляем на серверный маршрут /google
    };
      
    return (
        <div className="modal-overlay">
            <div className="modal-container">
                <button className="close-button" onClick={() => setIsLoginModalOpen(false)}>x
                </button>
                <form onSubmit={handleClick} className="login-form">
                    <h1 className="login-title">Login</h1>
                    <input 
                        type="email" 
                        placeholder="Email" 
                        required 
                        ref={email} 
                        className="login-input"
                    />
                    <input 
                        type="password" 
                        placeholder="Password" 
                        required 
                        ref={password} 
                        className="login-input"
                    />
                    <button className="login-button">Login</button>
                    <button onClick={moveRegis} className="register-button">Sign up</button>
                    <br /> <br />
                    <button onClick={handleClickGoogle} className="register-button">
                        Login with Google
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;

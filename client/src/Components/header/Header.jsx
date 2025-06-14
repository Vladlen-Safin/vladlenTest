import { useState, useContext, useEffect } from "react";
import { AuthContext } from "../../context/AuthContext";
import logo from "../../images/logohavas.png";
import Login from "../../pages/Login/Login"; // Убедитесь, что путь правильный
import Profile from "../../pages/Profile/Profile"; // Импортируйте новый компонент для профиля
import { Link, useNavigate } from "react-router-dom"; // Импортируйте Link
import "./header.css";
import { FaUser} from "react-icons/fa";
import { SlSocialInstagram } from "react-icons/sl";
import { LiaTelegramPlane } from "react-icons/lia";
import { ImFacebook2 } from "react-icons/im";
import { PiFilmSlateDuotone } from "react-icons/pi"
import { TiAdjustBrightness } from "react-icons/ti";
import { TiAdjustContrast } from "react-icons/ti";
import axios from "axios";

export default function Header({ searchItem }) {
    const { user, logout } = useContext(AuthContext); // Получаем информацию о пользователе
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false); // Состояние для открытия/закрытия модального окна логина
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false); // Состояние для открытия/закрытия модального окна профиля
    const [searchTerm, setSearchTerm] = useState("");
    const navigate = useNavigate();
    const [isDark, setIsDark] = useState(false); // тестируем темную тему

    const handleSearch = async () => {
        searchItem(searchTerm);
    };

   const handleLogin = () => {
    setIsLoginModalOpen(true); // Открытие модального окна для логина
  };

  const handleProfile = () => {
    setIsProfileModalOpen(true); // Открытие модального окна для профиля
  };

  const handleLogout = async () => {
    logout();
    await axios.get(`${process.env.REACT_APP_BACKEND}auth/logout`);
  };

  const handleMainPage = () => {
    navigate("/");
    window.location.reload();
  }

  // === Подключаем Google Translate ===
  useEffect(() => {
    const addGoogleTranslateScript = () => {
      if (window.googleTranslateElementInit) return;

      window.googleTranslateElementInit = function () {
        new window.google.translate.TranslateElement(
          { pageLanguage: "ru" },
          "google_translate_element"
        );
      };

      const script = document.createElement("script");
      script.src =
        "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      script.async = true;
      document.body.appendChild(script);
    };

    addGoogleTranslateScript();
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    setIsDark(saved === "dark");
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark-theme", isDark);
    localStorage.setItem("theme", isDark ? "dark" : "light");
  }, [isDark]);

    return(
        <>
        <header>
      {/* <div className="logo">
          <img src={logo} alt="Логотип Havas" width="50" />
        <Link to="/">
          <span>Havas</span> <br/>
        </Link>
      </div> */}
      <div className="logo">
          <img src={logo} alt="Логотип Havas" width="50" />
          <span onClick={handleMainPage} style={{ cursor: 'pointer' }}>
              Havas
          </span> <br/>
      </div>
      <div className="buttoncontainer">
        <div className="contacts">
          <a href="tel:+998712059595" className="header-phone">
            +998(71)205-95-95
          </a>
          <div className="socials">
            <a href="https://www.instagram.com/havasuz/" target="_blank" rel="noopener noreferrer">
              <SlSocialInstagram/>
            </a>
            <a href="https://www.facebook.com/havasuz" target="_blank" rel="noopener noreferrer">
              <ImFacebook2 />
            </a>
            <a href="https://t.me/havasuz" target="_blank" rel="noopener noreferrer">
              <LiaTelegramPlane />
            </a>
            {/* <button onClick={() => setIsDark(prev => !prev)}>
              {isDark ? "Светлая тема" : "Тёмная тема"}
            </button> */}
            <button onClick={() => setIsDark(prev => !prev)}>
              {isDark ? <TiAdjustBrightness/> : <TiAdjustContrast />}
            </button>
          </div>
        </div>

        <div className="search-bar">
        <input
            type="text"
            placeholder="Искать в Havas"
            value={searchTerm}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            onChange={(e) => setSearchTerm(e.target.value)}
        />
          <button className="search-button" onClick={handleSearch}>Поиск</button>
        </div>
        <div className="login">
        {user ? (
              <>
                <button
                  className="Profile" onClick={handleProfile}>
                 <FaUser/>
                </button>

                <button className="Enter" onClick={handleLogout}>
                  Выйти
                </button>
              </>
            ) : (
              <button className="Enter" onClick={handleLogin}>
                Войти
              </button>
            )}
          </div>
            <div className="login">
              <Link to="/shorts" className="shorts-link">
                <span className="shorts-icon">
                <PiFilmSlateDuotone />
                </span>
              </Link>
            </div>
            {/* === Кнопка Google Translate === */}
            <div id="google_translate_element"></div>
      </div>
            </header>
            {isLoginModalOpen && <Login setIsLoginModalOpen={setIsLoginModalOpen} />}
            {isProfileModalOpen && <Profile setIsProfileModalOpen={setIsProfileModalOpen} />}
        </>
    );
 }
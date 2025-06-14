import "./firstPage.css"
import React, { useState, useContext, useEffect } from "react";
import Header from "../../Components/header/Header";
import LeftContainer from "../../Components/LeftContainer/left-container";
import RightContainer from "../../Components/RightContainer/right-container";
import CentralContainer from "../../Components/CentralContainer/centralContainer";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";

export default function FirstPage() {

    const { dispatch } = useContext(AuthContext);
    const navigate = useNavigate();

    // Состояния для хранения выбранных группы и подгруппы
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [selectedSubGroup, setSelectedSubGroup] = useState(null);
    const [searchItem, setSearchItem] = useState(null);
    const [selectedRecipe, setSelectedRecipe] = useState(null);

    useEffect(() => {
        // Получаем данные пользователя из URL
        const queryParams = new URLSearchParams(window.location.search);
        const userJson = queryParams.get("user");
    
        if (userJson) {
          const user = JSON.parse(decodeURIComponent(userJson));
          
          // Записываем данные о пользователе в контекст
          dispatch({ type: "LOGIN_SUCCESS", payload: user });
    
          // Перенаправляем пользователя на главную страницу
          navigate("/");
        }
      }, [dispatch, navigate]);

    return(
        <div className="allcontainers">
            <Header
                searchItem={setSearchItem}
            />
            <div className="app-container">
                <div className="left-container fixed-left">
                    <LeftContainer
                        onGroupSelect={setSelectedGroup} 
                        onSubGroupSelect={setSelectedSubGroup}
                        onRecipeSelect={setSelectedRecipe}
                    />
                </div>
                <div className="center-container">
                    <CentralContainer
                        selectedGroup={selectedGroup} 
                        selectedSubGroup={selectedSubGroup}
                        searchItem={searchItem}
                        selectedRecipe={selectedRecipe}
                    />
                </div>
                <div className="right-container">
                    <RightContainer />
                </div>
            </div>
        </div>
    );
}
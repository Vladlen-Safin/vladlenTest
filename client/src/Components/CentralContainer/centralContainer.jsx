import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import axios from "axios";
import CardDetails from "../../pages//CardDetails//CardDetails";
import { Link } from "react-router-dom";
import "./centralContainer.css";

export default function CentralContainer({ selectedGroup, selectedSubGroup, searchItem, selectedRecipe }) {
    const [cards, setCards] = useState([]);
    const [selectedCardId, setSelectedCardId] = useState(null);
    const [arrRecipe, setArrRecipe] = useState([]);
    const [getNeedGroup, setNeedGroup] = useState(null);
    const [group, setGroup] = useState(null);
    const [subGroup, setSubGroup] = useState(null);
    const [isSorted, setIsSorted] = useState(true);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showRecipes, setShowRecipes] = useState(false);

    // Управление отображением рецептов и карточек
    useEffect(() => {
        if (selectedRecipe) {
            setShowRecipes(true);
            setIsSorted(false);
        } else if (selectedGroup || selectedSubGroup || searchItem) {
            setShowRecipes(false);
            setIsSorted(true);
        }
    }, [selectedRecipe, selectedGroup, selectedSubGroup, searchItem]);

    useEffect(() => {
        if (selectedGroup) {
            setGroup(selectedGroup);
            setSubGroup(null);
        } else if (selectedSubGroup) {
            setSubGroup(selectedSubGroup);
            setGroup(null);
        }
    }, [selectedGroup, selectedSubGroup]);

    const filterGroup = subGroup || group;

    useEffect(() => {
        const fetchCards = async () => {
            try {
                const response = await axios.get(process.env.REACT_APP_BACKEND + "admin/all");
                setCards(response.data);
            } catch (err) {
                setError("Ошибка при загрузке карточек");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        const fetchArrRecipe = async () => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_BACKEND}recipe/all`);
                setArrRecipe(response.data);
            } catch (error) {
                setError("Ошибка при загрузке рецептов");
            } finally {
                setLoading(false);
            }
        };

        fetchCards();
        fetchArrRecipe();
    }, []);

    useEffect(() => {
        const fetchFiltergroup = async () => {
            try {
                if (filterGroup) {
                    const url = selectedGroup
                        ? `${process.env.REACT_APP_BACKEND}productGroup/${filterGroup}`
                        : `${process.env.REACT_APP_BACKEND}subgroup/${filterGroup}`;

                    const response = await axios.get(url);
                    if (!response.data) {
                        setError("Группа или подгруппа не найдена");
                    }
                    setNeedGroup(response.data);
                }
            } catch (error) {
                setError("Ошибка при получении данных");
            } finally {
                setLoading(false);
            }
        };

        fetchFiltergroup();
    }, [filterGroup]);

    useEffect(() => {
        const fetchFilterCards = async () => {
            try {
                let url = process.env.REACT_APP_BACKEND + "admin/all";

                if (getNeedGroup) {
                    const tag = getNeedGroup.subgroupname ? getNeedGroup.subgroupname : getNeedGroup.groupname;
                    const tagType = getNeedGroup.subgroupname ? "subTag" : "tag";
                    url += `?${tagType}=${tag}`;
                }

                const response = await axios.get(url);
                setCards(response.data);
            } catch (err) {
                setError("Ошибка при фильтрации карт");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchFilterCards();
    }, [getNeedGroup]);

    useEffect(() => {
        const fetchSearchCards = async () => {
            try {
                if (searchItem) {
                    const response = await axios.get(process.env.REACT_APP_BACKEND + `admin/all?name=${searchItem}`);
                    setCards(response.data);
                }
            } catch (error) {
                setError("Ошибка при поиске карт");
            } finally {
                setLoading(false);
            }
        };

        fetchSearchCards();
    }, [searchItem]);

    if (loading) return <p>Loading...</p>;
    if (error) return <p>{error}</p>;

    return (
        <div className="central-container">
            <h2>{showRecipes ? "Recipes" : "Product Cards"}</h2>

            {/* Отображаем рецепты, если showRecipes === true */}
            {showRecipes && (
                <div className="cards-list">
                    {arrRecipe.length > 0 ? (
                        arrRecipe.map((recipe) => (
                            <div key={recipe._id} className="recipe-card">
                                <h3>{recipe.nameRecipe}</h3>
                                <img src={recipe.photo || ""} alt="фотка" className="custom-image"/>
                                <Link className="details-button" to={`/recipe/${recipe._id}`}>
                                    Подробнее
                                </Link>
                            </div>
                        ))
                    ) : (
                        <p>Рецепты не найдены.</p>
                    )}
                </div>
            )}

            {/* Отображаем карточки продуктов, если isSorted === true */}
            {isSorted && (
                <div className="cards-list">
                    {cards.length > 0 ? (
                        cards.map((card) => (
                            <div key={card._id} className="card">
                                {/* Значок скидки, если есть */}
                                {card.isStock && (
                                    <div className="discount-badge">
                                        -{card.stockPercent}%
                                    </div>
                                )}
                                <h3>{card.name}</h3>
                                <img src={card?.photo} alt="" className="custom-image" />
                                <p>
                                    <strong>Цена:</strong> {card.price}<strong> сум</strong>
                                </p>
                                <button className="details-button" onClick={() => setSelectedCardId(card._id)}>
                                    Подробнее
                                </button>
                            </div>
                        ))
                    ) : (
                        <p>Нет доступных карточек.</p>
                    )}
                </div>
            )}

            {/* Модальное окно для деталей карточки */}
            {selectedCardId &&
                ReactDOM.createPortal(
                    <div className="modal">
                        <div className="modal-content">
                            <button className="close-button" onClick={() => setSelectedCardId(null)}>
                                ×
                            </button>
                            <CardDetails id={selectedCardId} />
                        </div>
                    </div>,
                    document.body
                )}
        </div>
    );
}

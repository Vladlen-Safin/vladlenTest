import React, { useState, useEffect, useContext, useRef } from "react";
import { Link } from "react-router-dom";
import Header from "../../Components/header/Header";
import { AuthContext } from "../../context/AuthContext";
import axios from "axios";
import "./payPage.css";
import AddressSelectorMap from "../../Components/YMaps/AddressSelectorMap";
import { notify } from "../../Middleware/toast";

export default function PayPage() {
    const [arrCart, setArrCart] = useState([]); // Айтемы корзины
    const [cart, setCart] = useState(null); // Корзина пользователя
    const [recipes, setRecipes] = useState([]); // Все рецепты
    const [filteredRecipes, setFilteredRecipes] = useState([]); // Состояние подхожящих рецептов
    const [selectedAddress, setSelectedAddress] = useState("Выберите адрес"); // Выбранный адрес
    const [arrAddress, setArrAddress] = useState([]);       // Состояние для массива адрессов
    const [isModalOpen, setIsModalOpen] = useState(false); // Состояние модального окна
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isExpanded, setIsExpanded] = useState(false); // Состояние раскрытия корзины
    // const [cutleryCount, setCutleryCount] = useState(1); // Количество приборов

    const { user } = useContext(AuthContext);

    const loyaltyCode = useRef();
    const isStockPay = useRef(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [cartResponse, recipesResponse, havasResponse] = await Promise.all([
                    axios.get(`${process.env.REACT_APP_BACKEND}cart/${user._id}`),
                    axios.get(`${process.env.REACT_APP_BACKEND}recipe/all`),
                    axios.get(`${process.env.REACT_APP_BACKEND}havas/all`)
                ]);

                setCart(cartResponse.data);
                setArrCart(cartResponse.data.items);
                setRecipes(recipesResponse.data);
                setArrAddress(havasResponse.data.filter((havas) => havas._id === user.address));
            } catch (error) {
                setError(error.response?.data?.message || error.message || "Произошла ошибка");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user?.address, user?._id]);

    useEffect(() => {
        if (recipes.length === 0 || arrCart.length === 0) return;
    
        // Получаем _id товаров из корзины
        const cartProductIds = arrCart
            .map(item => item.cardId?._id) // Берем _id из объекта cardId
            .filter(Boolean); // Убираем null/undefined
    
        let matchingRecipes = [];
    
        recipes.forEach(recipe => {
            // Получаем _id товаров из рецепта (учитываем, что cardId в рецепте — это строка)
            const recipeProductIds = recipe.items
                .map(item => item.cardId) // В рецепте cardId — это строка
                .filter(Boolean);
    
            const missingProducts = recipeProductIds.filter(id => !cartProductIds.includes(id)); // Не хватает в корзине
            const extraProducts = cartProductIds.filter(id => !recipeProductIds.includes(id)); // Лишние продукты в корзине
    
            // Оставляем только рецепты, у которых все продукты есть в корзине или максимум 1 лишний продукт
            if (missingProducts.length === 0 && extraProducts.length <= 3) {
                matchingRecipes.push(recipe);
            }
        });
    
        setFilteredRecipes(matchingRecipes);
    }, [recipes, arrCart]);
    
    

    if (loading) return <p>Загрузка...</p>;
    if (error) return <p>{error.message}</p>;

    // Получение итоговой суммы корзины
    const getTotalPrice = () => {
        return arrCart.reduce((total, item) => total + (item.cardId.price * item.quantity), 0);
    };

    // // Уменьшение количества приборов
    // const decreaseCutlery = () => {
    //     if (cutleryCount > 1) setCutleryCount(cutleryCount - 1);
    // };

    // // Увеличение количества приборов
    // const increaseCutlery = () => {
    //     setCutleryCount(cutleryCount + 1);
    // };

    // Оплата корзины
    const handlePayCart = async (e) => {
        try {
            const totalPrice = getTotalPrice();

            // Выполняем POST запрос
            const response = await axios.post(`${process.env.REACT_APP_BACKEND}transaction/${user._id}/transaction`, {
                amount: totalPrice,
                paymentType: user.paymentType,
                cardId: user.paymentCard[0]._id,
                cartId: cart._id,
                loyaltyCode: loyaltyCode.current.value,
                isStockPay: isStockPay.current.checked
            });
    
            // Проверяем успешность ответа
            if (response.status === 201) {
                // Выполняем DELETE запрос только если POST успешен
                //await axios.delete(`${process.env.REACT_APP_BACKEND}cart/${user._id}`);
                const { status, message} = response.data;
                notify( status, message);
            } else {
                notify("warning", "Ошибка при обработке транзакции");
            }
        } catch (error) {
           if (error.response) {
                const { status, message } = error.response.data;
                notify(status || 'error', message || 'Что-то пошло не так!');
            } else {
                notify('error', 'Возникла ошибка на стороне сервера!');
            }
        }
    };    

    // Очищение корзины пользователя
    const handleDeletUserCart = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.delete(`${process.env.REACT_APP_BACKEND}cart/${user._id}`);
            const { status, message} = response.data;
            notify(status, message);
        } catch (error) {
            if (error.response) {
                const { status, message } = error.response.data;
                notify(status || 'error', message || 'Что-то пошло не так!');
            } else {
                notify('error', 'Возникла ошибка на стороне сервера!');
            }
        }
    };

    // Удаление айтема из корзины
    // const handleDeleteItemFromCart = async (cardId) => {
    //     try {
    //         const response = await axios.delete(`${process.env.REACT_APP_BACKEND}cart/${user._id}/${cardId}`);
    //         const {status, message} = response.data;
    //         notify(status, message);
    //     } catch (error) {
    //         if (error.response) {
    //             const { status, message } = error.response.data;
    //             notify(status || 'error', message || 'Что-то пошло не так!');
    //         } else {
    //             notify('error', 'Возникла ошибка на стороне сервера!');
    //         }
    //     }
    // };

    const handleDeleteItemFromCart = async (cardId) => {
    try {
        const response = await axios.delete(`${process.env.REACT_APP_BACKEND}cart/${user._id}/${cardId}`);
        const { status, message } = response.data;
        notify(status, message);

        if (status === 'success') {
            // Обновляем состояние, удаляя айтем с id = cardId
            setArrCart(prevArrCart => prevArrCart.filter(item => item._id !== cardId));
        }
    } catch (error) {
        if (error.response) {
            const { status, message } = error.response.data;
            notify(status || 'error', message || 'Что-то пошло не так!');
        } else {
            notify('error', 'Возникла ошибка на стороне сервера!');
        }
    }
};

    const handleSelectAddress = (data) => {
        setSelectedAddress(data.address);
    };

    return (
        <>
            <Header />
            <div className="pagebackground">
                <h1>Страница оплаты</h1>
                <div className="paypage_main">
                    {/* Список рецептов */}
                    <div className="recipes_container">
                        <h1 className="section-title">Список подходящих рецептов</h1>
                        {filteredRecipes.length > 0 ? (
                            <ul className="recipes-list">
                                {filteredRecipes.map(recipe => (
                                    <li key={recipe._id}>
                                        <h3>{recipe.nameRecipe}</h3>
                                        <p>{recipe.descriptionRecipe}</p>
                                        <Link className="details-button" to={`/recipe/${recipe._id}`}>
                                            Подробнее
                                        </Link>
                                        <h3>Подходящие видео</h3>
                                        {recipe.tags.map((tag) => (
                                            <Link key={tag._id} to={`/shorts?groupname=${encodeURIComponent(tag.groupname)}`}>
                                                {tag.groupname}
                                            </Link>
                                        ))}
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p>Нет подходящих рецептов</p>
                        )}
                    </div>
    
                    {/* Блок доставки */}
                    <div className="delivery_container">
                        <div className="delivery_block_cart" onClick={() => setIsExpanded(!isExpanded)}>
                            <p>Выбранные продукты:</p>
                            <span className={`arrow ${isExpanded ? "up" : "down"}`}></span>
                        </div>
    
                        {isExpanded && arrCart.length > 0 && (
                            <div className="cart_items">
                                {arrCart.map((item) => (
                                    <div key={item._id} className="delivery_block_content">
                                        <div className="content_left_item">
                                            <img src={item.cardId.photo} alt={item.name} />
                                        </div>
                                        <div className="content_right_item">
                                            <p>{item.cardId.description} ({item.quantity})</p>
                                            <button onClick={() => handleDeleteItemFromCart(item._id)}>X</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
    
                        {isExpanded && arrCart.length === 0 && <p>Корзина пуста</p>}
                        <div className="delivery_block_cart">
                            <p>Выберите филиал</p>
                            {/* <input type="text" placeholder="Введите адрес" /> */}
                            <select>
                                {arrAddress.map(havas => (
                                    <option key={havas._id} value={havas.address}>{havas.address}</option>
                                ))}
                            </select>
                        </div>
                        <div className="delivery_block_cart">
                            <p>Выберите адрес доставки</p>
                            <input 
                                type="text" 
                                placeholder="Выберите адрес" 
                                value={selectedAddress} 
                                readOnly 
                                onClick={() => setIsModalOpen(true)} 
                            />
                        </div>
                        <div className="delivery_block_cart">
                            <h3>{user.username}</h3>
                            <p>{user.phone}</p>
                        </div>
                        <div className="delivery_block_cart">
                            <p>Как скоро доставить</p>
                            <select>
                                <option>как можно раньше</option>
                                <option>как обычно</option>
                            </select>
                        </div>
                        <div className="delivery_block_cart">
                            <p>Способ оплаты</p>
                            <select>
                                <option>наличные</option>
                                <option>картой</option>
                            </select>
                        </div>
                    </div>
    
                    {/* Блок оплаты */}
                    <div className="pay_container">
                        <h1>К оплате: {getTotalPrice()}</h1>
                        <input type="text" placeholder="Введите уникальный код лояльности" ref={loyaltyCode} /> <br /> <br />
                        <p>Уникальный код можно получить в телеграмм боте</p>
                        <a href="https://t.me/newBotElajha_bot">HavasBot</a><br /> <br />
                        <button className="paybutt" onClick={handlePayCart}>Оплатить</button> <br /> <br />
                        <h1>Ваши баллы: {user.loyalty.points}</h1>
                        <input type="checkbox" ref={isStockPay} /> Оплатить баллами
                        <button className="paybutt" onClick={handleDeletUserCart}>Очистить корзину</button>
                    </div>
                </div>
                {/* Модальное окно с картой */}
                {isModalOpen && (
                    <div className="modal-overlay">
                        <div className="modal-content">
                            <button className="close-button" onClick={() => setIsModalOpen(false)}>x</button>
                            <h2>Выберите адрес доставки</h2>
                            <AddressSelectorMap onSelectAddress={handleSelectAddress} />
                            <button className="confirm-btn" onClick={() => setIsModalOpen(false)}>
                                Подтвердить адрес
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
    
}

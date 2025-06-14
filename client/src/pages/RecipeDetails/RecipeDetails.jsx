import React, { useEffect, useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "./recipeDetails.css";
import { useParams } from "react-router-dom";
import ImageUploader from "../../Components/Test/testComp";
import SmartSelect from "../../Components/smartSelect/SmartSelect";
import { AuthContext } from "../../context/AuthContext";
import { notify } from "../../Middleware/toast"

export default function RecipeDetails() {
    const { id } = useParams(); // Получаем id рецепта из URL
    const { user } = useContext(AuthContext); // Использование контекста для проверка на Администратора
    const [recipe, setRecipe] = useState(null); // Состояние для рецепта по id
    const [recipePhoto, setRecipePhoto] = useState(""); // Состояние для фотки рецепта
    const [allSteps, setAllSteps] = useState([]); // Состояние для всех шагов
    const [allVideoGroups, setAllVideoGroups] = useState([]); // Состояние для массива тэгов для видео
    const [selectedVideoGroup, setSelectedVideoGroup] = useState([]); // Состояние для выбранных тэгов
    const [recipeVideoGroup, setRecipeVideoGroup] = useState([]); // Состояние для тэгов рецепта
    const [editedSteps, setEditedSteps] = useState({}); // Состояние для редактируемого шага
    const [allProducts, setAllProducts] = useState([]); // Состояние для всех продуктов
    const [allItems, setAllItems] = useState([]); // Состояние для всех интгредиентов
    const [selectedProducts, setSelectedProducts] = useState([]) // Массив продуктов
    const [newNameRecipe, setNewNameRecipe] = useState(null); // Состояние для изменения имени рецепта
    const [newDescriptionRecipe, setNewDescriptionRecipe] = useState(null); // Состояние для изменения описания рецепта
    const [allComments, setAllComments] = useState([]); // Состояение для комментариев рецепта
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    
    const [newComment, setNewComment] = useState({
        userName: user?.username || "", // Если user существует, берем user.username, иначе пустая строка
        text: ""
    });    

    useEffect(() => {
        const fetchRecipe = async () => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_BACKEND}recipe/${id}`);
                const { nameRecipe, descriptionRecipe, items, steps, comments, tags } = response.data;
    
                setRecipe(response.data);
                setSelectedProducts(items.map(({ cardId, name }) => ({ value: cardId, label: name })));
                setNewNameRecipe(nameRecipe);
                setNewDescriptionRecipe(descriptionRecipe);
                setAllSteps(steps);
                setAllItems(items);
                setAllComments(comments);
                setRecipeVideoGroup(tags);

                if(tags) {
                    const selectedTags = tags.map(tag => ({
                        value: tag._id,
                        label: tag.groupname
                    }));
                    setSelectedVideoGroup(selectedTags);
                }
            } catch (err) {
                setError("Ошибка при загрузке рецепта");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        const fetchArrayCards = async () => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_BACKEND}admin/all`);
                const responseVideoGroups = await axios.get(`${process.env.REACT_APP_BACKEND}videoGroups/all`)
                setAllProducts(response.data);
                setAllVideoGroups(responseVideoGroups.data);
            } catch (error) {
                setError(error);
            } finally {
                setLoading(false);
            }
        }
    
        fetchRecipe();
        fetchArrayCards();
    }, [id]);
    
    if (loading) return <p>Loading...</p>;
    if (error) return <p>{error}</p>;
    if (!recipe) return <p>Рецепт не найден.</p>;

    // Добавление нового шага
    const handleAddNewStep = async () => {
        try {
            const response = await axios.post(`${process.env.REACT_APP_BACKEND}recipe/${id}`, {
                stepDescription: "",
                stepImage: ""
            });
            setAllSteps([...allSteps, response.data.steps[response.data.steps.length - 1]]);
            const {status, message} = response.data;
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

    // Добавление нового ингредиента
    const handleAddNewItem = async () => {
        try {
            const response = await axios.post(`${process.env.REACT_APP_BACKEND}recipe/${id}/items`, {
                cardId: "",
                name: "",
                quantity: 0
            });
            setAllItems([...allItems, response.data.items[response.data.items.length - 1]]);
            const {status, message} = response.data;
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

    // Удаление шага
    const handleDelStep = async (stepId) => {
        try {
            const response = await axios.delete(`${process.env.REACT_APP_BACKEND}recipe/${id}/steps/${stepId}`);
            setAllSteps(allSteps.filter((s) => s._id !== stepId));
            const {status, message} = response.data;
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

    // Удаление ингредиента
    const handleDelItem = async (itemId) => {
        try {
            const response = await axios.delete(`${process.env.REACT_APP_BACKEND}recipe/${id}/items/${itemId}`);
            setAllItems(allSteps.filter((s) => s._id !== itemId));
            const {status, message} = response.data;
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

    // Обновление состояния при редактировании шага
    const handleChangeStep = (stepId, field, value) => {
        setEditedSteps(prev => ({
            ...prev,
            [stepId]: { ...prev[stepId], [field]: value }
        }));
    };

    // Сохранение изменений ингредиента
    const handleSaveItem = async (itemId) => {
        // Найти ингредиент в списке
        const item = allItems.find((i) => i._id === itemId);
        if (!item) {
            console.error("Ошибка: ингредиент не найден");
            return;
        }

        // Получить выбранный продукт и количество
        const selectedProduct = document.getElementById(`product-${itemId}`).value;
        const quantity = document.getElementById(`quantity-${itemId}`).value;

        if (!selectedProduct || quantity <= 0) {
            console.error("Ошибка: не выбран продукт или неверное количество");
            return;
        }

        try {
            // Отправить изменения на сервер
            const response = await axios.put(`${process.env.REACT_APP_BACKEND}recipe/${id}/items/${itemId}`, {
                cardId: selectedProduct, // ID выбранного продукта
                name: allProducts.find(p => p._id === selectedProduct)?.name || "Неизвестный продукт",
                quantity: parseInt(quantity, 10),
            });

            // Обновить состояние ингредиентов
            setAllItems(allItems.map(i => i._id === itemId ? response.data.updatedItem : i));

            // Обновление страницы
            const {status, message} = response.data;
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

    // Сохранение изменений шага
    const handleSaveStep = async (stepId) => {
        const stepData = editedSteps[stepId];
        if (!stepData) return;
        
        try {
            const response = await axios.put(`${process.env.REACT_APP_BACKEND}recipe/${id}/steps/${stepId}`, stepData);
            setAllSteps(allSteps.map(s => s._id === stepId ? response.data.updatedStep : s));
            setEditedSteps(prev => {
                const newState = { ...prev };
                delete newState[stepId];
                return newState;
            });
            const {status, message} = response.data;
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
    
    // Изменение рецепта
    const handleEditRecipe = async (e) => {
        e.preventDefault();
        
        if (selectedProducts.length === 0) {
            console.log("Ошибка: Не выбраны продукты");
            return;
        }

        // Создание массива продуктов с количеством
        const items = selectedProducts.map((product) => ({
            cardId: product.value, // ID продукта
            name: product.label,   // Название продукта
            //quantity: quantityRecipe.current.value // Количество (общая логика, можно сделать на каждое)
        }));

        const recipe = {
            nameRecipe: newNameRecipe,
            descriptionRecipe: newDescriptionRecipe,
            items,
            allSteps,
            photo: recipePhoto,
            tags: selectedVideoGroup
        };

        try {
            const response = await axios.put(process.env.REACT_APP_BACKEND + `recipe/${id}`, recipe);
            const {status, message} = response.data;
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

    // Удаление рецепта
    const handleDelRecipe = async (e) => {
        const isConfirmed = window.confirm("Вы уверены, что хотите удалить этот рецепт? Это действие необратимо!");
        if (!isConfirmed) return; // Если пользователь нажал "Отмена", прерываем функцию
        try {
            navigate("/");
            const response = await axios.delete(process.env.REACT_APP_BACKEND + `recipe/${id}`);
            const {status, message} = response.data;
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

    // Функция изменения значения инпутов
    const handleChangeComment = (e) => {
        setNewComment({
            ...newComment,
            [e.target.name]: e.target.value
        });
    };

    // Добавление комментария
    const handleAddNewComment = async () => {
        try {
            const response = await axios.put(`${process.env.REACT_APP_BACKEND}recipe/${id}/comment`, newComment);

            // Обновляем локально список комментариев
            setAllComments((prevComments) => [
                ...prevComments,
                { userName: newComment.userName, text: newComment.text }
            ]);

            // Обновляем комментарии в объекте рецепта
            setRecipe((prevRecipe) => ({
                ...prevRecipe,
                comments: [...prevRecipe.comments, newComment]
            }));

            // Очистка поля ввода
            setNewComment({ userName: user.username, text: "" });

            const {status, message} = response.data;
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

    // Удаление комментария
    const handleDelComment = async (commentId) => {
        try {
            const response = await axios.delete(`${process.env.REACT_APP_BACKEND}recipe/${id}/comment/${commentId}`);

            // Обновляем состояние Recipe, удаляя комментарий
            setRecipe((prevRecipe) => ({
                ...prevRecipe,
                comments: prevRecipe.comments.filter((comment) => comment._id !== commentId)
            }));

            const {status, message} = response.data;
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

    // Добавление в корзину всех айтомов 
    const handleAddFullCart = async () => {
        try {
            const response = await axios.post(`${process.env.REACT_APP_BACKEND}cart/add`, {
                userId: user?._id,
                items: allItems
            });
            const {status, message} = response.data;
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

    // Добавление фотки рецепту
    const handleImageUploadRecipe = (url) => {
        setRecipePhoto(url);
    };

    // Добавление тэга для видео рецепту
    const handleAddVideoGroup = async (e) => {
        try {

            const recipe = {
                tags: selectedVideoGroup.map(tag => ({
                    _id: tag.value, // ID тега
                    groupname: tag.label // Имя тега
                }))
            };

            const response = await axios.put(`${process.env.REACT_APP_BACKEND}recipe/${id}/video/add`, recipe);
            const {status, message} = response.data;
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

    // Удаление всех выбранных тэгов
    const handleDelVideoGroup = async (e) => {
        try {
            const recipe = {
                tags: selectedVideoGroup
            };

            const response = await axios.put(`${process.env.REACT_APP_BACKEND}recipe/${id}/video/del`, recipe);
            const {status, message} = response.data;
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

    // Подготовка данных для SmartSelect
    const formatOptions = (arr, valueKey, labelKey) =>
        arr.map(item => ({
            value: item[valueKey],
            label: item[labelKey]
    }));

    const videoGroupOptions = formatOptions(allVideoGroups, "_id", "groupname");

    return (
        <div className="full_white_bg">
        <div className="div_container">
            <h1>Название: {recipe.nameRecipe}</h1>
            <img src={recipe.photo} alt="Фотка" />
            <p>Описание: {recipe.descriptionRecipe}</p>
            <p>Теги: {recipeVideoGroup.length > 0 ? recipeVideoGroup.map(tag => tag.groupname).join(", ") : "Нет тегов"}</p>
            <h3>Ингредиенты:</h3>
            <ul>
                {recipe.items && Array.isArray(recipe.items) ? (
                    recipe.items.map((item) => (
                        <li key={item._id}>{item.name} — {item.quantity} шт.</li>
                    ))
                ) : (
                    <p>Ингредиенты отсутствуют</p>
                )}
            </ul>
            {allSteps && Array.isArray(allSteps) ? (
                <>
                    <h1>Шаги рецепта: </h1>
                    {allSteps.map((step) => (
                        <div key={step._id} className="main_step">
                            <div className="step_container">
                                <div className="step_img">
                                    <img src={step.stepImage} alt="" />
                                </div>
                                <div className="step_desc">
                                    <p>{step.stepDescription}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </>
            ) : (
                <p></p>
            )}
            
            <h1>Добавить комментарий</h1>
            <form onSubmit={(e) => e.preventDefault()}>
                <input 
                    type="text"
                    placeholder="Имя"
                    name="userName"
                    value={newComment.userName}
                    onChange={handleChangeComment}
                />
                <input 
                    type="text"
                    placeholder="Комментарий"
                    name="text"
                    value={newComment.text}
                    onChange={handleChangeComment}
                />
                <br />
                <button className="buttonrec" onClick={handleAddNewComment}>Добавить комментарий</button>
                <br /> <br />
            </form>
            {allComments && allComments.length > 0 ? (
                <>
                    <h1>Комментарии к рецепту</h1>
                    {allComments.map((comment) => (
                        <>
                            <div className="comment_container" key={comment._id}>
                                <h3>Пользователь: {comment.userName}</h3>
                                <p>{comment.text}</p>
                                <p>{comment.commentDate}</p>
                                <br /><br />
                                {user && user.isAdmin ? (
                                    <>
                                        <button className="buttonrec" onClick={() => handleDelComment(comment._id)}>Удалить комментарий</button>
                                        <br /> <br />
                                    </>
                                ): (
                                    <p></p>
                                )}
                            </div>
                        </>
                    ))}
                </>
            ): (
                <p></p>
            )}
            <Link to="/" className="details_recipe">На главную</Link>
            <button className="buttonrec" onClick={handleAddFullCart}> Добавить в корзину</button>
            {user && user.isAdmin ? (
                <>
                    <br /> <br />
                    <h1>Редактирование рецепта</h1>
                    <form>
                        <input 
                            type="text"
                            value={newNameRecipe}
                            onChange={(e) => setNewNameRecipe(e.target.value)}
                            placeholder="Название рецепта"
                        />
                        <input 
                            type="text"
                            value={newDescriptionRecipe}
                            onChange={(e) => setNewDescriptionRecipe(e.target.value)}
                            placeholder="Описание рецепта" 
                        />
                        <ImageUploader onUpload={handleImageUploadRecipe} />
                        <h1>Укажите тэги для подходящих видео</h1>
                        <SmartSelect 
                            options={videoGroupOptions}
                            setIsMilti={true}
                            selectedProducts={selectedVideoGroup}
                            setSelectedProducts={setSelectedVideoGroup}
                            placeholder="Выберите тэги для видео..."
                        /> <br /> <br />
                        <button className="buttonrec" onClick={handleAddVideoGroup}>Добавить тэги</button>
                        <br /> <br />
                        <button className="buttonrec" onClick={handleDelVideoGroup}>Убрать все тэги</button>
                        <br /> <br />
                        <button className="buttonrec" onClick={handleEditRecipe}>Изменить рецепт</button>
                        <br /> <br />
                        <button className="buttonrec" onClick={handleDelRecipe}>Удалить рецепт</button>
                    </form> <br /> <br />
                    <h1>Редактирование ингредиентов рецепта</h1>
                    {allItems.map((item) => (
                        <div key={item._id} className="items_container">
                            <select id={`product-${item._id}`} defaultValue={item.cardId || ""}>
                                <option value={item.name}>Выберите продукт</option>
                                {allProducts.map((product) => (
                                    <option key={product._id} value={product._id}>{product.name}</option>
                                ))}
                            </select>
                            <input 
                                id={`quantity-${item._id}`}
                                type="number"
                                defaultValue={item.quantity}
                                min="1"
                                placeholder="Количество"
                                required
                            />
                            <button className="buttonrec" onClick={() => handleSaveItem(item._id)}>Сохранить</button>
                            <br /><br />
                            <button className="buttonrec" onClick={() => handleDelItem(item._id)}>Удалить ингредиент</button>
                            <br /><br />
                        </div>
                    ))}
                    <button className="buttonrec" onClick={handleAddNewItem}>Добавить ингредиент</button>
                    <br /> <br />
                    <h1>Добавление шагов рецепта</h1>
                    <br /><br />
                    <button className="buttonrec" onClick={handleAddNewStep}>Добавить шаг</button>
                    {allSteps.map((step) => (
                        <div key={step._id} className="main_step">
                            <div className="step_container">
                                <div className="step_img">
                                    <ImageUploader onUpload={(url) => handleChangeStep(step._id, "stepImage", url)} />
                                </div>
                                <div className="step_desc">
                                    <textarea
                                        value={editedSteps[step._id]?.stepDescription || step.stepDescription}
                                        onChange={(e) => handleChangeStep(step._id, "stepDescription", e.target.value)}
                                    />
                                </div>
                            </div>
                            <button className="buttonrec" onClick={() => handleSaveStep(step._id)}>Сохранить шаг</button> <br /><br />
                            <button className="buttonrec"onClick={() => handleDelStep(step._id)}>Удалить шаг</button>
                        </div>
                    ))}
                </>
            ) : (
                <p></p>
            )}
        </div>
    </div>
    );
}

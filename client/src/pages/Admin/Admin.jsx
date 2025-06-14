import axios from "axios";
import React, { useRef, useEffect, useState } from "react";
import SmartSelect from "../../Components/smartSelect/SmartSelect";
import EditHavasForm from "../../Components/EditHavasForm/EditHavasForm";
import EditSubGroups from "../../Components/EditSubGroups/EditSubGroups";
import EditVideoGroup from "../../Components/EditVideoGroup/EditVideoGroup";
import EditVideoForm from "../../Components/EditVideo/EditVideoForm";
import AnalyticsComp from "../../Components/Analytics/Analytics";
import PromoCode from "../../Components/PromoCode/PromoCode";
import VideoEditor from "../../Components/Video/Video";
import Header from "../../Components/header/Header"
import "./admin.css"
import ImageUploader from "../../Components/Test/testComp";
import { notify } from "../../Middleware/toast";

export default function Admin() {
    const name = useRef();                                          // Название продукта
    const description = useRef();                                   // Описание продукта
    const conditions = useRef();                                    // Значение услвоий хранения
    const expiration_date = useRef();                               // Значение срока хранения    
    const kilo_kal = useRef();                                      // Значение килокалорией
    const belki = useRef();                                         // Значение белков
    const jiri = useRef();                                          // Значение жиров
    const uglevods = useRef();                                      // Значение углеводов
    const massa = useRef();                                         // Значение массы
    const price = useRef();
    const tag = useRef();                                           // Название тэга
    const subTag = useRef();                                        // Название подгруппы
    const nameGroup = useRef();                                     // Название группы
    const nameRecipe = useRef();                                    // Название рецепта
    const descriptionRecipe = useRef();                             // Описание рецепта
    const quantityRecipe = useRef();                                // Количество продуктов в рецепте
    const havasName = useRef();                                     // Подсказка магазина (краткое название)
    const havasAddress = useRef();                                  // адрес магазина
    const havasLatitude = useRef();                                 // широта
    const havasLongitude = useRef();                                // долгота
    const videoGroupName = useRef();                                // имя тэга

    const [arrGroups, setArrGroups] = useState([]);                 // массив для карт
    const [arrSubGroups, setArrSubGroups] = useState([]);           // Массив для подгрупп
    const [cards, setCards] = useState([]);                         // массив карточек (продуктов)
    const [selectedProducts, setSelectedProducts] = useState([]);    // Массив продуктов (вариант 2)
    const [arrStockProducts, setArrStockProducts] = useState([]);    // Массив акционных продуктов
    const [arrNonStockProducts, setArrNonStockProducts] = useState([]);    // Массив акционных продуктов
    const [stockProducts, setStockProducts] = useState([]);
    const [nonStockProducts, setnonStockProducts] = useState([]);
    const [discounts, setDiscounts] = useState({}); // Локальный state для скидок
    const [recipePhoto, setRecipePhoto] = useState("");             // Состояние для фотки рецепта
    const [selectUser, setSelectedUser] = useState();               // Состояние для выбранного пользователя не админ
    const [selectUserAdmin, setSelectedUserAdmin] = useState();     // Состояние для выбранного пользователя админа
    const [activeForm, setActiveForm] = useState(null);             // Состояние для открытых форм
    const [arrUsers, setArrUsers] = useState([]);                   // Состяние для всех пользователей
    const [arrAdminUsers, setArrAdminUsers] = useState([]);         // Состяние для пользователей админ
    const [erorr, setError] = useState(null);                       // оработка ошибок
    const [loading, setLoading] = useState(true);                   // загрузчик
   
    useEffect(() => {
        const fetchData = async (url, setter, transform = (data) => data) => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_BACKEND}${url}`);
                setter(transform(response.data));
            } catch (err) {
                setError(`Error fetching ${url}`);
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
    
        // Загружаем данные
        fetchData("productGroup/all", setArrGroups);
        fetchData("subgroup/all", setArrSubGroups);
        fetchData("user/all", (data) => {
            setArrUsers(data.filter(user => !user.isAdmin));
            setArrAdminUsers(data.filter(user => user.isAdmin));
        });
    
        fetchData("admin/all", (data) => {
            setCards(data);
            setArrStockProducts(data.filter(product => product.isStock));
            setArrNonStockProducts(data.filter(product => !product.isStock));
        });
    
    }, []);
    
    if (loading) return <p>Loading...</p>; // Индикация загрузки
    if (erorr) return <p>{erorr}</p>; // Вывод ошибки, если она возникла

    // Добавление карты продукта
    const handleClick = async (e) => {
        e.preventDefault();

        const card = {
            name: name.current.value,
            description: description.current.value,
            conditions: conditions.current.value,
            expiration_date: expiration_date.current.value,
            kilo_kal: kilo_kal.current.value,
            belki: belki.current.value,
            jiri: jiri.current.value,
            uglevods: uglevods.current.value,
            massa: massa.current.value,
            tag: tag.current.value,
            subGroup: subTag.current.value,
            price: price.current.value
        };

        try {
            const response = await axios.post(`${process.env.REACT_APP_BACKEND}admin/create`, card);
            const { status, message } = response.data;
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

    // Добавление группы
    const handleAddGroup = async (e) => {
        e.preventDefault();

        const group = {
            name: nameGroup.current.value
        };

        try {
            const response = await axios.post(process.env.REACT_APP_BACKEND + "productGroup/addNewGroup", group);
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

    // Добавление тэга для видео
    const handleAddNewVideoGroup = async (e) => {
        e.preventDefault();

        const group = {
            groupname: videoGroupName.current.value
        };

        try {
            const response = await axios.post(process.env.REACT_APP_BACKEND + "videoGroups/addNewVideoGroup", group);
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

    // Добавление нового рецепта
    const handleAddNewRecipe = async (e) => {
        e.preventDefault();
    
        if (selectedProducts.length === 0) {
            console.log("Ошибка: Не выбраны продукты");
            return;
        }

        // Создание массива продуктов с количеством
        const items = selectedProducts.map((product) => ({
            cardId: product.value, // ID продукта
            name: product.label,   // Название продукта
            quantity: quantityRecipe.current.value, // Количество (общая логика, можно сделать на каждое)
            photo: recipePhoto
        }));
    
        const recipe = {
            nameRecipe: nameRecipe.current.value,
            descriptionRecipe: descriptionRecipe.current.value,
            items
        };
    
        console.log("Отправка рецепта:", recipe);
    
        try {
            const response = await axios.post(process.env.REACT_APP_BACKEND + "recipe/add", recipe);
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

    // Добавление нового магазина
    const handleAddNewHavas = async (e) => {
        e.preventDefault();
        
        try {
            const newHavas = {
                address: havasAddress.current.value,
                city: havasName.current.value,
                coordinates: {
                    latitude: parseFloat(havasLatitude.current.value), // Широта
                    longitude: parseFloat(havasLongitude.current.value) // Долгота
                }
            };
    
            const response = await axios.post(process.env.REACT_APP_BACKEND + "havas/add", newHavas);
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

    // Добавление администратора
    const handleAddNewAdmin = async (e) => {
        try {
            console.log(selectUserAdmin);
            const response = await axios.put(`${process.env.REACT_APP_BACKEND}user/${selectUser.value}/admin`);
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

    // Удаление администратора
    const handleDelNewAdmin = async (e) => {
        try {
            console.log(selectUserAdmin);
            const response = await axios.put(`${process.env.REACT_APP_BACKEND}user/${selectUserAdmin.value}/admin`);
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

    // Добавление акционного товара
    const handleAddStockProducts = async (e) => {
        e.preventDefault();

        try {
            const response = await axios.put(
                `${process.env.REACT_APP_BACKEND}admin/addStock`,
                { products: stockProducts }, // Заворачиваем в объект с ключом "products"
                {
                    headers: {
                        "Content-Type": "application/json", // Указываем корректный заголовок
                    },
                }
            );
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

    // Удаление акционного товара
    const handleDelStockProduct = async (e) => {
        e.preventDefault();

        try {
            const response = await axios.put(
                `${process.env.REACT_APP_BACKEND}admin/delStock`,
                { products: nonStockProducts }, // Заворачиваем в объект с ключом "products"
                {
                    headers: {
                        "Content-Type": "application/json", // Указываем корректный заголовок
                    },
                }
            );
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

    // Обновление скидки при вводе в инпут
    const handleDiscountChange = (cardID, value) => {
        setDiscounts((prev) => ({
            ...prev,
            [cardID]: value
        }));
    };

    // Отправка скидки на сервер
    const handleAddStockPercent = async (cardID) => {
        try {
            const response = await axios.put(`${process.env.REACT_APP_BACKEND}admin/addStock/${cardID}`, {
                stockPercent: discounts[cardID] || 0
            });

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

    // Удаление скидки по id
    const handleDelStockPercent = async (cardID, stockPercent) => {
        try {
            const response = await axios.put(`${process.env.REACT_APP_BACKEND}admin/delStock/${cardID}`, {
                stockPercent
            });

            const { status, message} = response.data;
            notify(status, message);

            // Обновляем state, убирая скидку
            setDiscounts((prev) => ({
                ...prev,
                [cardID]: 0
            }));
        } catch (error) {
            if (error.response) {
                const { status, message } = error.response.data;
                notify(status || 'error', message || 'Что-то пошло не так!');
            } else {
                notify('error', 'Возникла ошибка на стороне сервера!');
            }
        }
    };

    // Функция для преобразования массива в нужный формат
    const formatOptions = (arr, valueKey, labelKey) =>
        arr.map(item => ({
            value: item[valueKey],
            label: item[labelKey]
    }));

    // Фотография для рецепта
    const handleAddRecipePhoto = (url) => {
        setRecipePhoto(url);
    };

    // Используем универсальную функцию для преобразования
    const productOptions = formatOptions(cards, "_id", "name");
    const userOptions = formatOptions(arrUsers, "_id", "username");
    const adminUserOptions = formatOptions(arrAdminUsers, "_id", "username");
    const stockProductsOptions = formatOptions(arrStockProducts, "_id", "name");
    const nonStockProductsOptions = formatOptions(arrNonStockProducts, "_id", "name");


    // функция отображения форм
    const renderForm = () => {
        switch(activeForm) {
            case "addCard":
                return(
                    <>
                        <div className="container_block">
                            <h1>Form for add new card!</h1>
                            <form onSubmit={handleClick}>
                            <input type="text" placeholder="Название" ref={name} />
                            <input type="text" placeholder="Описание" ref={description} />
                            <input type="text" placeholder="Условия хранения" ref={conditions} />
                            <input type="number" step="any" placeholder="Срок годности (дни)" ref={expiration_date}  />
                            <input type="number" step="any" placeholder="Калорийность (кКал)" ref={kilo_kal}  />
                            <input type="number" step="any" placeholder="Белки (г)" ref={belki}  />
                            <input type="number" step="any" placeholder="Жиры (г)" ref={jiri}  />
                            <input type="number" step="any" placeholder="Углеводы (г)" ref={uglevods}  />
                            <input type="number" step="any" placeholder="Масса (кг)" ref={massa}  />
                            <input type="number" step="any" placeholder="Цена" ref={price}  />
                                {/* Выпадающий список для тега */}
                                <select ref={tag}>
                                    <option value="">Select tag</option>
                                    {arrGroups.map(group => (
                                        <option key={group._id} value={group.groupname}>{group.groupname}</option>
                                    ))}
                                </select>
                                <h1>Выберите подгруппу</h1>
                                <select ref={subTag}>
                                    <option value="">Select Sub Tag</option>
                                    {arrSubGroups.map(subGroup => (
                                        <option key={subGroup._id} value={subGroup.subgroupname}>{subGroup.subgroupname}</option>
                                    ))}
                                </select> 
                                <button type="submit">Create card</button>
                            </form>
                        </div>
                    </>
                );
            case "addGroup":
                return(
                    <>
                        <div className="container_block">
                            <h1>Form for add new group of products</h1>
                            <form onSubmit={handleAddGroup}>
                                <input type="text" placeholder="Name of group" ref={nameGroup} required />
                                <button type="submit">Create group</button>
                            </form>
                            <br />
                        </div>
                    </>
                );
            case "addRecipe":
                return(
                    <>
                        <div className="container_block">
                            <h1>Новый рецепт</h1>
                            <form onSubmit={handleAddNewRecipe}>
                                <input type="text" placeholder="Название" ref={nameRecipe} required />
                                <input type="text" placeholder="Описание" ref={descriptionRecipe} required />

                                {/* SmartSelect для выбора нескольких продуктов */}
                                <SmartSelect 
                                    options={productOptions}
                                    setIsMilti={true}
                                    selectedProducts={selectedProducts} 
                                    setSelectedProducts={setSelectedProducts}
                                    setPlaceholder="Выберите продукты..." 
                                />

                                <input type="number" placeholder="Количество" ref={quantityRecipe} min="1" defaultValue="1" required />
                                <ImageUploader onUpload={handleAddRecipePhoto} />
                                <button type="submit">Создать</button>
                            </form>
                            <br />
                        </div>
                    </>
                );
            case "addHavas":
                return(
                    <>
                        <div className="container_block">
                            <h1>Добавление нового магазина</h1>
                            <form>
                                <input type="text" placeholder="Адресс" ref={havasAddress}/>
                                <input type="text" placeholder="Заголовок" ref={havasName}/>
                                <h1>Координаты</h1>
                                <input type="number" placeholder="Широта" ref={havasLatitude}/>
                                <input type="number" placeholder="Долгота" ref={havasLongitude}/>
                                <button type="submit" onClick={handleAddNewHavas}>Добавить</button>
                            </form>
                            <br />
                        </div>
                    </>
                );
            case "editHavas":
                return(
                    <>
                        <div className="container_block">
                            <EditHavasForm />
                        </div>
                    </>
                );
            case "editSubGroup":
                return(
                    <>
                        <div className="container_block">
                            <EditSubGroups />
                        </div>
                    </>
                );
            case "addVideo":
                return(
                    <>
                        <div className="container_block">
                            <VideoEditor />
                            <br />
                        </div>
                    </>
                );
            case "analytics":
                return(
                    <>
                        <div className="container_block">
                            <AnalyticsComp />
                        </div>
                    </>
                );
            case "addAdmin":
                return(
                    <div className="container_block">
                        <h1>Добавление нового администратора</h1> <br />
                        <SmartSelect 
                            options={userOptions}
                            setPlaceholder="Выберите нового администратора"
                            setSelectedProducts={setSelectedUser}
                        /> <br />
                        <button type="submit" onClick={handleAddNewAdmin}>Добавить </button>
                        <br /><br />
                        <h1>Удаление прав администратора</h1> <br />
                        <SmartSelect 
                            options={adminUserOptions}
                            setPlaceholder="Выберите нового администратора"
                            setSelectedProducts={setSelectedUserAdmin}
                        /> <br />
                        <button type="submit" onClick={handleDelNewAdmin}>Убрать</button>
                    </div>
                );
            case "stockCard":
                return(
                    <>
                        <div className="container_block">
                            <h1>Добалвение акционных товаров</h1> <br />
                            <SmartSelect 
                                options={nonStockProductsOptions}
                                setPlaceholder="Выберите продукты"
                                
                                setSelectedProducts={setStockProducts}
                                setIsMilti={true}
                            /> <br />
                            <button type="submit" onClick={handleAddStockProducts}>Добавить</button>
                            <br /><br />
                            <h1>Удаление акционных товаров</h1> <br />
                            <SmartSelect 
                                options={stockProductsOptions}
                                setPlaceholder="Выберите продукт"
                                setSelectedProducts={setnonStockProducts}
                                setIsMilti={true}
                            /> <br />
                            <button type="submit" onClick={handleDelStockProduct}>Удалить акционный товар</button>
                            <h1>Индивидуальные скидки</h1>
                            {arrStockProducts.length > 0 && (
                                <div className="stock_container">
                                    {arrStockProducts.map((card) => (
                                        <div key={card._id}>
                                            <p>Название: {card.name}</p>
                                            <p>Цена: <strong>{card.price}</strong></p>
                                            <p>Скидка: <strong>{card.stockPercent}%</strong></p>

                                            <input
                                                type="number"
                                                placeholder="Введите скидку (%)"
                                                value={discounts[card._id] ?? card.stockPercent} // Значение из state или с сервера
                                                onChange={(e) => handleDiscountChange(card._id, e.target.value)}
                                            />
                                            
                                            <button type="submit" onClick={() => handleAddStockPercent(card._id)}>Сохранить скидку</button>
                                            <button type="submit" onClick={() => handleDelStockPercent(card._id, card.stockPercent)}>Удалить скидку</button>
                                            <br />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </>
                );
            case "editVideo":
                return(
                    <>
                        <div className="container_block">
                            <EditVideoForm />
                        </div>
                    </>
                );
            case "addVideoGroup":
                return(
                    <>
                        <div className="container_block">
                            <h1>Добавление тэга для видео</h1>
                            <form onSubmit={handleAddNewVideoGroup}>
                                <input type="text" placeholder="Name of group" ref={videoGroupName} required />
                                <button type="submit">Создать</button>
                            </form>
                            <br />
                        </div>
                    </>
                );
            case "editVideoGroup":
                return(
                    <>
                        <div className="container_block">
                            <EditVideoGroup />
                        </div>
                    </>
                );
            case "addEditPromoCode":
                return(
                    <>
                        <div className="container_block">
                            <PromoCode />
                        </div>
                    </>
                );
            default:
                return(
                    <>
                        <div className="container_block">
                            <h1>Form for add new card!</h1>
                            <form onSubmit={handleClick}>
                            <input type="text" placeholder="Название" ref={name}  />
                            <input type="text" placeholder="Описание" ref={description}  />
                            <input type="text" placeholder="Условия хранения" ref={conditions} />
                            <input type="number" step="any" placeholder="Срок годности (дни)" ref={expiration_date}  />
                            <input type="number" step="any" placeholder="Калорийность (кКал)" ref={kilo_kal}  />
                            <input type="number" step="any" placeholder="Белки (г)" ref={belki}  />
                            <input type="number" step="any" placeholder="Жиры (г)" ref={jiri}  />
                            <input type="number" step="any" placeholder="Углеводы (г)" ref={uglevods}  />
                            <input type="number" step="any" placeholder="Масса (кг)" ref={massa}  />
                            <input type="number" step="any" placeholder="Цена" ref={price}  />
                                {/* Выпадающий список для тега */}
                                <select ref={tag}>
                                    <option value="">Select tag</option>
                                    {arrGroups.map(group => (
                                        <option key={group._id} value={group.groupname}>{group.groupname}</option>
                                    ))}
                                </select>
                                <h1>Выберите подгруппу</h1>
                                <select ref={subTag}>
                                    <option value="">Select Sub Tag</option>
                                    {arrSubGroups.map(subGroup => (
                                        <option key={subGroup._id} value={subGroup.subgroupname}>{subGroup.subgroupname}</option>
                                    ))}
                                </select> 
                                <button type="submit">Create card</button>
                            </form>
                        </div>
                    </>
                );
        }
    };

    return(
        <>
            <Header />
            <div className="main_containe_admin">
                <div className="add_div_container">
                    <button  onClick={() => setActiveForm("addCard")}>Добавить карточку продукта</button>
                    <button  onClick={() => setActiveForm("addGroup")}>Добавить группу</button>
                    <button  onClick={() => setActiveForm("editSubGroup")}>Добавить подгруппу</button>
                    <button  onClick={() => setActiveForm("addRecipe")}>Добавить рецепт</button>
                    <button  onClick={() => setActiveForm("addHavas")}>Добавить новый магазин</button>
                    <button  onClick={() => setActiveForm("editHavas")}>Редактировать магазин</button>
                    <button  onClick={() => setActiveForm("addVideo")}>Добавить видео</button>
                    <button  onClick={() => setActiveForm("editVideo")}>Редактировать видео</button>
                    <button  onClick={() => setActiveForm("addVideoGroup")}>Добавление тэга для видео</button>
                    <button  onClick={() => setActiveForm("editVideoGroup")}>Редактирование тэга для видео</button>
                    <button onClick={() => setActiveForm("addAdmin")}>Добавление администратора</button>
                    <button onClick={() => setActiveForm("analytics")}>Аналитика</button>
                    <button onClick={() => setActiveForm("stockCard")}>Акционные товары</button>
                    <button onClick={() => setActiveForm("addEditPromoCode")}>Промо-коды</button>
                </div>
                <div className="function_container">
                    {renderForm()}
                </div>
            </div>
        </>
    )
}
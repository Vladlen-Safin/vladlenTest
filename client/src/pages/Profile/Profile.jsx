import React, { useState, useEffect, useContext, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import ImageUploader from "../../Components/Test/testComp";
import "./profile.css";
import axios from "axios";
import { notify} from "../../Middleware/toast";

const Profile = ({ setIsProfileModalOpen }) => {

  const cardFIO = useRef();                                   // Ссылка на FIO 
  const cardNUM = useRef();                                   // Ссылка на NUM
  const cardMMY = useRef();                                   // Ссылка на MM/YY 
  const cardCVV = useRef();                                   // Ссылка на код cvv

  const [userProfile, setUserProfile] = useState(null);       // Состояние профиля пользователя
  const [arrCart, setArrCart] = useState([]);                 // Состояние массива корзины
  const [cart, setCart] = useState(null);                     // Состояние корзины пользователя
  const [recipes, setRecipes] = useState([]);                 // Состояние всех рецептов
  const [filteredRecipes, setFilteredRecipes] = useState([]); // Состояние подхожящих рецептов
  const [isEditMode, setIsEditMode] = useState(false);        // Состояние модального окна
  const [isEditPay, setIsEditPay] = useState(false);          // Состояние окна типа оплаты
  const [isTransaction, setIsTransaction] = useState(false);  // Состояние окна транзакций
  const [allTransaction, setAllTransaction] = useState([]);   // Состояние всех транзакций
  const [paymentType, setPaymentType] = useState("");         // Состояние типа оплаты
  const [avatar, setAvatar] = useState("");                   // Состояние аватара пользователя
  const [newUserProfile, setNewUserProfile] = useState(null); // Состояние новых данных пользователя
  const [loading, setLoading] = useState(true);               // Состояние загрузки
  const [error, setError] = useState(null);                   // Состояние ошибки

  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userResponse, cartResponse, recipesResponse, transactionResponse] = await Promise.all([
          axios.get(`${process.env.REACT_APP_BACKEND}user/${user._id}`),
          axios.get(`${process.env.REACT_APP_BACKEND}cart/${user._id}`),
          axios.get(`${process.env.REACT_APP_BACKEND}recipe/all`),
          axios.get(`${process.env.REACT_APP_BACKEND}transaction/${user._id}/transactions`)
        ]);
        setUserProfile(userResponse.data);
        setArrCart(cartResponse.data.items);
        setCart(cartResponse.data);
        setRecipes(recipesResponse.data);
        setAllTransaction(transactionResponse.data);
      } catch (error) {
        setError("Ошибка при загрузке данных");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    if (user?._id) {
      setLoading(true);
      fetchData();
    }
  }, [user?._id]);

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



  useEffect(() => {
    if (userProfile) {
      setNewUserProfile(userProfile);
    }
  }, [userProfile]);

  if (loading) return <p>Загрузка...</p>; // Этап загрузки
  if (error) return <p>{error}</p>; // Этап ошибки

  // Закртие модального окна
  const handleClose = () => {
    setIsProfileModalOpen(false);
  };

  // // Общая функция, подходящяя под разные ситуации
  // const handleAction = async (action, url, successMessage, navigateTo = null) => {
  //   try {
  //     await axios.delete(url);
  //     alert(successMessage);
  //     if (navigateTo) {
  //       navigate(navigateTo);
  //     }
  //     setLoading(true); // Можно заменить на обновление состояния
  //   } catch (error) {
  //     console.error(`Ошибка при выполнении действия: ${action}`, error);
  //   }
  // };

  // Удаление пользователя с подтверждением
  const handleDeleteUser = async (e) => {
    e.preventDefault();

    // Показываем подтверждение
    const isConfirmed = window.confirm("Вы уверены, что хотите удалить профиль? Это действие необратимо!");

    if (!isConfirmed) return; // Если пользователь нажал "Отмена", прерываем функцию

    const delUser = {
        userId: user._id,
        isAdmin: user.isAdmin
    };

    console.log("DELETE USER ", delUser);
    console.log(cart);
    console.log(avatar);
  
    try {
        const response = await axios.delete(`${process.env.REACT_APP_BACKEND}user/${user._id}`, {
            data: delUser // Передаем данные в теле запроса
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


  // Выход из учетной записи
  const handleLogOut = (e) => {
    e.preventDefault();
    logout();
    setIsProfileModalOpen(false);
    notify("success", "Успешный выход из профиля!")
    navigate("/");
  };

  // // Очищение корзины пользователя
  // const handleDeletUserCart = (e) => {
  //   e.preventDefault();
  //   handleAction('очистка корзины', `${process.env.REACT_APP_BACKEND}cart/${user._id}`, 'Корзина была очищена', '/create');
  // };

  // // Удаление айтема из корзины
  // const handleDeleteItemFromCart = (cardId) => {
  //   handleAction('удаление товара из корзины', `${process.env.REACT_APP_BACKEND}cart/${user._id}/${cardId}`, 'Товар удален из корзины');
  // };

  // Открыте окна редактирования Редактирования профиля
  const handleEditProfile = (e) => {
    e.preventDefault();

    setIsEditMode(true);
  };

  // Скрытие окна редактирования Редактирования профиля
  const handleCancelEdit = (e) => {
    e.preventDefault();

    setIsEditMode(false);
  };

  // Изменение профиля пользователя
  const handleSaveProfile = async (e) => {
    e.preventDefault();
  
    console.log("Тело запроса: ", newUserProfile);

    try {
        const response = await axios.put(process.env.REACT_APP_BACKEND + `user/${userProfile._id}`, newUserProfile);
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
  }

  // Загрузка нового аватара (НЕ ДОБАВЛЕНИЕ ИЗОБРАЖЕНИЯ)
  const handleImageUpload = (url) => {
    setAvatar(url);

    setNewUserProfile((prevProfile) => ({
      ...prevProfile,
      avatar: url,
    }));
  };

  // Открыте окна редактирования Тип оплаты
  const handleEditPay = (e) => {
    e.preventDefault();

    setIsEditPay(true);
  };

  // Скрытие окна редактирования Тип оплаты
  const handleCancelEditPay = (e) => {
    e.preventDefault();

    setIsEditPay(false);
  };

  // Добавление банковской карты для оплаты
  const handleAddCard = async (e) => {
    e.preventDefault();

    if (!userProfile || !userProfile._id) {
      alert("Профиль не найден. Попробуйте обновить страницу или войти снова.");
      return;
    }

    try {
      const newCard = {
        paymentType: paymentType,
        paymentCard: [
          {
            cardFIO: cardFIO.current.value,
            cardNUM: cardNUM.current.value,
            cardMMY: cardMMY.current.value,
            cardCVV: cardCVV.current.value
          }
        ]
      };
      
        const response = await axios.put(`${process.env.REACT_APP_BACKEND}user/${userProfile._id}/payment-card`, newCard);
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

  // Получение итоговой суммы корзины
  // const getTotalPrice = () => {
  //   console.log(arrCart)
  //   return arrCart.reduce((total, item) => total + (item.cardId.price * item.quantity), 0);
  // };
  
  // Оплата корзины
  // const handlePayCart = async (e) => {
  //   try {
  //     const totalPrice = getTotalPrice();
  //     console.log(totalPrice);

  //     await axios.post(`${process.env.REACT_APP_BACKEND}transaction/${userProfile._id}/transaction`, {
  //       amount: totalPrice,
  //       paymentType: userProfile.paymentType,
  //       cardId: userProfile.paymentCard[0]._id,
  //       cartId: cart._id
  //     });

  //     await axios.delete(`${process.env.REACT_APP_BACKEND}cart/${user._id}`);
  //     alert("Оплаты прошла успешно");
  //     window.location.reload();
  //   } catch (error) {
  //     console.log(error);  
  //   }
  // };

  // Распечатка чека
  const handlePrintTransaction = async (transactionId) => {
    try {
      const receiptUrl = `${process.env.REACT_APP_BACKEND}receipt/${transactionId}/receipt`;
      window.open(receiptUrl, "_blank");
    } catch (error) {
      console.log(error);
    }
  };

  // Добавление налички
  const handleAddCash = async () => {
    try {
        const response = await axios.put(`${process.env.REACT_APP_BACKEND}user/${userProfile._id}/payment-cash`, paymentType);
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

  // Возврат средств, отмена транзакции
  const handleDeletTransaciton = async (transactionId) => {
    try {
        const response = await axios.put(`${process.env.REACT_APP_BACKEND}transaction/${userProfile._id}/transaction/${transactionId}/refund`);
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

  const handlePayPage = async () => {
    navigate("/paypage");
  }

  return (
    <div className="profile-modal-overlay">
        <div className="profile-modal-container">

            <div className="profile-header">
        <button className="profile-close-button" onClick={handleClose}>x</button>
        <h1 className="profile-title">Страница профиля</h1>
        {userProfile && <p className="profile-username">{userProfile.username} <br /> Номер карты: {userProfile.paymentCard[0].cardNUM} <br /> Остаток средств: {userProfile.paymentCard[0].cardCASH}</p>}
            </div>
            <div className="profile-scroll-wrapper">
            <div className="profile-buttons">
              <button className="btn logout-btn" onClick={handleLogOut}>Выйти из профиля</button>
                {!isEditMode ? (
                  <button className="btn btn delete-profile-btn" onClick={handleEditProfile}>Редактировать профиль</button>
                ): (
                  <div>
                    <form className="information">
                      <input 
                        type="text" 
                        value={newUserProfile?.username || ""}  
                        onChange={(e) => setNewUserProfile({ ...newUserProfile, username: e.target.value })} 
                        placeholder="Никнейм" 
                      />
                      <input 
                        type="email" 
                        value={newUserProfile?.email || ""} 
                        onChange={(e) => setNewUserProfile({ ...newUserProfile, email: e.target.value})} 
                        placeholder="Почта" 
                      />
                      <input 
                        type="password" 
                        placeholder="Пароль"
                        onChange={(e) => setNewUserProfile({ ...newUserProfile, password: e.target.value})} 
                      />
                      <input 
                        type="phone" 
                        value={newUserProfile?.phone || ""} 
                        placeholder="Телефон" 
                        onChange={(e) => setNewUserProfile({ ...newUserProfile, phone: e.target.value})} 
                      />
                      <input 
                        type="text" 
                        value={newUserProfile?.fio || ""} 
                        placeholder="ФИО" 
                        onChange={(e) => setNewUserProfile({ ...newUserProfile, fio: e.target.value})} 
                      /> <br /> <br />
                      <img src={newUserProfile.avatar} className="image" alt="Avatar"/>
                      <ImageUploader onUpload={handleImageUpload} />
                      <br /><br />
                      <button type="orange" onClick={handleSaveProfile}>
                        Сохранить
                      </button>
                      <button type="orange" onClick={handleCancelEdit}>
                        Отмена
                      </button>
                    </form>
                  </div>
                )}
              {!isEditPay ? (
                <button className="btn btn delete-profile-btn" onClick={handleEditPay}>Добавить вид оплаты</button>
              ) : (
                <div className="transaction">
                  <h1>Выбирите тип оплаты</h1>
                  <select value={paymentType} onChange={(e) => setPaymentType(Number(e.target.value))}>
                    <option value="">Выбирите тип оплаты</option>
                    <option value={0}>Наличные</option>
                    <option value={1}>Карта</option>
                  </select>

                  {paymentType === 0 && (
                    <form>
                      <h2>Оплата наличными</h2>
                      <p>Вы сможете оплатить заказ при получении.</p>
                      <button className="btn save-btn" onClick={handleAddCash}>Добавить наличные</button>
                    </form>
                  )}

                  {paymentType === 1 && (
                    <form>
                      <h2>Оплата картой</h2>
                        <input ref={cardFIO} type="text" placeholder="Имя на карте" required />
                        <input ref={cardNUM} type="text" placeholder="Номер карты" maxLength="16" required />
                        <input ref={cardMMY} type="text" placeholder="MM/YY" maxLength="5" required />
                        <input ref={cardCVV} type="text" placeholder="CVV" maxLength="3" required />
                        <button onClick={handleAddCard}>Добавить</button>
                    </form>
                  )}
                  <br/>
                  <button type="orange">Подвердить тип оплаты и оплатить</button> <br /> <br />
                  <button  type="orange" onClick={handleCancelEditPay}>Отменить</button>
                </div>
              )}
              {!isTransaction ? (
                <button className="btn btn delete-profile-btn" onClick={(e) => setIsTransaction(true)}>Транзакции</button>
              ) : (
                <>
                <h1>Список транзакций</h1>
                {allTransaction && allTransaction.length > 0 ? (
                  <>
                    <div className="transactions-scroll-wrapper">
                      {allTransaction.map((transaction) => (
                        <div key={transaction._id} className="container_transaction">
                          <h3>Статус: {transaction.status}</h3>
                          <p>Цена: {transaction.amount}</p>
                          <p>Дата: {transaction.createdAt}</p>
                          <button className="btn save-btn" onClick={() => handlePrintTransaction(transaction._id)}>
                            Распечатать чек
                          </button>
                          <br /><br />
                          {transaction.status === "completed" ? (
                            <button className="btn btn delete-profile-btn" onClick={() => handleDeletTransaciton(transaction._id)}>
                              Возврат средств
                            </button>
                          ) : (
                            <p></p>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Кнопка вне прокручиваемого блока */}
                    <br />
                    <button className="btn save-btn" onClick={() => setIsTransaction(false)}>Отмена</button>
                  </>
                ) : (
                  <p>Нет транзакций</p>
                )}
              </>

              )}
              <button className="btn delete-profile-btn" onClick={handleDeleteUser}>Удалить профиль</button>
              {userProfile?.isAdmin && (
              <button className="btn admin-btn" onClick={() => navigate("/admin")}>Админка</button>
              )}
              <button className="btn clear-cart-btn" onClick={handlePayPage}>Страница Оплаты</button> 
            </div>

            {/*<div className="update_div_container">
              <h1 className="section-title">Корзина пользователя</h1>
               {arrCart.length > 0 ? (
                arrCart.map((item) => (
                  <div className="cart_container" key={item._id}>
                    <form>
                      <label>
                        <p>
                          <strong>Продукт:</strong> {item.cardId?.name}
                          <strong> Количество: </strong> {item.quantity}, <strong> ID товара: </strong> {item._id}
                        </p>
                        <button type="button" className="btn delete-item-btn" onClick={() => handleDeleteItemFromCart(item._id)}>Удалить</button>
                      </label>
                    </form>
                  </div>
                ))
              ) : (
                <p>Корзина пуста</p>
              )} 
              <button className="btn clear-cart-btn" onClick={handlePayCart}>Оплатить корзину</button>
              <button className="btn clear-cart-btn" onClick={handleDeletUserCart}>Очистить корзину</button> 
            </div>*/}
            <h1 className="section-title">Список подходящих рецептов</h1>
            {filteredRecipes.length > 0 ? (
              <ul className="recipes-list">
                {filteredRecipes.map(recipe => (
                  <li key={recipe._id}>
                    <h3>{recipe.nameRecipe}</h3>
                    <p>{recipe.descriptionRecipe}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p>Нет подходящих рецептов</p>
            )}
        </div>
    </div>
</div>
  );
};

export default Profile;
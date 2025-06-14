import './cardDetails.css';
import React, { useEffect, useState, useContext, useRef } from "react";
import axios from "axios";
import { AuthContext } from "../../context/AuthContext";
import EditCard from '../../Components/EditCard/EditCard';
import { notify } from '../../Middleware/toast';

export default function CardDetails({ id }) {
    const [card, setCard] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const item_quantity = useRef();

    const { user } = useContext(AuthContext);
    
    useEffect(() => {
        const fetchCard = async () => {
            try {
                const response = await axios.get(process.env.REACT_APP_BACKEND + `admin/${id}`);
                setCard(response.data);
            } catch (err) {
                setError("Error fetching card details");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchCard();
    }, [id]);

    const handleDelete = async () => {
        const isConfirmed = window.confirm("Вы уверены, что хотите удалить эту карточку? Это действие необратимо!");
        if (!isConfirmed) return; // Если пользователь нажал "Отмена", прерываем функцию
        try {
            const response = await axios.delete(process.env.REACT_APP_BACKEND + `admin/delete/${id}`);
            const { status, message } = response.data;
            notify(status, message);
            window.location.reload(); // перезагрузка страницы, после удаления карточки
        } catch (error) {
            if (error.response) {
                const { status, message } = error.response.data;
                notify (status || 'error', message || 'Что-то пошло не так');
            } else {
                notify('error', 'Возникла ошибка на стороне сервера!');
            }
        }
    };

    const handleAddProductCart = async () => {
        if (!card) return;
    
        try {
            const response = await axios.post(`${process.env.REACT_APP_BACKEND}cart/add`, {
                userId: user?._id,                                      // Идентификатор пользователя
                items: [{                                               // Передаем массив с одним товаром
                    cardId: card._id,                                   // ID текущего товара
                    name: card.name,                                    // Название товара
                    quantity: parseInt(item_quantity.current.value, 10) || 1          // По умолчанию 1 шт.
                }]
            });
    
            
            const { status, message } = response.data;
            notify(status, message);
        } catch (error) {
            if (error.response) {
                const {status, message} = error.response.data;
                notify(status || 'error', message || 'Что-то пошло не так!');
            } else {
                notify('error', 'Возникла ошибка на стороне сервера!');
            }
        }
    };    

    if (loading) return <p>Loading...</p>;
    if (error) return <p>{error}</p>;
    if (!card) return <p>Card not found.</p>;

    return (
        <div className="card-details">
            <h2>{card.name}</h2>
            <img src={card.photo} alt="фотка" className="custom-image" />
            <p>Описание: {card.description}</p>
            <p>Условия хранения: {card.conditions}</p>
            <p>Срок годности (дни): {card.expiration_date}</p>
            <p>Калорийность (кКал):{card.kilo_kal}</p>
            <p>Белки (г): {card.belki}</p>
            <p>Жиры (г): {card.jiri}</p>
            <p>Углеводы (г): {card.uglevods}</p>
            <p>Масса (кг): {card.massa}</p>
            <p>Tag: {card.tag}</p>
            <p>Цена: {card.price}</p>
            <input type="number" placeholder='Введите количество...' ref={item_quantity} />
            <button onClick={handleAddProductCart} className='add-button'>Add for cart</button>
            {user && user.isAdmin ? (
                <>
                    <button onClick={handleDelete} className="delete-button">Delete Card</button>
                    <EditCard cardData={card} />
                </>
            ): (
                <p></p>
            )}
        </div>
    );
}

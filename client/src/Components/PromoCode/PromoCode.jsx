import { useState, useEffect, useRef } from "react";
import axios from "axios";
import {notify} from "../../Middleware/toast"

export default function PromoCode() {

    const code = useRef();                                              // Ссылка на новое название
    const expires_at = useRef();                                        // Ссылка на новый срок годности

    const [allPromoCode, setAllPromoCode] = useState([]);               // Состояние всех промо-кодов
    const [selectedPromoCode, setSelectedPromoCode] = useState(null);   // Состояние выбранного промо-кода
    const [newCode, setNewCode] = useState("");                         // Состояние нового названия
    const [newExpires_at, setNewExpires_at] = useState(null);           // Состояние нового срока годности
    const [loading, setLoading] = useState(true);                       // Состояние загрузки
    const [error, setError] = useState(null);                           // Состояние ошибки

    // Получение всех промо-кодов
    useEffect(() => {
        const fetchAllPromoCode = async() => {
            try {
                const response = await axios.get(process.env.REACT_APP_BACKEND + "promocode/all");
                setAllPromoCode(response.data);
            } catch (error) {
                setError(error);
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        fetchAllPromoCode();
    }, []);

    if (loading) return <p>Loading...</p>       // Обработка загрузки
    if (error) return <p>{error}</p>            // Обработка ошибок

    // Обработчик добавления нового промо-кода
    const handleAddPromoCode = async (e) => {
        e.preventDefault();

        // Объект нового промо-кода
        const promoCode = {
            code: code.current.value,
            expires_at: expires_at.current.value
        };

        try {
            const response = await axios.post(`${process.env.REACT_APP_BACKEND}promocode/add`, promoCode);
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

    // Обработчик изменения данных промо-кода
    const handleChangePromoCode = async (e) => {
        const selected = allPromoCode.find((promoCode) => promoCode.code === e.target.value);
        setSelectedPromoCode(selected);
        setNewCode(selected?.code || "");
        setNewExpires_at(selected?.expires_at.split('T')[0] || Date.now());
    };

    // Обработчик удаления промо-кода
    const handleDeletePromoCode = async (e) => {
        try {
            e.preventDefault();
            const isConfirmed = window.confirm("Вы уверены, что хотите удалить этот промо-код?");
            if (!isConfirmed) return;

            const response = await axios.delete(`${process.env.REACT_APP_BACKEND}promocode/${selectedPromoCode._id}`);
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

    // Обработчик обновления данных промо-кода
    const handleEditPromoCode = async (e) => {
        e.preventDefault();

        try {
            const updatePromoCode = {
                code: newCode,
                expires_at: newExpires_at
            };

            const response = await axios.put(`${process.env.REACT_APP_BACKEND}promocode/${selectedPromoCode._id}`, updatePromoCode);
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

    return (
        <>
            <div className="">
                <h1>Добавление промо-кода</h1>
                <form onSubmit={handleAddPromoCode}>
                    <label>Введите название:</label> <br />
                    <input type="text" placeholder="Название" ref={code} /> <br />
                    <label>Введите срок годности: </label> <br />
                    <input type="date" placeholder="Срок годности" ref={expires_at}/> <br />
                    <button type="submit">Создать</button>
                </form>
            </div>
            <div className="">
                <h1>Редактирование промо-кодов</h1>
                <form onSubmit={handleEditPromoCode}>
                    <label>Выберите промо-код</label>
                    <select value={selectedPromoCode?.code} onChange={handleChangePromoCode}>
                        <option value="">Выберите промо-код</option>
                        {allPromoCode.map((promocode) => (
                            <option key={promocode._id} value={promocode.code}>
                                {promocode.code}
                            </option>
                        ))}
                    </select>

                    {selectedPromoCode && (
                        <>
                            <h2>Данные выбранного промо-кода</h2>
                            <div>
                                <label>Название</label> <br />
                                <input 
                                    type="text"
                                    value={newCode}
                                    onChange={(e) => setNewCode(e.target.value)}
                                    placeholder="Название промо-кода" 
                                /> <br />
                                <label>Срок годности промо-кода</label>
                                <input 
                                    type="date"
                                    value={newExpires_at}
                                    onChange={(e) => setNewExpires_at(e.target.value)}
                                    placeholder="Срок годности" 
                                /> <br />
                                <label>Статус промо-кода: <strong>{selectedPromoCode.isUsed ? 'Использован' : 'Не использован'}</strong></label>
                            </div>
                            <br />
                            <button type="submit">Сохранить</button> <br /> <br />
                            <button onClick={handleDeletePromoCode}>Удалить промо-код</button>
                        </>
                    )}
                </form>
            </div>
        </>
    )
}
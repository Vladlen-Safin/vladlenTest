import { useState, useEffect } from "react";
import axios from "axios";
import {notify} from "../../Middleware/toast"

export default function EditVideoGroup () {
    const [allVideoGroups, setAllVideoGroups] = useState([]);
    const [selectedVideoGroup, setSelectedVideoGroup] = useState(null);
    const [groupname, setGroupname] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Загружаем все видео
    useEffect(() => {
        const fetchAllVideo = async () => {
            try {
                const response = await axios.get(process.env.REACT_APP_BACKEND + "videoGroups/all");
                setAllVideoGroups(response.data);
            } catch (error) {
                setError(error);
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        fetchAllVideo();
    }, []);

    if (loading) return <p>Loading...</p>; // Индикация загрузки
    if (error) return <p>{error}</p>; // Вывод ошибки, если она возникла

    // Обработчик выбора Видео
    const handleChangeVideo = (e) => {
        const selected = allVideoGroups.find((video) => video.groupname === e.target.value);
        setSelectedVideoGroup(selected);
        setGroupname(selected?.groupname || "");
    };

    // Обработчик отправки данных
    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const updatedVideoGroup = {
                ...selectedVideoGroup,
                groupname,
            };
            const response = await axios.put(`${process.env.REACT_APP_BACKEND}videoGroups/${selectedVideoGroup._id}`, updatedVideoGroup);
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

    // Обработчик удаления видео по id
    const handleDeleteVideo = async (e) => {
        try {
            const isConfirmed = window.confirm("Вы уверены, что хотите удалить это видео? Это действие необратимо!");
            if (!isConfirmed) return; // Если пользователь нажал "Отмена", прерываем функцию
            
            const response = await axios.delete(`${process.env.REACT_APP_BACKEND}videoGroups/${selectedVideoGroup._id}`);
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
        <div className="">
            <h1>Редактирование тэга для видео</h1>
            <form onSubmit={handleSubmit}>
                <label>Выберите тэг для видео</label>
                <select value={selectedVideoGroup?.groupname} onChange={handleChangeVideo}>
                    <option value="">Выберите тэг для видео</option>
                    {allVideoGroups.map((video) => (
                        <option key={video._id} value={video.groupname}>
                            {video.groupname}
                        </option>
                    ))}
                </select>

                {selectedVideoGroup && (
                    <>
                        <h2>Данные выбранного тэга</h2>
                        <div>
                            <label>Название</label>
                            <input 
                                type="text"
                                value={groupname}
                                onChange={(e) => setGroupname(e.target.value)}
                                placeholder="Название видео"
                            />
                        </div>
                        <br />
                        <button type="submit">Сохранить</button> <br /><br />
                        <button onClick={handleDeleteVideo}>Удалить тэг</button>
                    </>
                )}
            </form>
        </div>
    )
};
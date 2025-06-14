import "./editSubGroups.css"
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import {notify} from "../../Middleware/toast"

const EditSubGroups = () => {
    const groupId = useRef(); // Ссылка на таблицу групп
    const newSubGroupName = useRef(); // Ссылка на название новой подгруппы
    
    const [allGroups, setAllGroups] = useState([]); // Состояние для всех групп
    const [allSubGroups, setAllSubGroups] = useState([]); // Состояние для всех подгрупп
    const [selectedSubGroup, setSelectedSubGroup] = useState(null); // Состояние для выбранной подгруппы
    const [selectedNewGroup, setSelectedNewGroup] = useState(null); // Состояние для выбранной группы для редактирования подгруппы
    const [subgroupname, setSubGroupName] = useState(""); // Состояние для нового названия подгруппы
    const [loading, setLoading] = useState(true); // Состояние загрузки данных
    const [error, setError] = useState(null); // Состояние для ошибок

    // Загружаем все группы
    useEffect(() => {
        const fetchAllGroups = async () => {
            try {
                const response = await axios.get(process.env.REACT_APP_BACKEND + "productGroup/all");
                setAllGroups(response.data);
            } catch (error) {
                setError("Ошибка при получении всех групп");
                console.log(error);
            } finally {
                setLoading(false);
            }
        };

        const fetchAllSubGroups = async () => {
            try {
                const response = await axios.get(process.env.REACT_APP_BACKEND + "subgroup/all");
                setAllSubGroups(response.data);
            } catch (error) {
                setError("Ошибка во время загрузки всех подгрупп")
            } finally {
                setLoading(false);
            }
        };

        fetchAllGroups();
        fetchAllSubGroups();
    }, []);

    if (loading) return <p>Loading...</p>; // Индикация загрузки
    if (error) return <p>{error}</p>; // Вывод ошибки, если она возникла

    const handleAddNewSubGroup = async (e) => {
        e.preventDefault();

        const newSubGroup = {
            groupId: groupId.current.value,
            subgroupname: newSubGroupName.current.value
        }

        try {
            const response = await axios.post(process.env.REACT_APP_BACKEND + `subgroup/${groupId.current.value}`, newSubGroup);
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

    const handleChangeSubGroup = async (e) => {
        e.preventDefault();

        const editSubGroup = {
            groupId: selectedNewGroup._id,
            subgroupname: subgroupname
        }

        if(!editSubGroup) {
            alert("Не заполнены поля формы");
        }

        try {
            const response = await axios.put(process.env.REACT_APP_BACKEND + `subgroup/${selectedSubGroup._id}`, editSubGroup);
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

    const handleNewEditSubGroup = (e) => {
        const selectedSubGroups = allSubGroups.find((subGroup) => subGroup.subgroupname === e.target.value);
        setSelectedSubGroup(selectedSubGroups);
        setSubGroupName(selectedSubGroups.subgroupname);
    }

    const handleAddNewGroup = (e) => {
        const selectedGroup = allGroups.find((group) => group.groupname === e.target.value);
        setSelectedNewGroup(selectedGroup);
    }

    const handleDeleteSubGroup = async () => {
        try {
            const response = await axios.delete(process.env.REACT_APP_BACKEND + `subgroup/${selectedSubGroup._id}`);
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


    return(
        <>
            <div className="">
                <h1>Добавление новой подргуппы</h1>
                <form onSubmit={handleAddNewSubGroup}>
                    <select ref={groupId} required>
                        <option value="">Выберите группу</option>
                        {allGroups.map(group => (
                            <option key={group._id} value={group._id}>
                                {group.groupname}
                            </option>
                        ))}
                    </select>
                    <input type="text" placeholder="Название подгруппы" ref={newSubGroupName} required />
                    <button type="submit">Создать</button>
                </form>
            </div>
            <div className="">
                <h1>Редактирование подгруппы</h1>
                <form>
                    <select value={selectedSubGroup?.subgroupname || ""} onChange={handleNewEditSubGroup}>
                    <option value="">Выберите подгруппу</option>
                        {allSubGroups.map((subGroup) => (
                            <option key={subGroup._id} value={subGroup.subgroupname}>
                                {subGroup.subgroupname}
                            </option>
                        ))}
                    </select>
                </form>
                {selectedSubGroup && (
                    <>
                        <form onSubmit={handleChangeSubGroup}>
                            <h1>Данные выбранной подгруппы</h1>
                            <input type="text"
                                value={subgroupname}
                                onChange={(e) => setSubGroupName(e.target.value)}
                                placeholder="Введите новое название подгруппы"
                            />
                            <h1>Выберите новую группу для подгруппы</h1>
                            <select value={selectedNewGroup?.groupname || ""} onChange={handleAddNewGroup}>
                                <option value="">Выберите группу</option>
                                {allGroups.map((group)=> (
                                    <option key={group._id} value={group.groupname}>
                                        {group.groupname}
                                    </option>
                                ))}
                            </select> <br /> <br />
                            <button type="submit">Сохранить</button> <br /> <br />
                            <button onClick={handleDeleteSubGroup}>Удалить подгруппу</button>
                        </form>
                    </>
                )}
            </div>
        </>
    )
};

export default EditSubGroups;
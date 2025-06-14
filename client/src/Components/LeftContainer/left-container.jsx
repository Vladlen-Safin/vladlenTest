import "./left-container.css";
import { useState, useEffect } from "react";
import axios from "axios";

const LeftContainer = ({ onGroupSelect, onSubGroupSelect, onRecipeSelect }) => {
    const [allGroups, setAllGroups] = useState([]); // Группы
    const [allSubGroups, setAllSubGroups] = useState([]); // Подгруппы
    const [loading, setLoading] = useState(true); // Загрузка
    const [error, setError] = useState(null); // Ошибки
    const [openGroup, setOpenGroup] = useState(null); // Открытая группа
    const [openSubGroup, setOpenSubGroup] = useState(null); // Открытая подгруппа

    // Получение всех групп
    useEffect(() => {
        const fetchAllGroups = async () => {
            try {
                const response = await axios.get(process.env.REACT_APP_BACKEND + "productGroup/all");
                setAllGroups(response.data);
            } catch (error) {
                setError("Ошибка при загрузке групп");
                console.log(error);
            }
        };

        fetchAllGroups();
    }, []);

    // Получение всех подгрупп
    useEffect(() => {
        const fetchAllSubGroups = async () => {
            try {
                const response = await axios.get(process.env.REACT_APP_BACKEND + "subgroup/all");
                setAllSubGroups(response.data);
            } catch (error) {
                setError("Ошибка при загрузке подгрупп");
                console.log(error);
            } finally {
                setLoading(false);
            }
        };

        fetchAllSubGroups();
    }, []);

    if (loading) return <p>Loading...</p>;
    if (error) return <p>{error}</p>;

    // Открытие/закрытие группы
    const toggleGroup = (groupId) => {
        setOpenGroup(openGroup === groupId ? null : groupId);
        onSubGroupSelect(null);
        onRecipeSelect(false);
        onGroupSelect(groupId); // Передаем выбранную группу в родительский компонент
    };

    // Открытие/закрытие подгруппы
    const toggleSubGroup = (subGroupId) => {
        setOpenSubGroup(openSubGroup === subGroupId ? null : subGroupId);
        onGroupSelect(null);
        onRecipeSelect(false);
        onSubGroupSelect(subGroupId);
    };

    return (
        <aside className="sidebar">
            <ul>
                <button className="menu-button recipe-button" onClick={() => onRecipeSelect(true)}>Рецепты</button>
                {allGroups.map((group) => (
                    <li key={group._id}>
                        <button className="menu-button" onClick={() => toggleGroup(group._id)}>
                            {group.groupname}
                        </button>

                        {/* Если группа открыта, показываем ее подгруппы */}
                        {openGroup === group._id && (
                            <ul className="submenu">
                                {allSubGroups
                                    .filter((sub) => sub.groupId === group._id)
                                    .map((sub) => (
                                        <li key={sub._id}>
                                            <button className="menu-button" onClick={() => toggleSubGroup(sub._id)}>
                                                {sub.subgroupname}
                                            </button>
                                        </li>
                                    ))}
                            </ul>
                        )}
                    </li>
                ))}
            </ul>
        </aside>
    );
};

export default LeftContainer;


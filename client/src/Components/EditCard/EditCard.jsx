import React, { useEffect, useState } from "react";
import axios from "axios";
import ImageUploader from "../Test/testComp";
import { notify } from "../../Middleware/toast";
import "./editCard.css"

export default function EditCard({ cardData }) {
    const [groups, setGroups] = useState([]);
    const [subGroups, setSubGroups] = useState([]);
    const [newCard, setNewCard] = useState(cardData || {});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        setNewCard(cardData || {});
    }, [cardData]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [groupsRes, subGroupsRes] = await Promise.all([
                    axios.get(process.env.REACT_APP_BACKEND + "productGroup/all"),
                    axios.get(process.env.REACT_APP_BACKEND + "subgroup/all")
                ]);
                setGroups(groupsRes.data);
                setSubGroups(subGroupsRes.data);
            } catch (error) {
                setError("Ошибка при получении данных");
                console.error(error);
            }
        };
        fetchData();
    }, []);

    const handleEditCard = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            console.log(newCard);
            const response = await axios.put(`${process.env.REACT_APP_BACKEND}admin/${cardData._id}`, newCard);
            const { status, message} = response.data;
            notify(status, message);
        } catch (error) {
            if (error.response) {
                const { status, message } = error.response.data;
                notify(status || 'error', message || 'Что-то пошло не так!');
            } else {
                notify('error', 'Возникла ошибка на стороне сервера!');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleImageUpload = (url) => {
        setNewCard((prev) => ({ ...prev, photo: url }));
    };

    if (error) return <p>{error}</p>;

    return (
        <form onSubmit={handleEditCard} className="edit-card">
            <h1 className="edit-card-title">Редактирование карточки продукта</h1>
            {loading && <p className="loading-text">Сохранение...</p>}

            <div className="form-grid">
                {[
                    { key: "name", placeholder: "Название" },
                    { key: "description", placeholder: "Описание" },
                    { key: "conditions", placeholder: "Условия" },
                    { key: "expiration_date", placeholder: "Срок хранения" },
                    { key: "kilo_kal", placeholder: "Калории" },
                    { key: "belki", placeholder: "Белки" },
                    { key: "jiri", placeholder: "Жиры" },
                    { key: "uglevods", placeholder: "Углеводы" },
                    { key: "massa", placeholder: "Масса" },
                    { key: "price", placeholder: "Цена"}
                ].map(({ key, placeholder }) => (
                    <input
                        key={key}
                        type={key.includes("date") || key.includes("kal") || key.includes("mass") || key.includes("price") ? "number" : "text"}
                        className="form-input"
                        placeholder={placeholder}
                        value={newCard[key] || ""}
                        onChange={(e) =>
                            setNewCard((prev) => ({
                                ...prev,
                                [key]: key.includes("date") || key.includes("kal") || key.includes("mass") || key.includes("price")
                                    ? Number(e.target.value)
                                    : e.target.value,
                            }))
                        }
                        
                    />
                ))}
            </div>

            <h2>Выберите группу:</h2>
            <select
                value={newCard.tag || ""}
                onChange={(e) => setNewCard((prev) => ({ ...prev, tag: e.target.value }))}
            >
                <option value="">Выберите группу...</option>
                {groups.map((group) => (
                    <option key={group._id} value={group.groupname}>{group.groupname}</option>
                ))}
            </select>

            <h2>Выберите подгруппу:</h2>
            <select
                value={newCard.subTag || ""}
                onChange={(e) => setNewCard((prev) => ({ ...prev, subTag: e.target.value }))}
            >
                <option value="">Выберите подгруппу...</option>
                {subGroups.map((subGroup) => (
                    <option key={subGroup._id} value={subGroup.subgroupname}>{subGroup.subgroupname}</option>
                ))}
            </select>

            <ImageUploader onUpload={handleImageUpload} /><br /><br />

            <button type="submit" className="save-button" disabled={loading}>
                {loading ? "Сохранение..." : "Сохранить"}
            </button>
        </form>
    );
}

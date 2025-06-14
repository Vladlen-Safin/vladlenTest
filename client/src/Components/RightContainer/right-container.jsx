import { useState, useEffect, useContext } from "react";
import "./RightSidebar.css";
import YandexMap from "../YMaps/Ymaps";
import axios from "axios";
import { AuthContext } from "../../context/AuthContext";

const RightContainer = () => {
  const [city, setCity] = useState(""); // Город
  const [confirmed, setConfirmed] = useState(false);
  const [allHavas, setAllHavas] = useState([]); // Все магазины
  const [filteredHavas, setFilteredHavas] = useState([]); // Магазины выбранного города
  const [selectedHavas, setSelectedHavas] = useState(null); // Выбранный магазин
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useContext(AuthContext);

  // Загрузка магазинов
  useEffect(() => {
    const fetchAllHavas = async () => {
      try {
        const response = await axios.get(process.env.REACT_APP_BACKEND + "havas/all");
        setAllHavas(response.data);
      } catch (error) {
        setError("Ошибка при загрузке данных");
        console.log(error);
      } finally {
        setLoading(false);
      }
    };
    fetchAllHavas();
  }, []);

  // Обновляем список магазинов при смене города
  useEffect(() => {
    if (city) {
      setFilteredHavas(allHavas.filter((havas) => havas.city === city));
      setSelectedHavas(null); // Сбрасываем выбор магазина
    }
  }, [city, allHavas]);

  // Обработчик выбора города
  const handleCityChange = (e) => {
    setCity(e.target.value);
  };

  // Обработчик выбора магазина
  const handleShopChange = (e) => {
    const selected = filteredHavas.find((havas) => havas.address === e.target.value);
    setSelectedHavas(selected);
  };

  const handleConfirm = async () => {
    if (selectedHavas) {
      const response = await axios.put(`${process.env.REACT_APP_BACKEND}user/${user._id}/havas`,
        {
          address: selectedHavas
        }
      );
      if(response.status === 200) {
        alert(`Вы выбрали магазин: ${selectedHavas.address}`);
        setConfirmed(true);
      } else {
        console.log(response);
      }
    } else {
      alert("Пожалуйста, выберите магазин");
    }
  };

  const handleDecline = () => {
    setConfirmed(false);
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <aside className="sidebar right-sidebar">
      <p>Выберите город:</p>
      <select value={city} onChange={handleCityChange}>
        <option value="">Выберите город</option>
        {[...new Set(allHavas.map((havas) => havas.city))].map((city) => (
          <option key={city} value={city}>{city}</option>
        ))}
      </select>

      {city && (
        <div>
          <p>Вы выбрали город {city}. Теперь выберите магазин:</p>
          <form className="choosemagasine">
            <label>Выберите магазин:</label>
            <select value={selectedHavas?.address || ""} onChange={handleShopChange}>
              <option value="">Выберите адрес</option>
              {filteredHavas.map((havas) => (
                <option key={havas._id} value={havas.address}>
                  {havas.address} - {havas.hint}
                </option>
              ))}
            </select>
          </form>
        </div>
      )}

      {selectedHavas && (
        <>
          <h2>Вы выбрали магазин: {selectedHavas.address}</h2>
          <button className="confirm-button" onClick={handleConfirm}>Подтвердить</button>
          <button className="decline-button" onClick={handleDecline}>Отмена</button>
        </>
      )}

      <div className="map">
        <YandexMap selectedHavas={confirmed ? selectedHavas : null} />
      </div>
    </aside>
  );
};

export default RightContainer;

import { useState, useEffect } from "react";
import axios from "axios";
import {notify} from "../../Middleware/toast"

const EditHavasForm = () => {
  const [allHavas, setAllHavas] = useState([]);
  const [selectedHavas, setSelectedHavas] = useState(null);
  const [address, setAddress] = useState("");
  const [hint, setHint] = useState("");
  const [coordinates, setCoordinates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Загружаем все магазины
  useEffect(() => {
    const fetchAllHavas = async () => {
      try {
        const response = await axios.get(process.env.REACT_APP_BACKEND + "havas/all");
        setAllHavas(response.data);
      } catch (error) {
        setError("Ошибка во время загрузки");
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllHavas();
  }, []);

  if (loading) return <p>Loading...</p>; // Индикация загрузки
  if (error) return <p>{error}</p>; // Вывод ошибки, если она возникла

  // Обработчик выбора магазина
  const handleChangeHavas = (e) => {
    const selected = allHavas.find((havas) => havas.address === e.target.value);
    setSelectedHavas(selected);
    setAddress(selected?.address || "");
    setHint(selected?.hint || "");
    setCoordinates(selected?.coordinates || "");
  };

  // Обработчик отправки данных формы
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
        const updatedHavas = {
            ...selectedHavas,
            address,
            hint,
            coordinates: {
                latitude: coordinates.latitude,
                longitude: coordinates.longitude
            }
        };
        const response = await axios.put(process.env.REACT_APP_BACKEND + `havas/${selectedHavas._id}`, updatedHavas);
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

  // Обработчик удаления магазина по id
  const handleDeleteHavas = async (e) => {
    try {
        const response = await axios.delete(process.env.REACT_APP_BACKEND + `havas/${selectedHavas._id}`);
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
      <h1>Редактирование адреса по id</h1>

      <form onSubmit={handleSubmit}>
       <label>Выберите магазин </label> 
        <select value={selectedHavas?.address || ""} onChange={handleChangeHavas}>
          <option value="">Выберите адрес</option>
          {allHavas.map((havas) => (
            <option key={havas._id} value={havas.address}>
              {havas.address} - {havas.hint}
            </option>
          ))}
        </select>

        {selectedHavas && (
          <>
            <h2>Данные выбранного адреса</h2>
            <div>
              <label>Адрес</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Адрес магазина"
              />
            </div>
            <div>
              <label>Подсказка</label>
              <input
                type="text"
                value={hint}
                onChange={(e) => setHint(e.target.value)}
                placeholder="Подсказка"
              />
            </div>
            <div>
              <label>Координаты. Широта</label>
              <input
                type="text"
                value={coordinates.latitude}
                onChange={(e) => setHint(e.target.value)}
                placeholder="Широта"
              />
            </div>
            <div>
              <label>Координаты. Долгота</label>
              <input
                type="text"
                value={coordinates.longitude}
                onChange={(e) => setHint(e.target.value)}
                placeholder="Широта"
              />
            </div>
            <button type="submit">Сохранить</button> <br/><br/>
            <button onClick={handleDeleteHavas}>Удалить магазин</button>
          </>
        )}
      </form>
    </div>
  );
};

export default EditHavasForm;

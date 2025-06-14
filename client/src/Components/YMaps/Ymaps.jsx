import React, { useState, useEffect } from "react";
import { YMaps, Map, Placemark } from "@pbe/react-yandex-maps";

const places = [
  { id: 1, coordinates: [41.262291, 69.252940], hint: "Сергели", address: "г. Ташкент, Мирабадский район, ул. Афросиаб, дом 6/1" },
  { id: 2, coordinates: [41.375539, 69.365858], hint: "Кибрай", address: "г. Ташкент, Мирабадский район, ул. Афросиаб, дом 6/1" },
  { id: 3, coordinates: [41.330323, 69.329036], hint: "Мирзо Улугбек", address: "г. Ташкент, Мирабадский район, ул. Афросиаб, дом 6/1" },
  { id: 4, coordinates: [41.288186, 69.283590], hint: "Meхржон", address: "г. Ташкент, Мирабадский район, ул. Афросиаб, дом 6/1" },
  { id: 5, coordinates: [41.300523, 69.270026], hint: "Афросиаб", address: "г. Ташкент, Мирабадский район, ул. Афросиаб, дом 6/1" },
  { id: 6, coordinates: [41.305332, 69.251628], hint: "Тураб Тула", address: "г. Ташкент, Мирабадский район, ул. Афросиаб, дом 6/1" },
  { id: 8, coordinates: [41.297549, 69.204530], hint: "Чиланзар", address: "г. Ташкент, Мирабадский район, ул. Афросиаб, дом 6/1" },
  { id: 9, coordinates: [41.323871, 69.205849], hint: "Оксой", address: "г. Ташкент, Мирабадский район, ул. Афросиаб, дом 6/1" },
  { id: 10, coordinates: [41.363223, 69.184147], hint: "Медики", address: "г. Ташкент, Мирабадский район, ул. Афросиаб, дом 6/1" },
  { id: 11, coordinates: [41.206871, 69.140816], hint: "H263 Бобомашраб, Зангиота", address: "г. Ташкент, Мирабадский район, ул. Афросиаб, дом 6/1" },
  { id: 12, coordinates: [41.119198, 69.059137], hint: "Самаркандская", address: "г. Ташкент, Мирабадский район, ул. Афросиаб, дом 6/1" },
];

const YandexMap = ({ selectedHavas }) => {
  const [center, setCenter] = useState([41.311227, 69.279738]);
  const [zoom, setZoom] = useState(11);

  // Используем useEffect для обновления центра и зума, когда selectedHavas изменяется
  useEffect(() => {
    if (selectedHavas) {
      setCenter([selectedHavas.coordinates.latitude, selectedHavas.coordinates.longitude]);
      setZoom(13);
    } else {
      setCenter([41.311227, 69.279738]); // возвращаем на дефолтное место
      setZoom(10); // возвращаем дефолтный зум
    }
  }, [selectedHavas]); // Эффект сработает каждый раз, когда selectedHavas изменится

  const locations = selectedHavas
    ? [
        {
          coordinates: [selectedHavas.coordinates.latitude, selectedHavas.coordinates.longitude],
          hint: selectedHavas.hint,
          address: selectedHavas.address,
        },
      ]
    : places;

  return (
    <YMaps query={{ apikey: "661f2614-00a0-4c1c-b598-8e980489c6af" }}>
      <Map state={{ center, zoom }} width="100%" height="500px">
        {locations.map((place, index) => (
          <Placemark
            key={index} // Используем индекс для уникальности ключа
            geometry={place.coordinates}
            properties={{
              hintContent: place.hint,
              balloonContent: `<strong>${place.hint}</strong><br/>${place.address}`,
            }}
            options={{
              iconLayout: "default#image",
              iconImageHref: "https://havasfood.uz/wp-content/themes/havas/assets/images/logo.svg", // Ссылка на иконку
              iconImageSize: [30, 30], // Размер иконки
              iconImageOffset: [-15, -15], // Смещение
            }}
          />
        ))}
      </Map>
    </YMaps>
  );
};

export default YandexMap;

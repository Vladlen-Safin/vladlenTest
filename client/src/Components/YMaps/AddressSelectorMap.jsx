import React, { useState } from "react";
import { YMaps, Map, Placemark } from "@pbe/react-yandex-maps";

const API_KEY = "661f2614-00a0-4c1c-b598-8e980489c6af";

const AddressSelectorMap = ({ onSelectAddress }) => {
  const [coordinates, setCoordinates] = useState([41.311227, 69.279738]); // Центр Ташкента
  const [address, setAddress] = useState("Выберите точку на карте");

  const getAddressFromCoordinates = async (coords) => {
    const [lat, lon] = coords;
    const url = `https://geocode-maps.yandex.ru/1.x/?apikey=${API_KEY}&geocode=${lon},${lat}&format=json`;

    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`Ошибка сети: ${response.status}`);

      const data = await response.json();
      const geoObject = data?.response?.GeoObjectCollection?.featureMember?.[0]?.GeoObject;
      
      if (!geoObject) throw new Error("Не удалось получить данные о местоположении");

      const newAddress = geoObject?.metaDataProperty?.GeocoderMetaData?.text || "Адрес не найден";

      setAddress(newAddress);
      if (onSelectAddress) {
        onSelectAddress({ coordinates: coords, address: newAddress });
      }
    } catch (error) {
      console.error("Ошибка получения адреса:", error);
      setAddress("Ошибка получения адреса");
    }
  };

  const handleMapClick = (event) => {
    const newCoordinates = event?.get("coords");
    if (!newCoordinates) {
      console.error("Ошибка: клик по карте не дал координаты");
      return;
    }

    setCoordinates(newCoordinates);
    getAddressFromCoordinates(newCoordinates);
  };

  return (
    <YMaps query={{ apikey: API_KEY, enterprise: true }}>
      <Map
        state={{ center: coordinates, zoom: 12 }}
        width="100%"
        height="500px"
        onClick={handleMapClick}
      >
        <Placemark
          geometry={coordinates}
          properties={{
            hintContent: "Выбранный адрес",
            balloonContent: address,
          }}
          options={{ preset: "islands#redDotIcon" }}
        />
      </Map>
    </YMaps>
  );
};

export default AddressSelectorMap;

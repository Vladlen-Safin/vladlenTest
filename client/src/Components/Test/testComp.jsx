import React, { useState } from "react";
import axios from "axios";

const ImageUploader = ({ onUpload }) => {
  const [file, setFile] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const [error, setError] = useState("");

  // Обработчик выбора файла
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  // Загрузка изображения
  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setError("Выберите файл для загрузки!");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND}upload`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      if (response.data.file) {
        const uploadedUrl = `${process.env.REACT_APP_BACKEND}image/${response.data.file.filename}`;
        setImageUrl(uploadedUrl);
        setError("");

        // Передаем URL в родительский компонент
        if (uploadedUrl) {
          onUpload(uploadedUrl);
        }
      }
    } catch (err) {
      console.error("Ошибка загрузки:", err);
      setError("Ошибка загрузки файла!");
    }
  };

  return (
    <div style={{ textAlign: "center", marginTop: "20px" }}>
      <h2>Загрузка изображения</h2>

      <input type="file" onChange={handleFileChange} />
      <button  onClick={handleUpload} style={{ marginLeft: "10px" }}>
        Загрузить
      </button>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {imageUrl && (
        <div style={{ marginTop: "20px" }}>
          <h3>Загруженное изображение:</h3>
          <img src={imageUrl} alt="Uploaded" style={{ maxWidth: "400px" }} />
        </div>
      )}
    </div>
  );
};

export default ImageUploader;

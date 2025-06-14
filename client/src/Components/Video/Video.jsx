import React, { useState, useRef } from "react";
import { Editor } from 'react-draft-wysiwyg';
import { EditorState, convertToRaw  } from 'draft-js';  // Импортировать EditorState из 'draft-js'
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import axios from "axios";
import "./video.css"

export default function VideoEditor () {
    const [file, setFile] = useState(null); // Состояние для файла
    const [error, setError] = useState(null); // Состояние для ошибки
    const [editorState, setEditorState] = useState(EditorState.createEmpty());

    const title = useRef();
    const description = useRef();

    if (error) return <p>{error}</p>;

    // Обработчик выбора файла
    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleEditorChange = (newState) => {
        setEditorState(newState);
    };

    // Загрузка файла 
    const handleUploadVideo = async (e) => {
        e.preventDefault();
    
        if (!file) {
            setError("Выберите файл для загрузки");
            return; // Добавим return, чтобы предотвратить дальнейшее выполнение функции
        }

        const content = editorState.getCurrentContent();
        const rawContent = convertToRaw(content); // Преобразуем содержимое в raw формат
    
        const formData = new FormData();
        formData.append("video", file);
        formData.append("title", title.current.value); // Добавляем название
        //formData.append("description", description.current.value) // Добавляем описание
        formData.append("description", JSON.stringify(rawContent)); // Отправляем сериализованный контент

        console.log(rawContent);
        
        try {
            const response = await axios.post(
                `${process.env.REACT_APP_BACKEND}upload/video`, // Добавлены кавычки и слэш перед 'upload'
                formData,
                {
                    headers: { "Content-Type": "multipart/form-data" },
                }
            );
    
            if (response.status === 201) { // Проверяем статус ответа
                // Здесь можно обработать успешный ответ
                console.log("Видео успешно загружено:", response.data);
            } else {
                setError("Ошибка при загрузке видео");
            }
        } catch (error) {
            setError("Ошибка при загрузке видео: " + error.message); // Обработка ошибки
            console.error("Ошибка при загрузке видео:", error); // Логирование ошибки
        }
    };
    

    return(
        <>
            <h1>Форма для работы с видео</h1>
            <form>
                <h1>Добавление видео</h1>
                <input type="file" onChange={handleFileChange} />
                <input type="text" placeholder="Название" ref={title} />
                <input type="text" placeholder="Описание" ref={description} />
                <div className="wraper_textarea">
                    <Editor
                        wrapperClassName="wrapper-class"
                        editorClassName="editor-class"
                        toolbarClassName="toolbar-class"
                        editorState={editorState}
                        onEditorStateChange={handleEditorChange}
                    />
                </div>
                <br />
                <button type="submit" onClick={handleUploadVideo}>Загрузить</button>
            </form>
        </>
    )
}
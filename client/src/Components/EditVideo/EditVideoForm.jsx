import { useState, useEffect } from "react";
import SmartSelect from "../smartSelect/SmartSelect";
import { Editor } from 'react-draft-wysiwyg';
import { EditorState, convertToRaw, convertFromRaw  } from 'draft-js';  // Импортировать EditorState из 'draft-js'
import axios from "axios";
import {notify} from "../../Middleware/toast"

export default function EditVideoForm () {
    const [allVideo, setAllVideo] = useState([]);
    const [allVideoGroup, setAllVideoGroup] = useState([]);
    const [selectedVideo, setSelectedVideo] = useState(null);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [selectedVideoGroup, setSelectedVideoGroup] = useState([]);
    const [editorState, setEditorState] = useState(EditorState.createEmpty());
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Загружаем все видео
    useEffect(() => {
        const fetchData = async (url, setter, transform = (data) => data) => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_BACKEND}${url}`);
                setter(transform(response.data));
            } catch (err) {
                setError(`Error fetching ${url}`);
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData("video/all", setAllVideo);
        fetchData("videoGroups/all", setAllVideoGroup);
    }, []);

    if (loading) return <p>Loading...</p>; // Индикация загрузки
    if (error) return <p>{error}</p>; // Вывод ошибки, если она возникла

    const handleEditorChange = (newState) => {
        setEditorState(newState);
    };

    // Обработчик выбора Видео
    const handleChangeVideo = (e) => {
        const selected = allVideo.find((video) => video.title === e.target.value);
        setSelectedVideo(selected);
        setTitle(selected?.title || "");
        setDescription(selected?.description || "");

        // Если у видео есть теги, устанавливаем их как выбранные
        if (selected?.tags) {
            const selectedTags = selected.tags.map(tag => ({
                value: tag._id, 
                label: allVideoGroup.find(group => group._id === tag._id)?.groupname || "Неизвестный тег"
            }));
            setSelectedVideoGroup(selectedTags);
        } else {
            setSelectedVideoGroup([]); // Если тегов нет, сбрасываем
        }

        if (selected?.description && selected.description.blocks) {
            try {
                // Убедимся, что entityMap есть
                const raw = {
                    ...selected.description,
                    entityMap: selected.description.entityMap || {},
                };
        
                const contentState = convertFromRaw(raw);
                setEditorState(EditorState.createWithContent(contentState));
            } catch (err) {
                console.error("Ошибка при конвертации описания:", err);
                setEditorState(EditorState.createEmpty());
            }
        } else {
            setEditorState(EditorState.createEmpty());
        }
    };

    // Обработчик отправки данных
    const handleSubmit = async (e) => {
        e.preventDefault();
    
        if(selectedVideoGroup.length === 0) {
            console.log("Ошибка: Не выбраны тэги");
            return;
        }

        const content = editorState.getCurrentContent();
        const rawContent = convertToRaw(content); // Преобразуем содержимое в raw формат
        console.log(description);
    
        try {
            const updatedVideo = {
                ...selectedVideo,
                title,
                description: rawContent,
                tags: selectedVideoGroup.map(tag => ({
                    _id: tag.value, // ID тега
                    groupname: tag.label // Имя тега
                }))
            };
    
            console.log(updatedVideo);
            const response = await axios.put(`${process.env.REACT_APP_BACKEND}video/${selectedVideo._id}`, updatedVideo);
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
            
            const response = await axios.delete(`${process.env.REACT_APP_BACKEND}video/${selectedVideo._id}`);
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

    // Подготовка данных для SmartSelect
    const formatOptions = (arr, valueKey, labelKey) =>
        arr.map(item => ({
            value: item[valueKey],
            label: item[labelKey]
    }));

    const videoGroupOptions = formatOptions(allVideoGroup, "_id", "groupname");

    return (
        <div className="">
            <h1>Редактирование видео</h1>
            <form onSubmit={handleSubmit}>
                <label>Выберите видео</label>
                <select value={selectedVideo?.title} onChange={handleChangeVideo}>
                    <option value="">Выберите видео</option>
                    {allVideo.map((video) => (
                        <option key={video._id} value={video.title}>
                            {video.title}
                        </option>
                    ))}
                </select>

                {selectedVideo && (
                    <>
                        <h2>Данные выбранного видео</h2>
                        <div>
                            <label>Название</label>
                            <input 
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Название видео"
                            />
                        </div>
                        <div>
                        <Editor
                            wrapperClassName="wrapper-class"
                            editorClassName="editor-class"
                            toolbarClassName="toolbar-class"
                            editorState={editorState}
                            onEditorStateChange={handleEditorChange}
                        />
                        </div>
                        <div>
                            <SmartSelect 
                                options={videoGroupOptions}
                                setIsMilti={true}
                                selectedProducts={selectedVideoGroup}
                                setSelectedProducts={setSelectedVideoGroup}
                                setPlaceholder="Выберите тэги для видео..."
                            />
                        </div> <br />
                        <button type="submit">Сохранить</button> <br /><br />
                        <button onClick={handleDeleteVideo}>Удалить видео</button>
                    </>
                )}
            </form>
        </div>
    )
};
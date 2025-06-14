import React, { useEffect, useState, useContext, useRef } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import ReactPlayer from "react-player";
import { useSwipeable } from "react-swipeable";
import Header from "../../Components/header/Header";
import { AuthContext } from "../../context/AuthContext";
import "./shorts.css";
import { BiLike } from "react-icons/bi";
import { BiDislike } from "react-icons/bi";
import { LiaCommentSolid } from "react-icons/lia";
import draftToHtml from 'draftjs-to-html';
import {notify} from "../../Middleware/toast"

function useQuery() {
    return new URLSearchParams(useLocation().search);
}

export default function ShortsComponent() {
    const [allVideo, setAllVideo] = useState([]);
    const [allComments, setAllComments] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [likedVideos, setLikedVideos] = useState({}); // Отслеживание лайков
    const [dislikedVideos, setDislikedVideos] = useState({}); // Отслеживание дизлайков
    const [userReactions, setUserReactions] = useState({});//хранит лайки/дизлайки пользователя
    const context = useContext(AuthContext);
    const crtUser = context.user;
    const [showComments, setShowComments] = useState(false);
    
    const [newComment, setNewComment] = useState({
        userName: context?.user?.username, // Предзаполняем имя пользователя
        text: "",
    });

    const commentsRef = useRef(null);

    const query = useQuery();
    const groupname = query.get("groupname");

    useEffect(() => {
        const fetchAllVideo = async () => {
            try {
                const response = await axios.get(
                    process.env.REACT_APP_BACKEND + "video/all",
                    {
                      params: groupname ? { groupname } : {}
                    }
                  );                  
                setAllVideo(response.data);
                // Загружаем комментарии для первого видео
                if (response.data.length > 0) {
                    setAllComments(response.data[0].comments || []);
                }
            } catch (error) {
                console.error(error);
                setError("Ошибка при загрузке видео");
            } finally {
                setLoading(false);
            }
        };
    
        fetchAllVideo();
    }, [groupname]);

    useEffect(() => {
        if (allVideo.length > 0) {
            setAllComments(allVideo[currentIndex]?.comments || []);
            setUserReactions(0);
        }
    }, [currentIndex, allVideo]);

    useEffect(() => {
        if (commentsRef.current) {
            commentsRef.current.scrollTop = commentsRef.current.scrollHeight;
        }
    }, [allComments]);

    const handleNext = () => {
        setCurrentIndex((prev) => (prev + 1) % allVideo.length);
    };

    const handlePrev = () => {
        setCurrentIndex((prev) => (prev - 1 + allVideo.length) % allVideo.length);
    };
    // Обработчик свайпов
    const handlers = useSwipeable({
        onSwipedUp: handleNext,
        onSwipedDown: handlePrev,
        preventScrollOnSwipe: true,
        trackMouse: true,
    });
    const handleWheel = (event) => {
        if (event.deltaY > 0) {
            handleNext();
        } else {
            handlePrev();
        }
    };

    if (loading) return <p>Loading...</p>;
    if (error) return <p>{error}</p>;

    // Функция лайков
    const handleLike = async (videoId) => {
        const isLiked = likedVideos[videoId];
        const isDisliked = dislikedVideos[videoId];
    
        try {
            if (isLiked) {
                // Убираем лайк
                await axios.put(`${process.env.REACT_APP_BACKEND}video/${videoId}/unlike`);
            } else {
                // Ставим лайк
                await axios.put(`${process.env.REACT_APP_BACKEND}video/${videoId}/like`);
                // Если был дизлайк — убираем его
                if (isDisliked) {
                    await axios.put(`${process.env.REACT_APP_BACKEND}video/${videoId}/undislike`);
                }
            }
    
            // Обновляем локальное состояние
            setLikedVideos((prev) => ({ ...prev, [videoId]: !isLiked }));
            setDislikedVideos((prev) => ({ ...prev, [videoId]: false }));
    
            // Обновляем количество лайков и дизлайков
            setAllVideo((prevVideos) =>
                prevVideos.map((video) => {
                    if (video._id !== videoId) return video;
    
                    let likes = video.likes + (isLiked ? -1 : 1);
                    let disLike = isDisliked && !isLiked ? video.disLike - 1 : video.disLike;
    
                    return { ...video, likes, disLike };
                })
            );
        } catch (error) {
            console.error("Ошибка при изменении лайка:", error);
        }
    };
    

    // Функция дизлайков
    const handleDisLike = async (videoId) => {
        const isDisliked = dislikedVideos[videoId];
        const isLiked = likedVideos[videoId];
    
        try {
            if (isDisliked) {
                // Убираем дизлайк
                await axios.put(`${process.env.REACT_APP_BACKEND}video/${videoId}/undislike`);
            } else {
                // Ставим дизлайк
                await axios.put(`${process.env.REACT_APP_BACKEND}video/${videoId}/dislike`);
                // Если был лайк — убираем его
                if (isLiked) {
                    await axios.put(`${process.env.REACT_APP_BACKEND}video/${videoId}/unlike`);
                }
            }
    
            // Обновляем локальное состояние
            setDislikedVideos((prev) => ({ ...prev, [videoId]: !isDisliked }));
            setLikedVideos((prev) => ({ ...prev, [videoId]: false }));
    
            // Обновляем количество дизлайков и лайков
            setAllVideo((prevVideos) =>
                prevVideos.map((video) => {
                    if (video._id !== videoId) return video;
    
                    let disLike = video.disLike + (isDisliked ? -1 : 1);
                    let likes = isLiked && !isDisliked ? video.likes - 1 : video.likes;
    
                    return { ...video, likes, disLike };
                })
            );
        } catch (error) {
            console.error("Ошибка при изменении дизлайка:", error);
        }
    };
    
    //Функция реакции юсера 
    const handleReaction = (videoId, type) => {
        if (type === "like") {
            handleLike(videoId);
        } else if (type === "dislike") {
            handleDisLike(videoId);
        }
    };

    // Функция изменения значений инпутов
    const handleChange = (e) => {
        setNewComment({
            ...newComment,
            [e.target.name]: e.target.value, // Динамически обновляем state
        });
    };

    // Добавление комментария
    const handleAddComment = async (videoId) => {
        try {
            await axios.put(`${process.env.REACT_APP_BACKEND}video/${videoId}/comment`, newComment);
            
            // Обновляем локально список комментариев
            setAllComments((prevComments) => [
                ...prevComments,
                { 
                    userName: newComment.userName, 
                    text: newComment.text, 
                    commentDate: new Date().toISOString() 
                }
            ]);
    
            // Обновляем комментарии в allVideo
            setAllVideo((prevVideos) =>
                prevVideos.map((video) =>
                    video._id === videoId
                        ? { ...video, comments: [...video.comments, newComment] }
                        : video
                )
            );
    
            setNewComment({ userName: context.user.username, text: "" });
        } catch (error) {
            console.error("Ошибка при добавлении комментария:", error);
        }
    };

    // Удаление комментария
    const handleDelComment = async (videoId, commentId) => {
        try {
            const response = await axios.delete(`${process.env.REACT_APP_BACKEND}video/${videoId}/comment/${commentId}`);
    
           //Фильтруем удалённый комментарий и обновляем локальное состояние
            setAllComments((prevComments) => prevComments.filter(comment => comment._id !== commentId));

            // Обновляем состояние allVideo, удаляя комментарий
            setAllVideo((prevVideos) =>
                prevVideos.map((video) =>
                    video._id === videoId
                        ? {
                            ...video,
                            comments: video.comments.filter(comment => comment._id !== commentId)
                        }
                        : video
                )
            );

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
        <>
            <Header />
            <div className="shorts-page" {...handlers} onWheel={handleWheel}>
                <div className="shorts-container">
                    {allVideo.length > 0 ? (
                        <div className="main-container-shorts">
                            <div className="video-wrapper">
                                <ReactPlayer
                                    url={allVideo[currentIndex]?.videoUrl}
                                    controls
                                    playing={true}
                                    loop={true}
                                    width="100%"
                                    height="100%"
                                    style={{ objectFit: "cover" }}
                                />
                            </div>
                            <div className="video-actions">
                                <BiLike
                                    size={30}
                                    color={userReactions[allVideo[currentIndex]?._id] === "like" ? "green" : "gray"}
                                    onClick={() => handleReaction(allVideo[currentIndex]?._id, "like")}
                                    style={{ cursor: "pointer" }}
                                />
                                <span>{allVideo[currentIndex]?.likes}</span>
                                <BiDislike
                                    size={30}
                                    color={userReactions[allVideo[currentIndex]?._id] === "dislike" ? "red" : "gray"}
                                    onClick={() => handleReaction(allVideo[currentIndex]?._id, "dislike")}
                                    style={{ cursor: "pointer" }}
                                />
                                <span>{allVideo[currentIndex]?.disLike}</span>
                                <LiaCommentSolid
                                    size={30}
                                    color="gray"
                                    onClick={() => setShowComments(!showComments)}
                                    style={{ cursor: "pointer" }}
                                />
                            </div>
                            <div className="video-description">
                                <h1>Описание: </h1>
                                <div
                                    dangerouslySetInnerHTML={{
                                        __html: draftToHtml(allVideo[currentIndex]?.description || {}),
                                    }}
                                />
                                <h2>Тэги</h2>
                                <p>
                                    {allVideo[currentIndex]?.tags.map((tag) => ( 
                                        <p key={tag._id}>#{tag.groupname}</p>
                                    ))}
                                </p>
                            </div>
                        </div>
                    ) : (
                        <p>Нет доступных видео</p>
                    )}
                </div>
            </div>
            {showComments && (
                <div className="comments-panel" ref={commentsRef}>
                    <h1>Комментарии</h1>
                    {crtUser ? (
                        <form onSubmit={(e) => e.preventDefault()}>
                            <input
                                type="text"
                                placeholder="Имя пользователя"
                                name="userName"
                                value={newComment.userName}
                                onChange={handleChange}
                            />
                            <input
                                type="text"
                                placeholder="Комментарий"
                                name="text"
                                value={newComment.text}
                                onChange={handleChange}
                            />
                            <button onClick={() => handleAddComment(allVideo[currentIndex]?._id)}>Сохранить</button>
                        </form>
                    ) : (
                        <p></p>
                    )}
                    <div className="all-comments">
                        {allComments && allComments.length > 0 ? (
                            allComments.map((comment) => (
                                <div key={comment._id} className="comment-item">
                                    <h3>Пользователь: {comment.userName}</h3>
                                    <p>{comment.text}</p>
                                    <p>{new Date(comment.commentDate).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })}</p>
                                    {crtUser && crtUser.isAdmin && (
                                        <button onClick={() => handleDelComment(allVideo[currentIndex]?._id, comment._id)}>Удалить комментарий</button>
                                    )}
                                </div>
                            ))
                        ) : (
                            <p>Комментариев пока нет</p>
                        )}
                    </div>
                </div>
            )}
        </>
    );
};

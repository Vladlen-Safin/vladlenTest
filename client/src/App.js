import './App.css';
import { Routes, Route, BrowserRouter, Navigate } from 'react-router-dom';
import FirstPage from './pages/First_page/FirstPage';
import Register from './pages/Registration/Register';
import Login from './pages/Login/Login';
import Admin from './pages/Admin/Admin';
import CardDetails from './pages/CardDetails/CardDetails';
import RecipeDetails from './pages/RecipeDetails/RecipeDetails';
import Profile from './pages/Profile/Profile';
import ShortsComponent from './pages/Shorts/Shorts';
import PayPage from './pages/PayPage/PayPage';
import { AuthContext } from './context/AuthContext';
import { useContext } from 'react';

// Работа с уведомлениями
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
    const { user } = useContext(AuthContext) || {}; // Проверяем, если контекст пустой

    return (
        <>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<FirstPage />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/profile" element={user ? <Profile /> : <Navigate to="/login" />} />
                    <Route path='/shorts' element={<ShortsComponent />}/>
                    <Route path="/card/:id" element={<CardDetails />} />
                    <Route path="/recipe/:id" element={<RecipeDetails />} />
                    <Route path="/paypage" element={<PayPage />} />
                    
                    {/* Защищенный маршрут для администратора */}
                    <Route 
                        path="/admin" 
                        element={user?.isAdmin ? <Admin /> : <Navigate to="/" />} 
                    />
                    
                    {/* Перенаправление на главную, если маршрут не найден */}
                    <Route path="*" element={<Navigate to="/" />} />
                </Routes>
            </BrowserRouter>
            <ToastContainer 
                position="top-right" 
                autoClose={3000}
                closeOnClick={true}
            />
        </>
    );
}

export default App;

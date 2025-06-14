import axios from "axios";

// export const loginCall = async (userCredential, dispatch) => {
//     dispatch({ type: "LOGIN_START"});
//     try {
//         console.log("Попалю сюда 0");
//         const res = await axios.post(process.env.REACT_APP_BACKEND + "auth/login", userCredential);
//         console.log("Попалю сюда 0.1", res);
//         if (res.status === 200) {
//             console.log("Попалю сюда 1");
            
//             dispatch({ type: "LOGIN_SUCCESS", payload: res.data});
//         } else {
//             console.log("Попалю сюда 2");
//             alert("Произошла ошибка", res.data);
//         }
//     } catch (error) {
//         dispatch({ type: "LOGIN_FAILURE", payload: error})
//     }
// };

export const loginCall = async (userCredential, dispatch) => {
    dispatch({ type: "LOGIN_START" });
    try {
        const res = await axios.post(`${process.env.REACT_APP_BACKEND}auth/login`, userCredential);

        if (res.status === 200 && !res.data.error) {
            dispatch({ type: "LOGIN_SUCCESS", payload: res.data });
            return { success: true };
        } else {
            dispatch({ type: "LOGIN_FAILURE", payload: res.data.error });
            return { success: false, error: res.data.error }; 
        }
    } catch (error) {
        dispatch({ type: "LOGIN_FAILURE", payload: error });
        return { success: false, error: error.message || "Unknown error" };
    }
};

export const loginCallGoogle = async (dispatch) => {
    dispatch({ type: "LOGIN_START" });
    try {
      // Запрос на получение данных о пользователе после успешной авторизации
      const res = await axios.get(`${process.env.REACT_APP_BACKEND}/auth/me`, {
        withCredentials: true, // Включаем куки для сессии
      });

      dispatch({ type: "LOGIN_SUCCESS", payload: res.data });
      localStorage.setItem("user", JSON.stringify(res.data)); // Сохраняем данные в localStorage
    } catch (error) {
      dispatch({ type: "LOGIN_FAILURE", payload: error });
    }
};

/*import React, { createContext, useContext, useState } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    const login = (token) => {
        localStorage.setItem("token", token);
        setUser({ token });
    };

    const logout = () => {
        localStorage.removeItem("token");
        setUser(null);
    };

    const isAuthenticated = () => !!localStorage.getItem("token");

    return (
        <AuthContext.Provider value={{ user, login, logout, isAuthenticated }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);*/

// РАБОЧИЙ ВАРИАНТ
// import { createContext, useEffect, useReducer } from "react";
// import AuthReducer from "./AuthReducer";
// import { AuthActionTypes } from "./AuthActionTypes";

// const INITIAL_STATE = {
//   user:JSON.parse(localStorage.getItem("user")) || null,
//   isFetching: false,
//   error: false,
// };


// export const AuthContext = createContext(INITIAL_STATE);

// export const AuthContextProvider = ({ children }) => {
//   const [state, dispatch] = useReducer(AuthReducer, INITIAL_STATE);
  
//   useEffect(()=>{
//     localStorage.setItem("user", JSON.stringify(state.user))
//   },[state.user]);

//   const logout = () => {
//     dispatch({ type: AuthActionTypes.LOGOUT });
//     localStorage.removeItem("user");  // Удаляем пользователя из локального хранилища при выходе
//   };
  
//   return (
//     <AuthContext.Provider
//       value={{
//         user: state.user,
//         isFetching: state.isFetching,
//         error: state.error,
//         dispatch,
//         logout
//       }}
//     >
//       {children}
//     </AuthContext.Provider>
//   );
// };

// ТЕСТ 1
import { createContext, useEffect, useReducer } from "react";
import AuthReducer from "./AuthReducer";
import { AuthActionTypes } from "./AuthActionTypes";

const INITIAL_STATE = {
  user: JSON.parse(localStorage.getItem("user")) || null,
  isFetching: false,
  error: false,
};

export const AuthContext = createContext(INITIAL_STATE);

export const AuthContextProvider = ({ children }) => {
  const [state, dispatch] = useReducer(AuthReducer, INITIAL_STATE);

  useEffect(() => {
    // Сохраняем данные пользователя в localStorage, когда они меняются
    localStorage.setItem("user", JSON.stringify(state.user));
  }, [state.user]);

  const logout = () => {
    dispatch({ type: AuthActionTypes.LOGOUT });
    localStorage.removeItem("user"); // Удаляем пользователя из локального хранилища при выходе
  };

  return (
    <AuthContext.Provider
      value={{
        user: state.user,
        isFetching: state.isFetching,
        error: state.error,
        dispatch,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};


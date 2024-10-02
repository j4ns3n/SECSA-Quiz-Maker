import React, { createContext, useContext, useReducer } from 'react';

export const UserContext = createContext()

export const userReducer = (state, action) => {
    switch (action.type) {
        case 'SET_USERS':
            return {
                ...state,
                user: action.payload
            }
        case 'CREATE_USER':
            return {
                user: [action.payload, ...(state.user || [])]
            }
        case 'DELETE_USER':
            return {
                user: state.user.filter(u => u._id !== action.payload),
            };
        case 'LOGOUT':
            return {
                ...state,
                user: null
            };

        default:
            return state
    }
}

export const UserContextProvider = ({ children }) => {

    const [state, dispatch] = useReducer(userReducer, {
        user: []
    });


    return (
        <UserContext.Provider value={{ user: state.user, dispatch }}>
            {children}
        </UserContext.Provider>
    );
}

export const useUserContext = () => useContext(UserContext);
import React, { createContext, useContext, useReducer } from 'react';

export const UserContext = createContext()

export const userReducer = (state, action) => {
    switch (action.type) {
        case 'SET_USERS':
            return {
                ...state,
                users: action.payload,
            };
        case 'CREATE_USER':
            return {
                ...state,
                users: [action.payload, ...(state.users || [])], // Add new user to the beginning
            };
        case 'UPDATE_USER':
            console.log('Before Update:', state.users); // Log current state users
            console.log('Updating User:', action.payload); // Log the user to update

            const updatedUsers = state.users.map(u =>
                u._id === action.payload._id ? action.payload : u
            );

            console.log('After Update:', updatedUsers); // Log updated users

            return {
                ...state,
                users: updatedUsers,
            };
        case 'DELETE_USER':
            return {
                ...state,
                users: state.users.filter(u => u._id !== action.payload),
            };
        case 'LOGOUT':
            return {
                ...state,
                users: null,
            };
        default:
            return state;
    }
};


export const UserContextProvider = ({ children }) => {

    const [state, dispatch] = useReducer(userReducer, {
        users: []
    });


    return (
        <UserContext.Provider value={{ users: state.users, dispatch }}>
            {children}
        </UserContext.Provider>
    );
}

export const useUserContext = () => useContext(UserContext);
import React, { createContext, useContext, useReducer } from 'react';

export const UserContext = createContext()

export const userReducer = (state, action) => {
    switch (action.type) {
        case 'SET_USER':
            return {
                ...state,
                user: action.payload
            }
        case 'CREATE_USER':
            return {
                user: [action.payload, ...(state.user || [])]
            }
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
        user: null
    })


    return (
        <UserContext.Provider value={{ user: state.user, dispatch }}>
            {children}
        </UserContext.Provider>
    )
}

export const useUserContext = () => useContext(UserContext);
import { UserContext } from "../context/UserContext/UserContext";
import { useContext } from "react";

export const useUserContext = () => {
    const context = useContext(UserContext)

    if(!context) {
        throw Error('useUserContext must be use inside an UserContextProvider')
    }

    return context
}
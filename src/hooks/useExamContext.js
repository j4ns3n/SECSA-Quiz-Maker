import { ExamContext } from "../context/ExamContext/ExamContext";
import { useContext } from "react";

export const useExamContext = () => {
    const context = useContext(ExamContext)

    if(!context) {
        throw Error('useExamContext must be use inside an ExamContextProvider')
    }

    return context
}
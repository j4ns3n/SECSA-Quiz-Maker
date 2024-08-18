import { CourseContext } from "../context/CourseContext/CourseContext";
import { useContext } from "react";

export const useCoursesContext = () => {
    const context = useContext(CourseContext)

    if(!context) {
        throw Error('useCourseContext must be use inside an CourseContextProvider')
    }

    return context
}
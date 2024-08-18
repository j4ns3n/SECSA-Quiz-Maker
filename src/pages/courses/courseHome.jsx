import { useEffect } from "react"
import { useCoursesContext } from "../../hooks/useCourseContext"
// components
import CoursesList from '../../components/courses/Course.jsx'

const  CourseHome = () => {
    const {courses, dispatch} = useCoursesContext()

    useEffect(() => {
        const fetchCourse = async () => {
            const response = await fetch('/api/courses')
            const json = await response.json();

            if(response.ok) {
                dispatch({type: 'SET_COURSES', payload: json})
            }

        }

        fetchCourse();
    }, [])

    return(
        <div className="home">
            <div className="workouts">
                {courses && courses.map((course) => (
                    <CoursesList key={course._id} course={course}/>
                ))}
            </div>
        </div>
    )
}

export default CourseHome
import { Link } from 'react-router-dom'
 
const CourseNavbar = () => {
    return (
        <header>
            <div className="container">
                <Link to="/">
                    <h1>SECSA Quiz Maker</h1>
                </Link>
            </div>
        </header>
    )
}


export default CourseNavbar
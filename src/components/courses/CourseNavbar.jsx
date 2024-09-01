import { Link, useNavigate } from 'react-router-dom'

const CourseNavbar = ({ onLogout }) => {
    const handleLogout = async () => {
        // Perform logout actions
        await onLogout(); // Ensure it handles logout and updates state
    };



    return (
        <header>
            <div className="container">
                <Link to="/">
                    <h1>SECSA Quiz Maker</h1>
                </Link>
                <button className='button' onClick={handleLogout}>LOGOUT</button>
            </div>
        </header>
    )
}

export default CourseNavbar
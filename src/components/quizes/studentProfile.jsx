import React from 'react'
import Profile from '../users/profile'
import { AppBar, IconButton, Container } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import scbackground from '../../assets/sbbg.png';
import { useNavigate } from 'react-router-dom'; // Import useNavigate

export const StudentProfile = () => {

    const navigate = useNavigate(); // Initialize navigate

    const handleBack = async () => {
        navigate('/exam');
    }

    return (
        <div style={{
            height: '100vh',
            backgroundImage: `url(${scbackground})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            color: '#fff'
        }}>
            <AppBar position="static" style={{
                backgroundColor: 'transparent',
            }}>
            </AppBar>

            {/* Main Content */}
            <Container maxWidth="sm" style={{ textAlign: 'center', marginTop: '20vh' }}>
                <IconButton sx={{ float: 'left', color: '#fff' }} onClick={handleBack}><ArrowBackIcon /></IconButton>
                <Profile />
            </Container>
        </div>
    )
}

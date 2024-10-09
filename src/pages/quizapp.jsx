import React from 'react'
import { AppBar, Toolbar, Button, TextField, Container, Box, Typography } from '@mui/material';
import LogoSecsa from '../assets/secsalogo.png';

const QuizApp = () => {
    return (
        <div style={{
            height: '100vh',
            background: 'linear-gradient(to bottom, #893200, #ff9b61)',
            color: '#fff'
        }}>
            {/* Top Bar */}
            <AppBar position="static" style={{ backgroundColor: '#914214' }}>
                <Toolbar>
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                        <img src={LogoSecsa} alt="logo" style={{ height: '40px' }} />
                    </Typography>
                </Toolbar>
            </AppBar>

            {/* Main Content */}
            <Container maxWidth="sm" style={{ textAlign: 'center', marginTop: '15vh' }}>
                <Typography variant="h3" style={{ marginBottom: '50px', fontWeight: 'bold' }}>
                    SECSA Quiz Maker
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, padding: '20px' }}>
                    <TextField
                        variant="outlined"
                        placeholder="Enter quiz code"
                        InputProps={{
                            style: {
                                backgroundColor: '#fff',
                                borderRadius: '8px',
                                width: '250px',
                            },
                        }}
                    />
                    <Button variant="outlined" style={{ backgroundColor: '#914214', color: "#fff" }}>
                        Join
                    </Button>
                </Box>
            </Container>
        </div>
    );
}

export default QuizApp
import React from 'react';
import { Box, Typography } from '@mui/material';

const Footer = () => {
    return (
        <Box
            sx={{
                position: 'fixed',
                left: 0,
                bottom: 0,
                width: '100%',
                maxWidth: '100%',
                mx: 'auto',
                p: 2,
                textAlign: 'center',
                backgroundColor: '#f5f5f5',
                color: '#555',
                borderTop: '1px solid #ddd',
                zIndex: 9999,
            }}
        >
            <Typography variant="body2">
                <strong>
                    &copy; {new Date().getFullYear()} Jansen Paul & Company. All Rights Reserved.
                </strong>
            </Typography>
        </Box>
    );
};

export default Footer;

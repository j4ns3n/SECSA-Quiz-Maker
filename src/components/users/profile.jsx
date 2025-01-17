import React, { useState, useEffect } from 'react';
import {
    Stack, Paper, Box, IconButton, Typography, Table, TableBody,
    TableCell, TableRow, Modal, TextField, Button, Snackbar, Alert
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { jwtDecode } from 'jwt-decode';
import EditIcon from '@mui/icons-material/Edit';
import bcrypt from 'bcryptjs';

const DemoPaper2 = styled(Paper)(({ theme }) => ({
    width: 720,
    padding: theme.spacing(2),
    ...theme.typography.body2
}));

const modalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    boxShadow: 24,
    p: 4,
    borderRadius: 2,
};

export default function Profile() {
    const [decodedToken, setDecodedToken] = useState(null);
    const [userData, setUserData] = useState({});
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({});
    const [passwords, setPasswords] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });
    const [passwordError, setPasswordError] = useState('');
    const [error, setError] = useState(''); // State for generic errors
    const [snackbarOpen, setSnackbarOpen] = useState(false); // State for Snackbar
    const [snackbarMessage, setSnackbarMessage] = useState(''); // Snackbar message

    useEffect(() => {
        const token = localStorage.getItem("authToken");
        if (token) {
            const decoded = jwtDecode(token);
            setDecodedToken(decoded);
        }
    }, []);

    useEffect(() => {
        if (decodedToken?.id) {
            getUser(decodedToken.id);
        }
    }, [decodedToken]);

    const getUser = async (id) => {
        try {
            const response = await fetch(`/api/user/${id}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                const data = await response.json();
                setUserData(data.user);
            } else {
                console.error('Error fetching user data:', response.status);
            }
        } catch (error) {
            console.error('Error fetching user data:', error);
        }
    };

    const handleEditClick = () => {
        setFormData(userData);
        setPasswords({
            currentPassword: '',
            newPassword: '',
            confirmPassword: '',
        });
        setIsModalOpen(true);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (['currentPassword', 'newPassword', 'confirmPassword'].includes(name)) {
            setPasswords((prev) => ({
                ...prev,
                [name]: value,
            }));
        } else {
            setFormData((prev) => ({
                ...prev,
                [name]: value,
            }));
        }
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();

        // Check if the current password matches the stored hashed password
        const isMatch = await bcrypt.compare(passwords.currentPassword, userData.password);
        if (!isMatch) {
            setPasswordError('Current password is incorrect.');
            return;
        }

        // Check if new password and confirm password match
        if (passwords.newPassword !== passwords.confirmPassword) {
            setPasswordError('New password and confirm password do not match.');
            return;
        }


        const hashedPassword = await bcrypt.hash(passwords.newPassword, 10);
        setPasswordError('');

        // Proceed with updating the password (hashed) and other data
        const updatedData = { ...formData, password: hashedPassword };

        try {
            const response = await fetch(`/api/user/${userData._id}`, {
                method: 'PATCH',
                body: JSON.stringify(updatedData),
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const json = await response.json();

            if (!response.ok) {
                setError(json.error);
                return;
            }

            // Trigger success snackbar
            setSnackbarMessage('Information updated successfully!');
            setUserData(json);
            setSnackbarOpen(true);
            setIsModalOpen(false);
        } catch (err) {
            setError('An error occurred during updating. Please try again later.');
            console.error('Error:', err);
        }
    };

    const handleSnackbarClose = () => {
        setSnackbarOpen(false);
    };

    return (
        <Stack direction="row" spacing={1} justifyContent={'center'}>
            <DemoPaper2 variant="outlined">
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant='h5'>General Information</Typography>
                    <IconButton onClick={handleEditClick}>
                        <EditIcon />
                    </IconButton>
                </Box>
                <br />
                <Table>
                    <TableBody>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 'bold' }}>First Name</TableCell>
                            <TableCell>{userData.firstName}</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 'bold' }}>Middle Name</TableCell>
                            <TableCell>{userData.middleName}</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 'bold' }}>Last Name</TableCell>
                            <TableCell>{userData.lastName}</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 'bold' }}>Role</TableCell>
                            <TableCell>{userData.role}</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 'bold' }}>Email</TableCell>
                            <TableCell>{userData.email}</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 'bold' }}>Username</TableCell>
                            <TableCell>{userData.username}</TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </DemoPaper2>

            {/* Modal */}
            <Modal
                open={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                aria-labelledby="edit-modal-title"
                aria-describedby="edit-modal-description"
            >
                <Box sx={modalStyle}>
                    <Typography id="edit-modal-title" variant="h6" component="h2" marginBottom={2}>
                        Edit Information
                    </Typography>
                    <form onSubmit={handleFormSubmit}>
                        <TextField
                            fullWidth
                            margin="normal"
                            label="First Name"
                            name="firstName"
                            value={formData.firstName || ''}
                            onChange={handleInputChange}
                        />
                        <TextField
                            fullWidth
                            margin="normal"
                            label="Middle Name"
                            name="middleName"
                            value={formData.middleName || ''}
                            onChange={handleInputChange}
                        />
                        <TextField
                            fullWidth
                            margin="normal"
                            label="Last Name"
                            name="lastName"
                            value={formData.lastName || ''}
                            onChange={handleInputChange}
                        />
                        <TextField
                            fullWidth
                            margin="normal"
                            label="Email"
                            name="email"
                            value={formData.email || ''}
                            onChange={handleInputChange}
                        />
                        <TextField
                            fullWidth
                            margin="normal"
                            label="Username"
                            name="username"
                            value={formData.username || ''}
                            onChange={handleInputChange}
                        />
                        <TextField
                            fullWidth
                            margin="normal"
                            label="Current Password"
                            name="currentPassword"
                            type="password"
                            value={passwords.currentPassword}
                            onChange={handleInputChange}
                        />
                        <TextField
                            fullWidth
                            margin="normal"
                            label="New Password"
                            name="newPassword"
                            type="password"
                            value={passwords.newPassword}
                            onChange={handleInputChange}
                        />
                        <TextField
                            fullWidth
                            margin="normal"
                            label="Confirm Password"
                            name="confirmPassword"
                            type="password"
                            value={passwords.confirmPassword}
                            onChange={handleInputChange}
                        />
                        {passwordError && (
                            <Typography color="error" variant="body2" marginBottom={2}>
                                {passwordError}
                            </Typography>
                        )}
                        {error && (
                            <Typography color="error" variant="body2" marginBottom={2}>
                                {error}
                            </Typography>
                        )}
                        <Stack direction="row" justifyContent="flex-end" spacing={2} marginTop={2}>
                            <Button variant="contained" color="primary" type="submit">
                                Save
                            </Button>
                            <Button variant="outlined" onClick={() => setIsModalOpen(false)}>
                                Cancel
                            </Button>
                        </Stack>
                    </form>
                </Box>
            </Modal>

            {/* Snackbar */}
            <Snackbar
                open={snackbarOpen}
                autoHideDuration={6000}
                onClose={handleSnackbarClose}
            >
                <Alert onClose={handleSnackbarClose} variant="filled" severity="success" sx={{ width: '100%' }}>
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </Stack>
    );
}

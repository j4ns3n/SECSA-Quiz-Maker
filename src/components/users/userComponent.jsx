import * as React from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import {
    Typography,
    Button,
    Input,
    Box,
    CircularProgress,
    Alert,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    Snackbar
} from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { red, green } from '@mui/material/colors';
import { useState, useEffect } from 'react';
import { useUserContext } from '../../hooks/useUserContext';

export default function UserComponent() {
    const [formValues, setFormValues] = useState({
        firstName: '',
        middleName: '',
        lastName: '',
        department: '',
        username: '',
        password: '',
        email: '',
    });
    const { users, dispatch } = useUserContext();
    const [error, setError] = useState('');
    const [userId, setUserId] = useState('');
    const [loading, setLoading] = useState(true);
    const [editMode, setEditMode] = useState(false); // New state for edit mode
    const [alerts, setAlerts] = useState({ open: false, message: '', severity: 'success' });
    const [openDialog, setOpenDialog] = useState(false);

    const [errors, setErrors] = useState({
        firstName: false,
        middleName: false,
        lastName: false,
        department: false,
        username: false,
        password: false,
        email: false,
    });


    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await fetch('/api/user');
                if (!response.ok) {
                    throw new Error('Failed to fetch users');
                }
                const json = await response.json();
                dispatch({ type: 'SET_USERS', payload: json });
            } catch (err) {
                console.error('Error fetching users:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, [dispatch]);


    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormValues({
            ...formValues,
            [name]: value,
        });

        setErrors({
            ...errors,
            [name]: value === '' ? true : false,
        });
    };

    const validateForm = () => {
        const newErrors = {};
        Object.keys(formValues).forEach((key) => {
            newErrors[key] = formValues[key] === '';
        });
        setErrors(newErrors);

        return Object.values(newErrors).every((error) => error === false);
    };

    const handleSubmit = async () => {
        if (validateForm()) {
            if (editMode) {
                // Update existing user
                handleUpdateUser();
            } else {
                // Add new user
                handleAddUser();
            }
        }
    };

    const handleAddUser = async () => {
        try {
            const response = await fetch('/api/user/register', {
                method: 'POST',
                body: JSON.stringify(formValues),
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const json = await response.json();

            if (!response.ok) {
                setError(json.error);
            }

            if (response.ok) {
                console.log('New user added', json);
                dispatch({ type: 'CREATE_USER', payload: json });
                handleCancel();
                setAlerts({ open: true, message: 'User Added successfully!', severity: 'success' });
            }
        } catch (err) {
            setError('An error occurred during registration. Please try again later.');
            console.error('Error:', err);
        }
    };


    const handleUpdateUser = async () => {
        try {
            const response = await fetch(`/api/user/${userId}`, {
                method: 'PATCH',
                body: JSON.stringify(formValues),
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const json = await response.json();

            if (!response.ok) {
                setError(json.error);
                return;
            }

            // Dispatch the update action
            console.log('User updated', json); // Check the updated user data
            dispatch({ type: 'UPDATE_USER', payload: json });
            console.log(json);
            handleCancel();
            setAlerts({ open: true, message: 'User updated successfully!', severity: 'success' });
        } catch (err) {
            setError('An error occurred during updating. Please try again later.');
            console.error('Error:', err);
        }
    };


    const handleEditUser = (user) => {
        setFormValues({
            firstName: user.firstName,
            middleName: user.middleName,
            lastName: user.lastName,
            department: user.department,
            username: user.username,
            email: user.email,
        });
        setUserId(user._id); // Set the ID of the user being edited
        setEditMode(true);   // Enable edit mode
    };

    const handleCancel = () => {
        setFormValues({
            firstName: '',
            middleName: '',
            lastName: '',
            department: '',
            username: '',
            password: '',
            email: '',
        });
        setErrors({
            firstName: false,
            middleName: false,
            lastName: false,
            department: false,
            username: false,
            password: false,
            email: false,
        });
        setEditMode(false); // Reset edit mode
    };

    if (loading) {
        return <CircularProgress />;
    }

    if (error) {
        return <Alert severity="error">{error}</Alert>;
    }

    const handleDialogClose = () => {
        setOpenDialog(false);
    };

    const handleDeleteUser = async () => {
        try {
            const response = await fetch(`/api/user/${userId}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Failed to delete user');
            }

            dispatch({ type: 'DELETE_USER', payload: userId });

            setAlerts({ open: true, message: 'User deleted successfully!', severity: 'success' });
            setOpenDialog(false);
        } catch (err) {
            setError(err.message);
        }
    };

    const handleSnackbarClose = () => {
        setAlerts(false);
    };

    return (
        <>
            <Snackbar open={alerts.open} autoHideDuration={2000} onClose={handleSnackbarClose}>
                <Alert
                    onClose={handleSnackbarClose}
                    severity={alerts.severity}
                    variant="filled"
                    sx={{ width: '100%' }}
                >
                    {alerts.message}
                </Alert>
            </Snackbar>

            <Dialog
                open={openDialog}
                onClose={handleDialogClose}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">{"Warning!"}</DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        Are you sure you want to delete this user?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleDialogClose}>No</Button>
                    <Button onClick={handleDeleteUser} autoFocus>
                        Yes
                    </Button>
                </DialogActions>
            </Dialog>

            <br /><br />
            <Typography variant="h5" gutterBottom>Users Table</Typography>
            <br /><br />
            <Box
                component="form"
                sx={{ '& > :not(style)': { m: 1 } }}
                noValidate
                autoComplete="off"
            >
                <Button size="small" variant="outlined" onClick={handleSubmit}>
                    {editMode ? <CheckIcon sx={{ color: green[900] }} /> : 'Add User'}
                </Button>
                <Button size="small" variant="outlined" onClick={handleCancel}>
                    <CloseIcon sx={{ color: red[900] }} />
                </Button>

                {/* Form Inputs */}
                <Input
                    placeholder="First Name"
                    name="firstName"
                    value={formValues.firstName}
                    onChange={handleInputChange}
                    required
                    error={errors.firstName}
                    sx={{ width: '100px' }}
                />
                <Input
                    placeholder="Middle Name"
                    name="middleName"
                    value={formValues.middleName}
                    onChange={handleInputChange}
                    sx={{ width: '100px' }}
                />
                <Input
                    placeholder="Last Name"
                    name="lastName"
                    value={formValues.lastName}
                    onChange={handleInputChange}
                    required
                    error={errors.lastName}
                    sx={{ width: '100px' }}
                />
                <Input
                    placeholder="Department"
                    name="department"
                    value={formValues.department}
                    onChange={handleInputChange}
                    required
                    error={errors.department}
                    sx={{ width: '100px' }}
                />
                <Input
                    placeholder="Username"
                    name="username"
                    value={formValues.username}
                    onChange={handleInputChange}
                    required
                    error={errors.username}
                    sx={{ width: '100px' }}
                />
                <Input
                    placeholder="Password"
                    name="password"
                    type="password"
                    value={formValues.password}
                    onChange={handleInputChange}
                    required={!editMode} // Password is required only in Add mode
                    error={errors.password}
                    sx={{ width: '100px' }}
                />
                <Input
                    placeholder="Email"
                    name="email"
                    type="email"
                    value={formValues.email}
                    onChange={handleInputChange}
                    required
                    error={errors.email}
                    sx={{ width: '100px' }}
                />
            </Box>
            <br /><br />

            <TableContainer component={Paper}>
                <Table sx={{ minWidth: 650 }} aria-label="caption table">
                    <caption>A basic table example with a caption</caption>
                    <TableHead>
                        <TableRow>
                            <TableCell align="left" sx={{ fontWeight: 'bold' }}>No.</TableCell>
                            <TableCell align="left" sx={{ fontWeight: 'bold' }}>First Name</TableCell>
                            <TableCell align="left" sx={{ fontWeight: 'bold' }}>Middle Name</TableCell>
                            <TableCell align="left" sx={{ fontWeight: 'bold' }}>Last Name</TableCell>
                            <TableCell align="left" sx={{ fontWeight: 'bold' }}>Username</TableCell>
                            <TableCell align="left" sx={{ fontWeight: 'bold' }}>Email</TableCell>
                            <TableCell align="left" sx={{ fontWeight: 'bold' }}>Department</TableCell>
                            <TableCell align="center" sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {users && users.length > 0 ? (
                            users.map((u, index) => (
                                <TableRow key={u._id}>
                                    <TableCell align="left">{index + 1}</TableCell>
                                    <TableCell align="left">{u.firstName}</TableCell>
                                    <TableCell align="left">{u.middleName}</TableCell>
                                    <TableCell align="left">{u.lastName}</TableCell>
                                    <TableCell align="left">{u.username}</TableCell>
                                    <TableCell align="left">{u.email}</TableCell>
                                    <TableCell align="left">{u.department}</TableCell>
                                    <TableCell align="center">
                                        <Button size="small">
                                            <EditIcon onClick={() => handleEditUser(u)} />
                                        </Button>
                                        <Button size="small" onClick={() => { setUserId(u._id); setOpenDialog(true); }}>
                                            <DeleteIcon sx={{ color: red[900] }} />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={8} align="center">
                                    No users found
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </>
    );
}

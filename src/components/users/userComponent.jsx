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

    const { user, dispatch } = useUserContext();
    const [error, setError] = useState('');
    const [userId, setUserId] = useState('');
    const [loading, setLoading] = useState(true);

    const [errors, setErrors] = useState({
        firstName: false,
        middleName: false,
        lastName: false,
        department: false,
        username: false,
        password: false,
        email: false,
    });
    const [alerts, setAlerts] = useState({ open: false, message: '', severity: 'success' });
    const [addUser, setAddUser] = useState({ open: false, message: '', severity: 'success' });
    const [openDialog, setOpenDialog] = useState(false);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await fetch('/api/user');
                if (!response.ok) {
                    throw new Error('Failed to fetch users');
                }
                const json = await response.json();
                console.log('Fetched users:', json);
                dispatch({ type: 'SET_USERS', payload: json });
            } catch (err) {
                console.error('Error fetching users:', err);
                setError(err.message);
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
            console.log('Form submitted:', formValues);
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
                    setAddUser({ open: true, message: 'User Added successfully!', severity: 'success' });
                }
            } catch (err) {
                setError('An error occurred during registration. Please try again later.');
                console.error('Error:', err);
            }
        }
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
                throw new Error('Failed to delete exam');
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

    const handleSnackbarCloseAdd = () => {
        setAddUser(false);
    };

    return (
        <>
            <Snackbar open={addUser.open} autoHideDuration={2000} onClose={handleSnackbarCloseAdd}>
                <Alert
                    onClose={handleSnackbarCloseAdd}
                    severity={addUser.severity}
                    variant="filled"
                    sx={{ width: '100%' }}
                >
                    User Added successfully!
                </Alert>
            </Snackbar>
            <Snackbar open={alerts.open} autoHideDuration={2000} onClose={handleSnackbarClose}>
                <Alert
                    onClose={handleSnackbarClose}
                    severity={alerts.severity}
                    variant="filled"
                    sx={{ width: '100%' }}
                >
                    User deleted successfully!
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
                        Are you sure you want to delete this User?
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
            <Typography variant="h4" gutterBottom>Users Table</Typography>
            <br /><br />
            <Box
                component="form"
                sx={{ '& > :not(style)': { m: 1 } }}
                noValidate
                autoComplete="off"
            >
                <Button size="small"
                    variant="outlined" onClick={handleSubmit}>
                    <CheckIcon sx={{ color: green[900] }} />
                </Button>
                <Button size="small"
                    variant="outlined" onClick={handleCancel}>
                    <CloseIcon sx={{ color: red[900] }} />
                </Button>

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
                    required
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
                            <TableCell align="center" sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                            <TableCell align="left" sx={{ fontWeight: 'bold' }}>No.</TableCell>
                            <TableCell align="left" sx={{ fontWeight: 'bold' }}>First Name</TableCell>
                            <TableCell align="left" sx={{ fontWeight: 'bold' }}>Middle Name</TableCell>
                            <TableCell align="left" sx={{ fontWeight: 'bold' }}>Last Name</TableCell>
                            <TableCell align="left" sx={{ fontWeight: 'bold' }}>Username</TableCell>
                            <TableCell align="left" sx={{ fontWeight: 'bold' }}>Email</TableCell>
                            <TableCell align="left" sx={{ fontWeight: 'bold' }}>Department</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {user && user.length > 0 ? (
                            user.map((u, index) => (
                                <TableRow key={u._id}>
                                    <TableCell align="center">
                                        <Button size="small">
                                            <EditIcon />
                                        </Button>
                                        <Button size="small" onClick={() => { setUserId(u._id); setOpenDialog(true); }}>
                                            <DeleteIcon sx={{ color: red[900] }} />
                                        </Button>
                                    </TableCell>
                                    <TableCell align="left">{index + 1}</TableCell>
                                    <TableCell align="left">{u.firstName}</TableCell>
                                    <TableCell align="left">{u.middleName}</TableCell>
                                    <TableCell align="left">{u.lastName}</TableCell>
                                    <TableCell align="left">{u.username}</TableCell>
                                    <TableCell align="left">{u.email}</TableCell>
                                    <TableCell align="left">{u.department}</TableCell>
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

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
    TextField,
    Box,
    CircularProgress,
    Alert,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Snackbar,
    TablePagination
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { red } from '@mui/material/colors';
import { useState, useEffect } from 'react';
import { useUserContext } from '../../hooks/useUserContext';
import { Grid, MenuItem, InputLabel, FormControl, Select } from '@mui/material';

export default function UserComponent() {
    const [formValues, setFormValues] = useState({
        firstName: '',
        middleName: '',
        lastName: '',
        department: '',
        username: '',
        password: '',
        email: '',
        role: '',
        course: '',
        yearLevel: ''
    });
    const { users, dispatch } = useUserContext();
    const [error, setError] = useState('');
    const [existError, setExistError] = useState('');
    const [userId, setUserId] = useState('');
    const [loading, setLoading] = useState(true);
    const [editMode, setEditMode] = useState(false);
    const [alerts, setAlerts] = useState({ open: false, message: '', severity: 'success' });
    const [openDialog, setOpenDialog] = useState(false);
    const [openAddUserModal, setOpenAddUserModal] = useState(false);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);

    const [errors, setErrors] = useState({
        firstName: false,
        lastName: false,
        department: false,
        username: false,
        password: false,
        email: false,
    });

    const [roleFilter, setRoleFilter] = useState('all');
    const [courseFilter, setCourseFilter] = useState('');
    const [yearLevelFilter, setYearLevelFilter] = useState('');

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


    const userRole = sessionStorage.getItem('userRole');

    const filteredUsers = users.filter(user => {
        return (
            (roleFilter === 'all' || user.role.toLowerCase() === roleFilter) &&
            (courseFilter === '' || user.course === courseFilter) &&
            (yearLevelFilter === '' || user.yearLevel === yearLevelFilter) &&
            (userRole === 'Teacher' ? user.role === 'Student' : true)
        );
    });

    const handleCourseChange = (event) => {
        setCourseFilter(event.target.value);
    };

    const handleYearLevelChange = (event) => {
        setYearLevelFilter(event.target.value);
    };

    const handleRoleChange = (event) => {
        const selectedRole = event.target.value;
        setRoleFilter(selectedRole);
        console.log('Selected role:', selectedRole);
    };

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
        const newErrors = {
            firstName: formValues.firstName === '',
            lastName: formValues.lastName === '',
            department: formValues.department === '',
            username: formValues.username === '',
            password: editMode ? false : formValues.password === '', // Password is required only in Add mode
            email: formValues.email === '',
            role: formValues.role === '', // Role is required
            // No validation for middleName, course, and yearLevel
        };

        // Check if the course field is required only for 'student' role
        if (formValues.role === 'Student') {
            newErrors.course = formValues.course === ''; // If role is 'student', course is required
            newErrors.yearLevel = formValues.yearLevel === ''; // If role is 'student', course is required
        }

        setErrors(newErrors);

        // Ensure that all errors are false for successful form submission
        return Object.values(newErrors).every((error) => error === false);
    };


    const handleSubmit = async () => {
        console.log('Validation:', validateForm()); // Add this line to check validation output

        if (validateForm()) {
            console.log('Form is valid');
            if (editMode) {
                console.log('Updating userASDASDASD');
                handleUpdateUser();
            } else {
                console.log('Adding user');
                handleAddUser();
            }
        } else {
            console.log('Form validation failed');
        }
    };


    const handleAddUser = async () => {
        console.log(formValues);
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
                return setExistError(json.error);
            }

            if (response.ok) {
                console.log('New user added', json);
                dispatch({ type: 'CREATE_USER', payload: json });
                setAlerts({ open: true, message: 'User Added successfully!', severity: 'success' });
                handleCancel();
                setExistError(false);
                setOpenAddUserModal(false);
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
            dispatch({ type: 'UPDATE_USER', payload: json });
            setExistError(false);
            handleCancel();
            setOpenAddUserModal(false);
            setAlerts({ open: true, message: 'User updated successfully!', severity: 'success' });
        } catch (err) {
            setError('An error occurred during updating. Please try again later.');
            console.error('Error:', err);
        }
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

    const handleEditUser = (user) => {
        console.log('Editing user:', user);
        setFormValues({
            firstName: user.firstName,
            middleName: user.middleName,
            lastName: user.lastName,
            department: user.department,
            username: user.username,
            email: user.email,
            role: user.role,
        });
        setUserId(user._id);
        setEditMode(true);
        setOpenAddUserModal(true);
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
            role: '',
            course: '',
            yearLevel: ''
        });
        setErrors({
            firstName: false,
            middleName: false,
            lastName: false,
            department: false,
            username: false,
            password: false,
            email: false,
            role: false,
            course: false,
            yearLevel: false
        });
        setEditMode(false); // Reset edit mode
    };

    if (loading) {
        return <CircularProgress />;
    }

    if (error) {
        return <Alert severity="error">{error}</Alert>;
    }

    const handleSnackbarClose = () => {
        setAlerts(false);
    };

    const handleClose = () => {
        setOpenAddUserModal(false);
        handleCancel();
        setExistError(false);
    }

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const currentRows = filteredUsers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

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

            <br /><br />
            <Typography variant="h5" gutterBottom>Users Table</Typography>
            <br /><br />
            {/* Add User Button */}
            <Button
                variant="outlined"
                size="small"
                onClick={() => setOpenAddUserModal(true)} // Open Add User modal
            >
                Add User
            </Button>

            <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
                <DialogTitle>Confirm Deletion</DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to delete this user? This action cannot be undone.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDialog(false)} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={handleDeleteUser} sx={{ color: red[900] }}>
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Modal for Add User Form */}
            <Dialog open={openAddUserModal} onClose={() => setOpenAddUserModal(false)}>
                <DialogTitle>{editMode ? 'Edit User' : 'Add User'}</DialogTitle>
                <br />
                <DialogContent>
                    <Box
                        component="form"
                        noValidate
                        autoComplete="off"
                    >
                        <Grid container spacing={2}>
                            {/* First Column */}
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    label="First Name"
                                    name="firstName"
                                    value={formValues.firstName}
                                    onChange={handleInputChange}
                                    required
                                    error={errors.firstName}
                                    fullWidth
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    label="Middle Name"
                                    name="middleName"
                                    value={formValues.middleName}
                                    onChange={handleInputChange}
                                    fullWidth
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    label="Last Name"
                                    name="lastName"
                                    value={formValues.lastName}
                                    onChange={handleInputChange}
                                    required
                                    error={errors.lastName}
                                    fullWidth
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    label="Department"
                                    name="department"
                                    value={formValues.department}
                                    onChange={handleInputChange}
                                    required
                                    error={errors.department}
                                    fullWidth
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    label="Username"
                                    name="username"
                                    value={formValues.username}
                                    onChange={handleInputChange}
                                    required
                                    error={errors.username}
                                    fullWidth
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    label="Password"
                                    name="password"
                                    type="password"
                                    value={formValues.password}
                                    onChange={handleInputChange}
                                    required={!editMode} // Password is required only in Add mode
                                    error={errors.password}
                                    fullWidth
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    label="Email"
                                    name="email"
                                    type="email"
                                    value={formValues.email}
                                    onChange={handleInputChange}
                                    required
                                    error={errors.email}
                                    fullWidth
                                />
                            </Grid>
                            {userRole === 'Teacher' && (
                                <Grid item xs={12} sm={6}>
                                    <FormControl fullWidth required error={errors.role}>
                                        <InputLabel labelId="role">Role</InputLabel>
                                        <Select
                                            label="Role"
                                            name="role"
                                            value={formValues.role = 'Student'}
                                            onChange={handleInputChange}
                                            labelId="role"
                                        >
                                            <MenuItem value="Student">Student</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>

                            )}
                            {userRole === 'admin' && (
                                <Grid item xs={12} sm={6}>
                                    <FormControl fullWidth required error={errors.role}>
                                        <InputLabel labelId="role">Role</InputLabel>
                                        <Select
                                            label="Role"
                                            name="role"
                                            value={formValues.role || ''}
                                            onChange={handleInputChange}
                                            labelId="role"
                                        >
                                            <MenuItem value="Student">Student</MenuItem>
                                            <MenuItem value="Teacher">Teacher</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>
                            )}
                            {formValues.role === 'Student' && (
                                <>
                                    <Grid item xs={12} sm={6}>
                                        <FormControl fullWidth required error={errors.course}>
                                            <InputLabel>Course</InputLabel>
                                            <Select
                                                label="Course"
                                                name="course"
                                                value={formValues.course || ''}
                                                onChange={handleInputChange}
                                            >
                                                <MenuItem value="BSIT">BSIT</MenuItem>
                                                <MenuItem value="BSCE">BSCE</MenuItem>
                                                <MenuItem value="BSEE">BSEE</MenuItem>
                                                <MenuItem value="BSME">BSME</MenuItem>
                                                <MenuItem value="BSARCH">BSARCH</MenuItem>
                                            </Select>
                                        </FormControl>
                                    </Grid>

                                    <Grid item xs={12} sm={6}>
                                        <FormControl fullWidth required error={errors.yearLevel}>
                                            <InputLabel>Year Level</InputLabel>
                                            <Select
                                                label="Year Level"
                                                name="yearLevel"
                                                value={formValues.yearLevel || ''}
                                                onChange={handleInputChange}
                                            >
                                                <MenuItem value="1st Year">1st Year</MenuItem>
                                                <MenuItem value="2nd Year">2nd Year</MenuItem>
                                                <MenuItem value="3rd Year">3rd Year</MenuItem>
                                                <MenuItem value="4th Year">4th Year</MenuItem>
                                            </Select>
                                        </FormControl>
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <Typography
                                            variant="body3"
                                            sx={{ color: red[900], fontSize: '17px' }}
                                        >
                                            {existError}
                                        </Typography>
                                    </Grid>
                                </>

                            )}
                        </Grid>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => handleClose()} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} color="primary">
                        {editMode ? 'Update User' : 'Add User'}
                    </Button>
                </DialogActions>
            </Dialog>
            <br /><br />
            <Box display="flex" alignItems="center" mb={2}>
                <FormControl style={{ width: '150px', marginRight: '10px' }}>
                    <InputLabel id="filter-course-label">Course</InputLabel>
                    <Select
                        labelId="filter-course-label"
                        value={courseFilter}
                        onChange={handleCourseChange}
                        label="Course"
                    >
                        <MenuItem value="">All</MenuItem>
                        <MenuItem value="BSIT">BSIT</MenuItem>
                        <MenuItem value="BSCE">BSCE</MenuItem>
                        <MenuItem value="BSEE">BSEE</MenuItem>
                        <MenuItem value="BSME">BSME</MenuItem>
                        <MenuItem value="BSARCH">BSARCH</MenuItem>
                    </Select>
                </FormControl>

                <FormControl style={{ width: '150px', marginRight: '10px' }}>
                    <InputLabel id="filter-yearLevel-label">Year Level</InputLabel>
                    <Select
                        labelId="filter-yearLevel-label"
                        value={yearLevelFilter}
                        onChange={handleYearLevelChange}
                        label="Year Level"
                    >
                        <MenuItem value="">All</MenuItem>
                        <MenuItem value="1st Year">1st Year</MenuItem>
                        <MenuItem value="2nd Year">2nd Year</MenuItem>
                        <MenuItem value="3rd Year">3rd Year</MenuItem>
                        <MenuItem value="4th Year">4th Year</MenuItem>
                    </Select>
                </FormControl>
            </Box>
            <TableContainer component={Paper}>
                <Table sx={{ minWidth: 650 }} aria-label="caption table">
                    <TableHead>
                        <TableRow>
                            <TableCell align="left" sx={{ fontWeight: 'bold' }}>No.</TableCell>
                            <TableCell align="left" sx={{ fontWeight: 'bold' }}>First Name</TableCell>
                            <TableCell align="left" sx={{ fontWeight: 'bold' }}>Middle Initial</TableCell>
                            <TableCell align="left" sx={{ fontWeight: 'bold' }}>Last Name</TableCell>
                            <TableCell align="left" sx={{ fontWeight: 'bold' }}>Username</TableCell>
                            <TableCell align="left" sx={{ fontWeight: 'bold' }}>Email</TableCell>
                            <TableCell align="left" sx={{ fontWeight: 'bold' }}>Department</TableCell>
                            <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                                <FormControl variant="standard" fullWidth>
                                    <InputLabel>Role</InputLabel>
                                    <Select
                                        value={roleFilter}
                                        onChange={handleRoleChange}
                                        label="Role"
                                        disabled={userRole === 'Teacher'}
                                    >
                                        <MenuItem value="all">All</MenuItem>
                                        <MenuItem value="teacher">Teacher</MenuItem>
                                        <MenuItem value="student">Student</MenuItem>
                                    </Select>
                                </FormControl>
                            </TableCell>
                            <TableCell align="center" sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {currentRows.length > 0 ? (
                            currentRows.map((u, index) => (
                                <TableRow key={u._id}>
                                    <TableCell align="left">{index + 1 + page * rowsPerPage}</TableCell>
                                    <TableCell align="left">{u.firstName}</TableCell>
                                    <TableCell align="center">{u.middleName}</TableCell>
                                    <TableCell align="left">{u.lastName}</TableCell>
                                    <TableCell align="left">{u.username}</TableCell>
                                    <TableCell align="left">{u.email}</TableCell>
                                    {u.role === 'Teacher' && (
                                        <TableCell align="left">{u.department}</TableCell>
                                    )}
                                    {u.role === 'Student' && (
                                        <TableCell align="left">
                                            {u.course}
                                            {u.yearLevel === '1st Year' && (" 1")}
                                            {u.yearLevel === '2nd Year' && (" 2")}
                                            {u.yearLevel === '3rd Year' && (" 3")}
                                            {u.yearLevel === '4th Year' && (" 4")}
                                        </TableCell>
                                    )}
                                    <TableCell align="center">{u.role}</TableCell>
                                    <TableCell align="center">
                                        <Button size="small" onClick={() => handleEditUser(u)}>
                                            <EditIcon />
                                        </Button>
                                        <Button size="small" onClick={() => { setUserId(u._id); setOpenDialog(true); }}>
                                            <DeleteIcon sx={{ color: red[900] }} />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={9} align="center">
                                    No users found
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
                <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
                    component="div"
                    count={filteredUsers.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                />
            </TableContainer>
        </>
    );
}

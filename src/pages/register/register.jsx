import React, { useState } from 'react';
import loginImage from '../../assets/registerlogo.png';
import { Link } from 'react-router-dom';
import { useUserContext } from '../../hooks/useUserContext';
import { useNavigate } from 'react-router-dom';
// import bcrypt from 'bcryptjs';


function Register() {
  const navigate = useNavigate();
  const { dispatch } = useUserContext();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [lastName, setLastName] = useState('');
  const [error, setError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordMatchError, setPasswordMatchError] = useState('');

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPassword(value);

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    if (!passwordRegex.test(value)) {
      setPasswordError('Password must be at least 8 characters long, with at least one uppercase letter, one lowercase letter, one number, and one special character.');
    } else {
      setPasswordError('');
    }

    // Check if passwords match in real-time
    if (value !== confirmPassword) {
      setPasswordMatchError('Passwords do not match.');
    } else {
      setPasswordMatchError('');
    }
  };

  const handleConfirmPasswordChange = (e) => {
    const value = e.target.value;
    setConfirmPassword(value);

    // Check if passwords match in real-time
    if (password !== value) {
      setPasswordMatchError('Passwords do not match.');
    } else {
      setPasswordMatchError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (passwordError || passwordMatchError) {
      return;
    }

    const user = { username, password, firstName, middleName, lastName };

    try {
      const response = await fetch('/api/user/register', {
        method: 'POST',
        body: JSON.stringify(user),
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

        // Show confirmation popup
        if (window.confirm('Registration successful! Do you want to log in now?')) {
          navigate('/login');
        }
      }
    } catch (err) {
      setError('An error occurred during registration. Please try again later.');
      console.error('Error:', err);
    }
  };

  const styles = {
    container: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      height: '100vh',
    },
    formContainer: {
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      padding: '20px',
      borderRight: '1px solid #ccc',
    },
    formGroup: {
      marginBottom: '15px',
      width: '80%',
    },
    label: {
      display: 'block',
      marginBottom: '5px',
      color: 'grey',
    },
    input: {
      width: '100%',
      padding: '8px',
      background: 'transparent',
      border: '1px solid black',
      borderTop: 'none',
      borderRight: 'none',
      borderLeft: 'none',
      outline: 'none',
    },
    button: {
      width: '85%',
      padding: '10px',
      color: 'white',
      border: 'none',
      borderRadius: '5px',
      cursor: 'pointer',
      marginTop: '10px',
      backgroundColor: '#e05707',
    },
    buttonHover: {
      backgroundColor: '#e057076e',
    },
    error: {
      color: 'red',
      marginTop: '10px',
    },
    imageContainer: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f0f0f0',
      borderRight: '1px solid #cdcdcd',
    },
    image: {
      maxWidth: '100%',
      maxHeight: '100%',
    },
    insideContainer: {
      width: '80%',
      margin: '0 auto',
    },
    header: {
      color: '#e05707',
    },
    create: {
      display: 'block',
      marginBottom: '5px',
      color: 'grey',
      fontSize: 'small',
      cursor: 'pointer',
    },
    createHover: {
      color: 'black',
      cursor: 'pointer',
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.imageContainer}>
        <img src={loginImage} alt="LOGO" style={styles.image} />
      </div>
      <div style={styles.formContainer}>
        <div style={styles.insideContainer}>
          <h2 style={styles.header}>Sign Up Here!</h2>
          <br />
          <br />
          <form onSubmit={handleSubmit}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                style={styles.input}
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Password</label>
              <input
                type="password"
                value={password}
                onChange={handlePasswordChange}
                required
                style={styles.input}
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={handleConfirmPasswordChange}
                required
                style={styles.input}
              />
            </div>
            {passwordError && <p style={styles.error}>{passwordError}</p>}
            {passwordMatchError && <p style={styles.error}>{passwordMatchError}</p>}
            <div style={styles.formGroup}>
              <label style={styles.label}>First Name</label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                style={styles.input}
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Middle Name (optional)</label>
              <input
                type="text"
                value={middleName}
                onChange={(e) => setMiddleName(e.target.value)}
                style={styles.input}
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Last Name</label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
                style={styles.input}
              />
            </div>
            {error && <p style={styles.error}>{error}</p>}
            <button
              type="submit"
              style={styles.button}
              onMouseOver={(e) => (e.target.style.backgroundColor = styles.buttonHover.backgroundColor)}
              onMouseOut={(e) => (e.target.style.backgroundColor = styles.button.backgroundColor)}
            >
              Sign Up
            </button>
            <p
              style={styles.create}
              onMouseOver={(e) => (e.target.style.color = styles.createHover.color)}
              onMouseOut={(e) => (e.target.style.color = styles.create.color)}
            >
              <Link to='/login' style={{ color: 'inherit', textDecoration: 'none' }}>ALREADY A MEMBER</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Register;

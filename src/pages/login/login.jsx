import React, { useState } from 'react';
import loginImage from '../../assets/loginlogo.png'
import { useNavigate } from 'react-router-dom';

function Login({ onLogin }) {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('/api/user/login', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const json = await response.json();

      if (!response.ok) {
        console.log(json);
        setError("Username or Password is Incorrect");
      } else {
        const { token, role, userData } = json; 
  
        localStorage.setItem('authToken', token);
        sessionStorage.setItem('userRole', role);
        sessionStorage.setItem('firstName', userData.firstName);
        sessionStorage.setItem('middleName', userData.middleName);
        sessionStorage.setItem('lastName', userData.lastName);
        sessionStorage.setItem('email', userData.email);

        onLogin(token);

        navigate('/');
      }
    } catch (err) {
      setError('An error occurred during login. Please try again.');
    }
  };

  const styles = {
    container: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr', // Two equal-width columns
      height: '100vh', // Full viewport height
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
      width: '80%'
    },
    label: {
      display: 'block',
      marginBottom: '5px',
      color: 'grey'
    },
    input: {
      outline: "none",
      width: '100%',
      padding: '8px',
      background: "transparent",
      border: "1px solid black",
      borderTop: "none",
      borderRight: "none",
      borderLeft: "none"
    },
    button: {
      width: '84%',
      padding: '10px',
      color: 'white',
      border: 'none',
      borderRadius: '5px',
      cursor: 'pointer',
      marginTop: '10px',
      backgroundColor: '#e05707'
    },
    buttonHover: {
      backgroundColor: '#e057076e'
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
      borderRight: '1px solid #cdcdcd'
    },
    image: {
      maxWidth: '100%',
      maxHeight: '100%',
    },
    insideContrainer: {
      width: '80%',
      margin: '0 auto'
    },
    header: {
      color: '#e05707'
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
      cursor: 'pointer'
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.imageContainer}>
        <img
          src={loginImage}
          alt="LOGO"
          style={styles.image}
        />
      </div>
      <div style={styles.formContainer}>
        <div style={styles.insideContrainer}>
          <h1 style={styles.header}>SECSA Quiz Maker</h1><br /><br />
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
                onChange={(e) => setPassword(e.target.value)}
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
              Sign In
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;

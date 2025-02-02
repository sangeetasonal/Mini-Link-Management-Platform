import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import './LoginPage.css';
import logo from "../assets/logo.png";
import background from "../assets/background.png";
import { Link, useNavigate } from 'react-router-dom';  // Import useNavigate

const LoginPage = () => {
  const navigate = useNavigate(); // Initialize the useNavigate hook
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');

  // Handle form input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value
    }));
  };

  // Handle form submission
  const handleLogin = async (e) => {
    e.preventDefault();

    // Prepare data to send to backend
    const loginData = {
      email: formData.email,
      password: formData.password
    };

    try {
      const response = await fetch('https://mini-link-management-platform-lwxs.onrender.com/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(loginData)
      });

      const data = await response.json();
      
      if (response.ok) {
        // On success, store the JWT token in local storage (or other secure storage)
        localStorage.setItem('token', data.token);
        localStorage.setItem('username', data.name);
        // Redirect to the dashboard page
        navigate('/dashboard'); // Redirect to the dashboard page
      } else {
        // Handle errors
        setError(data.message || 'Something went wrong. Please try again!');
      }
    } catch (err) {
      setError('Error logging in. Please try again later.');
      console.error(err);
    }
  };

  return (

    <div className="login-page">
       <Helmet>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
                <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@200..800&display=swap" rel="stylesheet" />
            </Helmet>
      <div className="header">
        <Link to="/signup">
          <button className="signup-btn">SignUp</button>
        </Link>
        <Link to="/login">
          <button className="login-btn">Login</button>
        </Link>
      </div>
      <div className="left-image">
        <div className="logo">
          <img src={logo} alt="Logo" />
        </div>
        <img className="background-img" src={background} alt="Background" />
      </div>
      <div className="right-form">
        <div className="form-container1">
          <h2>Login</h2>
          <form onSubmit={handleLogin}>
            <input
              type="email"
              name="email"
              placeholder="Email id"
              value={formData.email}
              onChange={handleChange}
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
            />
            <button type="submit">Login</button>
          </form>
          {error && <p className="error">{error}</p>}
          <p>
            Don't have an account? <a href="/signup">SignUp</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

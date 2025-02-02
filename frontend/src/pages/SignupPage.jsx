import React, { useState } from 'react';
import './SignupPage.css';
import logo from "../assets/logo.png";
import { Helmet } from 'react-helmet';
import background from "../assets/background.png"; 
import { Link, useNavigate } from 'react-router-dom';  // Import useNavigate

const SignupPage = () => {
  const navigate = useNavigate(); // Initialize the useNavigate hook
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    password: '',
    confirmPassword: ''
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
  const handleSignup = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match!');
      return;
    }

    // Clear error if passwords match
    setError('');

    // Prepare data to send to backend
    const userData = {
      name: formData.name,
      email: formData.email,
      mobile: formData.mobile,
      password: formData.password
    };

    try {
      const response = await fetch('https://mini-link-management-platform-lwxs.onrender.com/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      });

      const data = await response.json();
      
      if (response.ok) {
        // On success, redirect to login page
        navigate('/login'); // Redirect to login page
      } else {
        // Handle errors
        setError(data.message || 'Something went wrong. Please try again!');
      }
    } catch (err) {
      setError('Error during signup. Please try again later.');
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
        <div className="form-container">
          <h2>Join us Today!</h2>
          <form onSubmit={handleSignup}>
            <input
              type="text"
              name="name"
              placeholder="Name"
              value={formData.name}
              onChange={handleChange}
            />
            <input
              type="email"
              name="email"
              placeholder="Email id"
              value={formData.email}
              onChange={handleChange}
            />
            <input
              type="tel"
              name="mobile"
              placeholder="Mobile no."
              value={formData.mobile}
              onChange={handleChange}
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
            />
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleChange}
            />
            <button type="submit">Register</button>
          </form>
          {error && <p className="error">{error}</p>}
          <p>
            Already have an account? <a href="/login">Login</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;

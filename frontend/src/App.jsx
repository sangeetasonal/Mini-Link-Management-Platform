import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; // Import the CSS for toast notifications
import './ToastStyles.css'; // Adjust the path if needed
import LoginPage from './pages/LoginPage'; // Adjust the path if needed
import SignupPage from './pages/SignupPage';
import DashboardPage from './components/DashboardPage';

function App() {
  return (
    <Router>
      <ToastContainer
        position="bottom-left" // Position the toast at the bottom left
        autoClose={5000} // Auto close after 5 seconds
        hideProgressBar={false} // Show progress bar
        newestOnTop={false} // Show newest toast on top
        closeOnClick // Close on click
        rtl={false} // Right to left
        pauseOnFocusLoss // Pause on focus loss
        draggable // Allow dragging
        pauseOnHover // Pause on hover
        className="Toastify__toast-container--bottom-left" // Custom class for additional styling
      />
      <Routes>
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />

        {/* Default Route: Redirect to Signup */}
        <Route path="/" element={<SignupPage />} />
      </Routes>
    </Router>
  );
}

export default App;
import React from 'react';
import LoginPage from './pages/LoginPage'; // Adjust the path if needed
import SignupPage from './pages/SignupPage';
import DashboardPage from './components/DashboardPage';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

function App() {
  return (
    <Router>
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

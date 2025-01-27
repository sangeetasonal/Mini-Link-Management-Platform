import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './DashboardPage.css';
import dash from "../assets/doc.png";
import dashBlue from "../assets/doc-blue.png";
import linkBlue from "../assets/link-blue.png";
import link from "../assets/link.png";
import analytic from "../assets/analytic.png";
import analyticBlue from "../assets/analytic-blue.png"; // Blue Analytics Icon
import settingBlue from "../assets/setting-blue.png"; // Blue Settings Icon
import setting from "../assets/setting.png";
import sun from "../assets/sun.png";
import searchIcon from "../assets/search.png";
import { Helmet } from 'react-helmet';
import logo from "../assets/logo.png";
import close from "../assets/close.png";
import windowClose from "../assets/window-close.png";
import dlt from "../assets/delete.png";
import edit from "../assets/edit.png";
import copy from "../assets/copy.png";
import axios from "axios"; 

const DashboardPage = () => {
  const [userName, setUserName] = useState("");
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState("");
  const [activeMenu, setActiveMenu] = useState("dashboard"); // Default active menu
  const [popupVisible, setPopupVisible] = useState(false);
  const [expirationDate, setExpirationDate] = useState(""); // State to store expiration date
  const [displayDate, setDisplayDate] = useState(""); // State to store formatted date-time
  const [userMobile, setUserMobile] = useState(""); // Define state for user mobile
  const [userEmail, setUserEmail] = useState(""); // Define state for user email
  const [error, setError] = useState(""); // To handle errors
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showDeletePopup, setShowDeletePopup] = useState(false);

  useEffect(() => {
    // Fetch the username from localStorage
    const savedName = localStorage.getItem('username');
    if (savedName) {
      setUserName(savedName);
    } else {
      // Redirect to login if username is not found
      navigate('/login'); // Use React Router for redirection
      return;
    }

    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          console.log("No token found in localStorage");
          return;
        }
  
        console.log("Fetching user details with token:", token);
  
        const response = await axios.get('http://localhost:5000/api/auth/details', {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log("Response data:", response.data); // Log the response data
        
        if (response.status === 200) {
          setUserName(response.data.user.name); // Assuming the API returns `user.name`
          setUserMobile(response.data.user.mobile); // Assuming the API returns `user.mobile`
          setUserEmail(response.data.user.email); // Assuming the API returns `user.email`
        }
      } catch (error) {
        console.error('Error fetching user details:', error);
        navigate('/login'); // Redirect to login on error
      }
    };
  
    fetchUserData();
    const date = new Date();
    const formattedDate = date.toLocaleDateString('en-US', {
      weekday: 'short', // Abbreviated day
      month: 'short', // Abbreviated month
      day: 'numeric' // Numeric day
    });
    setCurrentDate(formattedDate); 
  }, [navigate]);

   

  const handleSaveChanges = async (e) => {
    e.preventDefault();
  
    // Simple validation to ensure fields are not empty
    if (!userName || !userEmail || !userMobile) {
      alert("Please fill in all fields before saving.");
      return;
    }
  
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        'http://localhost:5000/api/auth/update', // Your backend update endpoint
        {
          name: userName.trim() || 'defaultName', // Use default value if empty
          email: userEmail.trim() || 'default@example.com', // Use default value if empty
          mobile: userMobile.trim() || '0000000000', // Use default value if empty
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
  
      if (response.status === 200) {
        console.log('User details updated:', response.data);
        alert('Details updated successfully');
      }
    } catch (error) {
      console.error('Error updating user details:', error);
      alert('Error updating details');
    }
  };
  const getInitials = (name) => {
    if (!name) return ""; // Ensure name exists
    const nameParts = name.split(" ");
    return nameParts.length > 1
      ? nameParts[0][0] + nameParts[1][0]
      : nameParts[0][0];
  };


  const togglePopup = () => {
    setPopupVisible(!popupVisible);
  };


  const handleClear = () => {
    setExpirationDate('');
    setDestinationUrl('');
    setRemarks('');
  };

  
// Function to format date and time
const formatDateTime = (isoDateTime) => {
  const date = new Date(isoDateTime);
  const options = {
    day: "2-digit",
    month: "short",
    year: "numeric",
  };
  const timeOptions = {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  };

  const formattedDate = date.toLocaleDateString("en-US", options);
  const formattedTime = date.toLocaleTimeString("en-US", timeOptions);

  return `${formattedDate}, ${formattedTime}`;
};

// Handle changes in the expiration date
const handleExpirationChange = (e) => {
  const selectedDateTime = e.target.value;
  setExpirationDate(selectedDateTime);
  if (selectedDateTime) {
    setDisplayDate(formatDateTime(selectedDateTime)); // Update with formatted value
  } else {
    setDisplayDate(""); // Reset display value if input is cleared
  }
};

 // Handle Delete Account
 const handleDeleteAccount = async () => {
  const token = localStorage.getItem('token');
  try {
    const response = await axios.delete('http://localhost:5000/api/auth/delete', {
      headers: { Authorization: `Bearer ${token}` },
    });
    alert(response.data.message); // Show success message
    navigate('/login'); // Redirect to login page after deletion
  } catch (error) {
    console.error('Error deleting account:', error.response.data.message);
    alert('Error deleting account. Please try again.');
  }
  setShowDeletePopup(false); // Close the popup after action
};

// Toggle Delete Account Popup
const handleDeletePopupToggle = () => {
  setShowDeletePopup(!showDeletePopup);
};
  return (
    <div className="dashboard-page">
      <Helmet>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
        <link
          href="https://fonts.googleapis.com/css2?family=Manrope:wght@200..800&display=swap"
          rel="stylesheet"
        />
      </Helmet>
      {/* Sidebar */}
      <div className="sidebar">
        <div className="logo">
          <img src={logo} alt="Logo" />
        </div>
        <nav>
        <ul className='side'>
            <li
              className={activeMenu === "dashboard" ? "active" : ""}
              onClick={() => setActiveMenu("dashboard")}
            >
              <img src={activeMenu === "dashboard" ? dashBlue : dash} alt="Dashboard Icon" />
              Dashboard
            </li>
            <li
              className={activeMenu === "links" ? "active" : ""}
              onClick={() => setActiveMenu("links")}
            >
              <img src={activeMenu === "links" ? linkBlue : link} alt="Links Icon" />
              Links
            </li>
            <li
              className={activeMenu === "analytics" ? "active" : ""}
              onClick={() => setActiveMenu("analytics")}
            >
              <img src={activeMenu === "analytics" ? analyticBlue : analytic} alt="Analytics Icon" />
              Analytics
            </li>
           <li
  className={`settings ${activeMenu === "settings" ? "active" : ""}`}
  onClick={() => setActiveMenu("settings")}
>
  <img src={activeMenu === "settings" ? settingBlue : setting} alt="Settings Icon" />
  Settings
</li>
          </ul>
        </nav>
      </div>

      {/* Main Content */}
      <div className="main-content">
        <div className="headers">
          <div className="greeting">
            <p>
              <span role="img" aria-label="sun">
                <img src={sun} alt="Sun Icon" />
              </span>{' '}
              Good morning, {userName}
            </p>
            <p className="date">{currentDate}</p>
          </div>
          <div className="actions">
            <button className="create-btn"  onClick={togglePopup}>
              + Create new</button>
            <div className="search-container">
              <img src={searchIcon} alt="Search" className="search-icon" />
              <input type="text" placeholder="Search by remarks" />
            </div>
            <div className="profile">{getInitials(userName).toUpperCase()}</div>
          </div>
        </div>

        {popupVisible && (

          <div className="popup-overlay">

          <div className="popup">
            <div className="popup-content">
              <div className="upper">
              <h2>New Link</h2>
              <img
                  src={close}
                  alt="Close"
                  className="close-icon"
                  onClick={togglePopup}
                />
              </div>
              <form>
              <label>
                  Destination Url<span className="required">*</span>
                  <input type="text" placeholder="url" required />
                </label>
                <label className='req'>
                  Remarks<span className="required">*</span>
                  <textarea placeholder="Add remarks" required />
                </label>

                <label className="link-expiration-container">
  <div className="toggle-and-label">
  <span>Link Expiration</span>
    {/* Toggle Switch */}
    <label className="toggle-switch">
      <input type="checkbox" />
      <span className="slider"></span>
    </label>
   
  </div>
  {/* Expiration Input */}
  <input
        type="datetime-local"
        value={expirationDate}
        onChange={handleExpirationChange}
        placeholder="dd/mm/yyyy, hh:mm AM/PM"
        
      />
</label>
             
              
                <div className="popup-actions">
                <button
                  type="button"
                  className="clear-button"
                  onClick={handleClear}
                >
                  Clear
                </button>
                <button type="submit" className="create-button">
                  Create New
                </button>
                 
                </div>
              </form>
            </div>
          </div>
          </div>
        )}

        
            {/* Dynamic Content */}
            {activeMenu === "dashboard" && (
          <div className="dashboard-content">
            
          <h2>Total Clicks</h2>
          <div className="stats">
            {/* Date-wise Clicks */}
            <div className="card">
              <h3>Date-wise Clicks</h3>
              <ul className="click-stats">
                <li>
                  <span>21-01-25</span>
                  <div className="bar">
                    <div className="fill" style={{ width: '90%' }}></div>
                  </div>
                  <span className="blue-text">1234</span>
                </li>
                <li>
                  <span>20-01-25</span>
                  <div className="bar">
                    <div className="fill" style={{ width: '85%' }}></div>
                  </div>
                  <span className="blue-text">1140</span>
                </li>
                <li>
                  <span>19-01-25</span>
                  <div className="bar">
                    <div className="fill" style={{ width: '30%' }}></div>
                  </div>
                  <span className="blue-text">134</span>
                </li>
                <li>
                  <span>18-01-25</span>
                  <div className="bar">
                    <div className="fill" style={{ width: '10%' }}></div>
                  </div>
                  <span className="blue-text">34</span>
                </li>
              </ul>
            </div>

            {/* Click Devices */}
            <div className="card">
              <h3>Click Devices</h3>
              <ul className="click-stats">
                <li>
                  <span>Mobile</span>
                  <div className="bar1">
                    <div className="fill" style={{ width: '80%' }}></div>
                  </div>
                  <span className="blue-text">134</span>
                </li>
                <li>
                  <span>Desktop</span>
                  <div className="bar">
                    <div className="fill" style={{ width: '40%' }}></div>
                  </div>
                  <span className="blue-text">40</span>
                </li>
                <li>
                  <span>Tablet</span>
                  <div className="bar2">
                    <div className="fill" style={{ width: '10%' }}></div>
                  </div>
                  <span className="blue-text">3</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
        )}
        {activeMenu === "links" && (
          <div className="links-content">
         
          <table className="links-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Original Link</th>
                <th>Short Link</th>
                <th>Remarks</th>
                <th>Clicks</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Jan 14, 2025 16:30</td>
                <td>https://www.trav...</td>
                <td  className="short-link-cell">
                  https://c.uv
                  <button className="copy-btn">
                    <img src={copy} alt="" />
                  </button>
                </td>
                <td>campaign1</td>
                <td>5</td>
                <td className="status-active">Active</td>
                <td>
                  <button className="edit-btn">
                    <img src={edit} alt="" />
                  </button>
                  <button className="delete-btn">
                    <img src={dlt} alt="" />
                  </button>
                </td>
              </tr>
              <tr>
                <td>Jan 14, 2025 05:45</td>
                <td>https://www.trav...</td>
                <td className="short-link-cell">
                  https://c.uv
                  <button className="copy-btn">
                    <img src={copy} alt="" />
                  </button>
                    </td>
                <td>campaign2</td>
                <td>5</td>
                <td className="status-inactive">Inactive</td>
                <td>
                <button className="edit-btn">
                    <img src={edit} alt="" />
                  </button>
                  <button className="delete-btn">
                    <img src={dlt} alt="" />
                  </button>
                </td>
              </tr>
              <tr>
                <td>Jan 14, 2025 07:43</td>
                <td>https://www.trav...</td>
                <td className="short-link-cell">
                  https://c.uv
                  <button className="copy-btn">
                    <img src={copy} alt="" />
                  </button>
                </td>
                <td>campaign3</td>
                <td>5</td>
                <td className="status-inactive">Inactive</td>
                <td className='action-btn'>
                <button className="edit-btn">
                    <img src={edit} alt="" />
                  </button>
                  <button className="delete-btn">
                    <img src={dlt} alt="" />
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        )}
        {activeMenu === "analytics" && (
          <div className="analytics-content">
            <h2>Analytics</h2>
            <p>View your analytics data and trends.</p>
          </div>
        )}
        {activeMenu === "settings" && (
          <div className="sett">
           <div className="settings-content">
      <form className="form-container2"  onSubmit={handleSaveChanges}>
        <div className="form-group">
          <label htmlFor="name">Name</label>
          <input
            type="text"
            id="name"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label htmlFor="email">Email id</label>
          <input
            type="email"
            id="email"
            value={userEmail}
            onChange={(e) => setUserEmail(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label htmlFor="mobile">Mobile no.</label>
          <input
            type="text"
            id="mobile"
            value={userMobile}
            onChange={(e) => setUserMobile(e.target.value)}
          />
        </div>
        <div className="button-group">
          
          <button type="submit"  className="save-btn" onSubmit={handleSaveChanges} >Save Changes</button>
          <button type="button" className="delete-btns"  onClick={handleDeletePopupToggle}>Delete Account</button>
        </div>
      </form>
      {showDeletePopup && (
        <div className="delete-popup">
          <div className="popup-contents">
          <button className="close-popup-btn" onClick={handleDeletePopupToggle}>
            <img src={windowClose} alt="" />
      </button>
            <h3>Are you sure you want to delete your account?</h3>
            <div className="button-groups">
              <button className='no' onClick={handleDeletePopupToggle}>NO</button>
              <button className='yes' onClick={handleDeleteAccount}>YES</button>
            </div>
          </div>
        </div>
      )}

    </div>
          </div>
        )}
        
      </div>
    </div>
  );
};

export default DashboardPage;

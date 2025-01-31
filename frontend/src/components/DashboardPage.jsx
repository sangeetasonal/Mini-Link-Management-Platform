import React, { useState, useEffect, useRef } from 'react';
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
import blueCopy from "../assets/bluecopy.png";
import blueEdit from "../assets/blue-edit.png";
import redDlt from "../assets/red-dlt.png";
import leftArrow from "../assets/left.png";
import rightArrow from "../assets/right.png";
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
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [destinationUrl, setDestinationUrl] = useState(null);
  const [longUrl, setLongUrl] = useState("");
  const [remarks, setRemarks] = useState("");
  const [shortUrl, setShortUrl] = useState(null);
  const [error, setError] = useState(null);
  const [isExpirationEnabled, setIsExpirationEnabled] = useState(false);
  const [shortenedUrl, setShortenedUrl] = useState("");
  const [message, setMessage] = useState("");
  const [links, setLinks] = useState([]); // State to store links data
  const [imgSrc, setImgSrc] = useState(copy);
  const [editImg, setEditImg] = useState(edit);
  const [deleteImg, setDeleteImg] = useState(dlt);
  const [deleteLink, setDeleteLink] = useState(null); // Store link to delete
  const [linkToDelete, setLinkToDelete] = useState(null); // Store the link to delete
  const [isLoggedIn, setIsLoggedIn] = useState(true); // Assume user is logged in
  const [isProfileSelected, setIsProfileSelected] = useState(false);
  const profileRef = useRef(null); // Reference to the profile container
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [clicks, setClicks] = useState([]); // State to store clicks data
  const [filteredLinks, setFilteredLinks] = useState([]); // Links after filtering
  const [searchQuery, setSearchQuery] = useState(""); // Search input
  const [totalClicks, setTotalClicks] = useState(0);
  const [urls, setUrls] = useState([]); // State to store URLs
const [clicksByDate, setClicksByDate] = useState({});
const [clicksByDevice, setClicksByDevice] = useState({
  mobile: 0,
  desktop: 0,
  tablet: 0,
});
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
    if (!popupVisible) {
      // Reset fields when closing the popup
      setLongUrl("");
      setRemarks("");
      setExpirationDate("");
      setShortUrl(null);
      setError(null);
    }
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


 
// Fetch links when the component mounts or when the active menu changes
// useEffect(() => {
//   const fetchLinks = async () => {
//     try {
//       const token = localStorage.getItem('token');
//       if (!token) {
//         console.log("No token found in localStorage");
//         return;
//       }

//       const response = await axios.get('http://localhost:5000/api/auth/all', {
//         headers: { Authorization: `Bearer ${token}` },
//       });

//       if (response.status === 200) {
//         setLinks(response.data.urls); // Assuming the API returns an array of URLs in `urls`
//       }
//     } catch (error) {
//       console.error('Error fetching user URLs:', error);
//       alert('Error fetching URLs. Please try again.');
//     }
//   };

//   if (activeMenu === "links") {
//     fetchLinks(); // Fetch links when the "links" menu is active
//   }
// }, [activeMenu]);

// Fetch links when the component mounts or when the active menu changes
useEffect(() => {
  const fetchLinks = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.log("No token found in localStorage");
        return;
      }

      const response = await axios.get(`http://localhost:5000/api/auth/all?page=${currentPage}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 200) {
        setLinks(response.data.urls); // Assuming the API returns an array of URLs in `urls`
        setTotalPages(response.data.totalPages); // Assuming the API returns total pages
      }
    } catch (error) {
      console.error('Error fetching user URLs:', error);
      alert('Error fetching URLs. Please try again.');
    }
  };

  if (activeMenu === "links") {
    fetchLinks(); // Fetch links when the "links" menu is active
  }
}, [activeMenu, currentPage]); // Add currentPage to the dependency array


// Fetch clicks for analytics when the component mounts or when the active menu changes


 // Fetch clicks for analytics when the component mounts or when the active menu changes
 useEffect(() => {
  const fetchClickData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.log("No token found in localStorage");
        return;
      }

      const response = await axios.get(`http://localhost:5000/api/auth/clicks?page=${currentPage}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 200) {
        setClicks(response.data.urls); // Assuming the API returns an array of URLs with click data
        setTotalPages(response.data.totalPages); // Set total pages from the response
      }
    } catch (error) {
      console.error('Error fetching click data:', error);
    }
  };

  if (activeMenu === "analytics") {
    fetchClickData(); // Fetch click data when the "analytics" menu is active
  }
}, [activeMenu, currentPage]); // Dependencies: activeMenu and currentPage



const handleProfileSelect = () => {
  setIsProfileSelected(prevState => !prevState); // Toggle profile selection
};

const handleLogout = () => {
  localStorage.removeItem('token'); // Clear token
  setIsProfileSelected(false); // Reset profile selection
  navigate('/login'); // Redirect to login
};

// Hide logout button when clicking outside
const handleClickOutside = (event) => {
  if (profileRef.current && !profileRef.current.contains(event.target)) {
    setIsProfileSelected(false); // Hide logout button
  }
};

useEffect(() => {
  // Add event listener for clicks outside the profile
  document.addEventListener('mousedown', handleClickOutside);
  
  // Cleanup the event listener on component unmount
  return () => {
    document.removeEventListener('mousedown', handleClickOutside);
  };
}, []);

const handleFormSubmit = async (e) => {
  e.preventDefault();

  console.log("Destination URL:", destinationUrl);
  console.log("Remarks:", remarks);

  // Validate required fields
  if (!destinationUrl || !remarks) {
    alert("Please fill out all required fields.");
    return;
  }

  const payload = {
    longUrl: destinationUrl,
    remarks,
    expirationDate: isExpirationEnabled ? expirationDate : null,
  };

  try {
    const token = localStorage.getItem('token'); // Get the token from local storage
    const response = await fetch("http://localhost:5000/api/auth/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`, // Include the token in the Authorization header
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to shorten the URL");
    }

    // Add the newly created link to the links state
    setLinks((prevLinks) => [
      ...prevLinks,
      {
        createdAt: data.createdAt,
        longUrl: data.longUrl,
        shortUrl: data.shortUrl,
        remarks: data.remarks,
        status: data.status,
      },
    ]);

    console.log("Short URL Created:", {
      ShortUrl: data.shortUrl,
      LongUrl: data.longUrl,
      Remarks: data.remarks,
      ExpiryDate: data.expirationDate || "No Expiry",
      CreatedAt: new Date().toISOString(), // Log the creation date
      Status: data.status,
    });

    // Show success alert message
    alert("Short URL created successfully!");

    // Close the popup
    togglePopup();

    // Clear the form fields
    handleClear();

    // Redirect to the "links" menu
    setActiveMenu("links"); // Set the active menu to "links"
    
  } catch (error) {
    console.error("Error creating short URL:", error.message);
    setMessage(error.message || "Error creating short URL.");
  }
};
const handleClear = () => {
  setDestinationUrl("");
  setRemarks("");
  setIsExpirationEnabled(false);
  setExpirationDate("");
  setMessage("");
};



const initialLinks = [
  {
    _id: '1',
    createdAt: new Date(),
    longUrl: 'https://example.com',
    shortUrl: 'https://short.ly/abc123',
    remarks: 'Example link',
    clicks: 0,
    status: 'Active',
    isCopyHovered: false,
    isEditHovered: false,
    isDeleteHovered: false,
  },
]


const handleDelete = async () => {
  const token = localStorage.getItem('token');
  try {
    await axios.delete(`http://localhost:5000/api/auth/url/${linkToDelete._id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setLinks(links.filter(link => link._id !== linkToDelete._id)); // Remove the deleted link from the state
    alert("Link deleted successfully!");
  } catch (error) {
    console.error('Error deleting link:', error);
    alert('Error deleting link. Please try again.');
  }
  setShowDeletePopup(false); // Close the delete confirmation popup
};

const handleDeletePopupToggle = () => {
  setShowDeletePopup(!showDeletePopup); // Toggle the visibility of the delete popup
};

const confirmDelete = (link) => {
  setLinkToDelete(link); // Set the link to delete
  setShowDeletePopup(true); // Show the delete confirmation popup
};

const toggleDeletePopup = () => {
  setShowDeletePopup(!showDeletePopup); // Toggle the visibility of the delete popup
};



const handleSearch = (e) => {
  const query = e.target.value.toLowerCase();
  setSearchQuery(query);

  if (query) {
    const results = links.filter(link => 
      link.remarks.toLowerCase().includes(query)
    );

    setFilteredLinks(results);

    if (results.length === 0) {
      alert("No remarks found");
    }
  } else {
    setFilteredLinks(links); // Reset to original links if search is cleared
  }
};


// Fetch URLs when the component mounts or when the active menu changes
useEffect(() => {
  const fetchUrls = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.log("No token found in localStorage");
        return;
      }

      const response = await axios.get(`http://localhost:5000/api/auth/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 200) {
        setUrls(response.data.urls); // Assuming the API returns an array of URLs
        
        // Calculate total clicks
        const total = response.data.urls.reduce((sum, url) => sum + url.clicks, 0);
        setTotalClicks(total); // Set total clicks
      }
    } catch (error) {
      console.error('Error fetching URLs:', error);
    }
  };

  if (activeMenu === "dashboard") {
    fetchUrls(); // Fetch URLs when the "dashboard" menu is active
  }
}, [activeMenu]);


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
  <input 
    type="text" 
    placeholder="Search by remarks" 
    value={searchQuery}
    onChange={(e) => handleSearch(e)} // Call handleSearch on input change
  />
</div>
            <div className="profile-container" ref={profileRef}>
      <div className="profile" onClick={handleProfileSelect}>
        {getInitials(userName).toUpperCase()}
      </div>
      {isProfileSelected && (
        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      )}
    </div>

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
              <form onSubmit={handleFormSubmit}>
      {/* Destination URL */}
      <label>
        Destination URL <span className="required">*</span>
        <input
          type="text"
          placeholder="Enter a valid URL"
          value={destinationUrl}
          onChange={(e) => setDestinationUrl(e.target.value)}
          required
        />
      </label>

      {/* Remarks */}
      <label className="req">
        Remarks <span className="required">*</span>
        <textarea
          placeholder="Add remarks"
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
          required
        />
      </label>

      {/* Link Expiration */}
      <label className="link-expiration-container">
        <div className="toggle-and-label">
          <span>Link Expiration</span>
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={isExpirationEnabled}
              onChange={() => setIsExpirationEnabled(!isExpirationEnabled)}
            />
            <span className="slider"></span>
          </label>
        </div>
        <input
          type="datetime-local"
          value={expirationDate}
          onChange={(e) => setExpirationDate(e.target.value)}
          disabled={!isExpirationEnabled}
        />
      </label>

      {/* Action Buttons */}
      <div className="popup-actions">
        <button type="button" className="clear-button" onClick={handleClear}>
          Clear
        </button>
        <button type="submit" className="create-button">
          Create New
        </button>
      </div>

      {/* Display Message */}
      {message && <p className="message">{message}</p>}
    </form>
            </div>
          </div>
          </div>
        )}

        
            {/* Dynamic Content */}
            {activeMenu === "dashboard" && (
        <div className="dashboard-content">
          <h2>
            <span className="total-clicks-label">Total Clicks </span>
            <span className="total-clicks-value">{totalClicks}</span>
          </h2>    
          <div className="stats">
            {/* Date-wise Clicks */}
            <div className="card">
              <h3>Date-wise Clicks</h3>
              {totalClicks > 0 ? (
                <ul className="click-stats">
                  {Object.entries(clicksByDate).length > 0 ? (
                    Object.entries(clicksByDate).map(([date, count]) => (
                      <li key={date}>
                        <span>{date}</span>
                        <div className="bar">
                          <div className="fill" style={{ width: `${(count / totalClicks) * 100}%` }}></div>
                        </div>
                        <span className="blue-text">{count}</span>
                      </li>
                    ))
                  ) : (
                    <li>
                      <span>No records found</span>
                    </li>
                  )}
                </ul>
              ) : (
                <p>No clicks recorded</p>
              )}
            </div>

            {/* Click Devices */}
            <div className="card">
              <h3>Click Devices</h3>
              {totalClicks > 0 ? (
                <ul className="click-stats">
                  <li>
                    <span>Mobile</span>
                    <div className="bar">
                      <div className="fill" style={{ width: `${(clicksByDevice.mobile / totalClicks) * 100}%` }}></div>
                    </div>
                    <span className="blue-text">{clicksByDevice.mobile}</span>
                  </li>
                  <li>
                    <span>Desktop</span>
                    <div className="bar">
                      <div className="fill" style={{ width: `${(clicksByDevice.desktop / totalClicks) * 100}%` }}></div>
                    </div>
                    <span className="blue-text">{clicksByDevice.desktop}</span>
                  </li>
                  <li>
                    <span>Tablet</span>
                    <div className="bar">
                      <div className="fill" style={{ width: `${(clicksByDevice.tablet / totalClicks) * 100}%` }}></div>
                    </div>
                    <span className="blue-text">{clicksByDevice.tablet}</span>
                  </li>
                </ul>
              ) : (
                <p>No clicks recorded for any device</p>              
              )}
            </div>
          </div>
        </div>
      )}
      

{activeMenu === "links" && (
  <div className="links-content">
    <div className="scrollable-links">
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
          {(filteredLinks.length > 0 ? filteredLinks : links).length > 0 ? (
            (filteredLinks.length > 0 ? filteredLinks : links).map((link) => (
              <tr key={link._id}> {/* Use unique identifier for the key */}
                <td>{new Date(link.createdAt).toLocaleString('en-US', {
                  month: 'short', // Short month name
                  day: '2-digit', // 2-digit day
                  year: 'numeric', // Numeric year
                  hour: '2-digit', // 2-digit hour
                  minute: '2-digit', // 2-digit minute
                  hour12: false // 24-hour format
                })}</td> {/* Format the date */}
                <td>{link.longUrl}</td>
                <td className="short-link-cell">
                  {link.shortUrl.length > 15 
                    ? `${link.shortUrl.substring(0, 15)}....` 
                    : link.shortUrl}
                  <button 
                    className="copy-btn" 
                    onClick={() => {
                      navigator.clipboard.writeText(link.shortUrl);
                      alert("Short URL copied: " + link.shortUrl);
                    }}
                    onMouseEnter={() => {
                      setLinks(prevLinks => prevLinks.map(l => 
                        l._id === link._id ? { ...l, isCopyHovered: true } : l
                      ));
                    }}
                    onMouseLeave={() => {
                      setLinks(prevLinks => prevLinks.map(l => 
                        l._id === link._id ? { ...l, isCopyHovered: false } : l
                      ));
                    }}
                  >
                    <img src={link.isCopyHovered ? blueCopy : copy} alt="Copy" className="copy-icon" />
                  </button>
                </td>
                <td>{link.remarks}</td>
                <td>{link.clicks || 0}</td>
                <td className={link.status === 'Active' ? 'status-active' : 'status-inactive'}>
                  {link.status}
                </td>
                <td>
                  <button 
                    className="edit-btn" 
                    onMouseEnter={() => {
                      setLinks(prevLinks => prevLinks.map(l => 
                        l._id === link._id ? { ...l, isEditHovered: true } : l
                      ));
                    }}
                    onMouseLeave={() => {
                      setLinks(prevLinks => prevLinks.map(l => 
                        l._id === link._id ? { ...l, isEditHovered: false } : l
                      ));
                    }}
                    onClick={() => {
                      alert("Edit action triggered");
                    }}
                  >
                    <img src={link.isEditHovered ? blueEdit : edit} alt="Edit" />
                  </button>

                  <button 
                    className="delete-btn" 
                    onMouseEnter={() => {
                      setLinks(prevLinks => prevLinks.map(l => 
                        l._id === link._id ? { ...l, isDeleteHovered: true } : l
                      ));
                    }}
                    onMouseLeave={() => {
                      setLinks(prevLinks => prevLinks.map(l => 
                        l._id === link._id ? { ...l, isDeleteHovered: false } : l
                      ));
                    }}
                    onClick={() => confirmDelete(link)} // Show confirmation popup
                  >
                    <img src={link.isDeleteHovered ? redDlt : dlt} alt="Delete" />
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="7" style={{ textAlign: 'center' }}>
                No data available
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>

    <div className="pagination">
      <button 
        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))} 
        disabled={currentPage === 1}
        className={currentPage === 1 ? 'disabled' : ''}
      >
        <img src={leftArrow} alt="Previous" />
      </button>
      <span> Page {currentPage} of {totalPages} </span>
      <button 
        onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))} 
        disabled={currentPage === totalPages}
        className={currentPage === totalPages ? 'disabled' : ''}
      >
        <img src={rightArrow} alt="Next" />
      </button>
    </div>
  </div>
)}


{/* Delete Confirmation Popup */}
{showDeletePopup && (
        <div className="delete-popup">
        <div className="popup-contents">
        <button className="close-popup-btn"  onClick={toggleDeletePopup} >
          <img src={windowClose} alt="" />
    </button>
          <h3>Are you sure, you want to remove it ? </h3>
          <div className="button-groups">
            <button className='no'  onClick={toggleDeletePopup} >NO</button>
            <button className='yes' onClick={handleDelete} >YES</button>
          </div>
        </div>
      </div>
      )}
  
       
  

  {activeMenu === "analytics" && (
 <div className="analytics-content">
 <div className="scrollable-links">
   <table>
     <thead>
       <tr>
         <th>Date</th>
         <th>Original Link</th>
         <th>Short Link</th>
         <th>IP Address</th>
         <th>Device</th>
       </tr>
     </thead>
     <tbody>
       {clicks.length > 0 ? (
         clicks.map((url, index) => (
           <tr key={index}>
             <td>{new Date(url.createdAt).toLocaleString('en-US', {
               month: 'short',
               day: '2-digit',
               year: 'numeric',
               hour: '2-digit',
               minute: '2-digit',
               hour12: false
             })}</td>
             <td>{url.longUrl}</td>
             <td>{url.shortUrl}</td>
             <td>{url.ipAddress}</td>
             <td>{url.device}</td>
           </tr>
         ))
       ) : (
         <tr>
           <td colSpan="6" style={{ textAlign: 'center' }}>
             No data available
           </td>
         </tr>
       )}
     </tbody>
   </table>
 </div>

  {/* Pagination Controls */}
  <div className="pagination">
      <button 
        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))} 
        disabled={currentPage === 1}
        className={currentPage === 1 ? 'disabled' : ''}
      >
        <img src={leftArrow} alt="Previous" />
      </button>
      <span> Page {currentPage} of {totalPages} </span>
      <button 
        onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))} 
        disabled={currentPage === totalPages}
        className={currentPage === totalPages ? 'disabled' : ''}
      >
        <img src={rightArrow} alt="Next" />
      </button>
    </div>
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

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
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
import copied from "../assets/copied.png";
import menuIcon from "../assets/menu.png"; 
import sort from "../assets/sort.png"
import axios from "axios"; 

const DashboardPage = () => {
  const [userName, setUserName] = useState("");
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState("");
  const [activeMenu, setActiveMenu] = useState("dashboard");
  const [popupVisible, setPopupVisible] = useState(false);
  const [expirationDate, setExpirationDate] = useState(""); 
  const [displayDate, setDisplayDate] = useState(""); 
  const [userMobile, setUserMobile] = useState(""); 
  const [userEmail, setUserEmail] = useState(""); 
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
  const [links, setLinks] = useState([]); 
  const [imgSrc, setImgSrc] = useState(copy);
  const [editImg, setEditImg] = useState(edit);
  const [deleteImg, setDeleteImg] = useState(dlt);
  const [deleteLink, setDeleteLink] = useState(null); 
  const [linkToDelete, setLinkToDelete] = useState(null); 
  const [isLoggedIn, setIsLoggedIn] = useState(true); 
  const [isProfileSelected, setIsProfileSelected] = useState(false);
  const profileRef = useRef(null); 
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [clicks, setClicks] = useState([]); 
  const [filteredLinks, setFilteredLinks] = useState([]); 
  const [searchQuery, setSearchQuery] = useState(""); 
  const [totalClicks, setTotalClicks] = useState(0);
  const [urls, setUrls] = useState([]); 
  const [clicksByDate, setClicksByDate] = useState({});
  const [hoverStates, setHoverStates] = useState({});
  const [isPopupVisible, setIsPopupVisible] = useState(false); 
  const [showPopup, setShowPopup] = useState(false); 
  const [editLinkId, setEditLinkId] = useState(null); 
  const [originalLink, setOriginalLink] = useState(""); 
  const [previousEmail, setPreviousEmail] = useState(""); // Track previous email
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);
  const [sortOrder, setSortOrder] = useState('asc'); // For date sorting
  const [statusFilter, setStatusFilter] = useState(null); // For filtering by status
  const [clicksByDevice, setClicksByDevice] = useState({
  mobile: 0,
  desktop: 0,
  tablet: 0,
});
  
useEffect(() => {
  // Fetch the username and email from localStorage
  const savedName = localStorage.getItem('username');
  const savedEmail = localStorage.getItem('email'); // Assuming you store email in localStorage
  if (savedName) {
    setUserName(savedName);
  } else {
    navigate('/login'); // Redirect to login if username is not found
    return;
  }

  if (savedEmail) {
    setUserEmail(savedEmail);
    setPreviousEmail(savedEmail); // Set the initial previous email
  }

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.log("No token found in localStorage");
        return;
      }

      const response = await axios.get('https://mini-link-management-platform-lwxs.onrender.com/api/auth/details', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 200) {
        setUserName(response.data.user.name); 
        setUserMobile(response.data.user.mobile); 
        setUserEmail(response.data.user.email); 
        setPreviousEmail(response.data.user.email); // Set the previous email from response
      }
    } catch (error) {
      console.error('Error fetching user details:', error);
      navigate('/login'); 
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
      'https://mini-link-management-platform-lwxs.onrender.com/api/auth/update', 
      {
        name: userName.trim() || 'defaultName', 
        email: userEmail.trim() || 'default@example.com', 
        mobile: userMobile.trim() || '0000000000', 
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.status === 200) {
      console.log('User  details updated:', response.data);
      toast.success('Details updated successfully'); // Show success toast

      // Check if the email has changed
      if (userEmail !== previousEmail) {
        handleLogout(); // Call logout if email has changed
      }
    }
  } catch (error) {
    console.error('Error updating user details:', error);
    toast.error('Error updating details'); // Show error toast
  }
};

const handleLogout = () => {
  localStorage.removeItem('token'); // Clear token
  localStorage.removeItem('username'); // Clear username
  localStorage.removeItem('email'); // Clear email
  navigate('/login'); // Redirect to login
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
    setDisplayDate(formatDateTime(selectedDateTime)); 
  } else {
    setDisplayDate(""); 
  }
};

 // Handle Delete Account
 const handleDeleteAccount = async () => {
  const token = localStorage.getItem('token');
  try {
    const response = await axios.delete('https://mini-link-management-platform-lwxs.onrender.com/api/auth/delete', {
      headers: { Authorization: `Bearer ${token}` },
    });

    toast.success(response.data.message); 
    navigate('/login'); 
  } catch (error) {
    console.error('Error deleting account:', error.response.data.message);
    toast.error('Error deleting account. Please try again.'); 
  }
  setShowDeletePopup(false); 
};


 


// Fetch links when the component mounts or when the active menu changes
useEffect(() => {
  const fetchLinks = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.log("No token found in localStorage");
        return;
      }

      const response = await axios.get(`https://mini-link-management-platform-lwxs.onrender.com/api/auth/all?page=${currentPage}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 200) {
        setLinks(response.data.urls); 
        setTotalPages(response.data.totalPages);
        setFilteredLinks(response.data.urls); 

      }
    } catch (error) {
      console.error('Error fetching user URLs:', error);
    }
  };

  if (activeMenu === "links") {
    fetchLinks(); 
  }
}, [activeMenu, currentPage]); 


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

      const response = await axios.get(`https://mini-link-management-platform-lwxs.onrender.com/api/auth/clicks?page=${currentPage}`, {
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


// Hide logout button when clicking outside
const handleClickOutside = (event) => {
  if (profileRef.current && !profileRef.current.contains(event.target)) {
    setIsProfileSelected(false); // Hide logout button
  }
};


const handleCopyToClipboard = (shortUrl) => {
  navigator.clipboard.writeText(shortUrl) // Copy the short URL to the clipboard
    .then(() => {
      setIsPopupVisible(true); // Show the popup
      setTimeout(() => {
        setIsPopupVisible(false); // Hide the popup after 2000 milliseconds
      }, 2000);
    })
    .catch((err) => {
      console.error('Failed to copy: ', err);
    });
};

const CopyPopup = ({ message }) => {
    return (
      <div className="copy-popup">
        <img src={copied} alt="" />
     Link Copied    
  </div>
    );
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
    const response = await fetch("https://mini-link-management-platform-lwxs.onrender.com/api/auth/create", {
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
    toast.success("Short URL created successfully!"); // Replace alert with toast

    // Close the popup
    togglePopup();

    // Clear the form fields
    handleClear();

    // Redirect to the "links" menu
    setActiveMenu("links"); // Set the active menu to "links"
    
  } catch (error) {
    console.error("Error creating short URL:", error.message);
    toast.error(error.message || "Error creating short URL."); // Show error toast
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
    await axios.delete(`https://mini-link-management-platform-lwxs.onrender.com/api/auth/url/${linkToDelete._id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setLinks(links.filter(link => link._id !== linkToDelete._id)); // Remove the deleted link from the state
    toast.success("Link deleted successfully!"); // Show success toast
  } catch (error) {
    console.error('Error deleting link:', error);
    toast.error('Error deleting link. Please try again.'); // Show error toast
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

const toggleSidebar = () => {
  setIsSidebarVisible(!isSidebarVisible);
};

const handleSearch = (e) => {
  const query = e.target.value.toLowerCase();
  setSearchQuery(query);
  setActiveMenu("links");

  if (query) {
    const results = links.filter(link => 
      link.remarks.toLowerCase().includes(query)
    );

    setFilteredLinks(results); // Set filtered links to the results
  } else {
    setFilteredLinks(links); // Reset to all links if search is cleared
  }
};


const handleMouseEnter = (id, type) => {
  setHoverStates(prev => ({ ...prev, [id]: { ...prev[id], [type]: true } }));
};

const handleMouseLeave = (id, type) => {
  setHoverStates(prev => ({ ...prev, [id]: { ...prev[id], [type]: false } }));
};

useEffect(() => {
  const fetchLinks = async () => {
    const token = localStorage.getItem('token');
    const response = await axios.get('https://mini-link-management-platform-lwxs.onrender.com/api/auth/all', {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (response.status === 200) {
      const allLinks = response.data.urls; // Assuming the API returns an array of URLs
      setLinks(allLinks);

      // Calculate total clicks
      const total = allLinks.reduce((sum, url) => sum + url.clicks, 0);
      setTotalClicks(total); // Set total clicks

      // Calculate clicks by device
      const deviceCounts = {
        mobile: 0,
        desktop: 0,
        tablet: 0,
      };

      allLinks.forEach(link => {
        // Assuming you have a way to track device clicks in your link data
        // This is just a placeholder; you may need to adjust based on your data structure
        if (link.device === 'Android' || link.device === 'iOS') {
          deviceCounts.mobile += link.clicks;
        } else if (link.device === 'Windows' || link.device === 'MacOS') {
          deviceCounts.desktop += link.clicks;
        } else if (link.device === 'Tablet') {
          deviceCounts.tablet += link.clicks;
        }
      });

      setClicksByDevice(deviceCounts);

      // Calculate clicks by date
      const dateCounts = {};
      allLinks.forEach(link => {
        const date = new Date(link.createdAt).toLocaleDateString('en-US');
        dateCounts[date] = (dateCounts[date] || 0) + link.clicks;
      });
      setClicksByDate(dateCounts);
    }
  };

  if (activeMenu === "dashboard") {
    fetchLinks(); // Fetch links when the "dashboard" menu is active
  }
}, [activeMenu]);

const handleEditSubmit = async (e) => {
  e.preventDefault();

  // Validate required fields
  if (!remarks) {
    alert("Please fill out all required fields.");
    return;
  }

  const payload = {
    remarks,
    expirationDate: isExpirationEnabled ? expirationDate : null,
  };

  try {
    const token = localStorage.getItem('token'); // Get the token from local storage
    const response = await fetch(`https://mini-link-management-platform-lwxs.onrender.com/api/auth/url/${editLinkId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`, // Include the token in the Authorization header
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to update the URL");
    }

    // Update the links state with the edited link
    setLinks((prevLinks) => 
      prevLinks.map(link => 
        link._id === editLinkId ? { ...link, remarks, expirationDate: isExpirationEnabled ? expirationDate : null } : link
      )
    );

    // Show success alert message
    toast.success("Link updated successfully!"); // Show success toast

    // Close the popup
    setShowPopup(false);
    handleClear(); // Clear fields after submission

  } catch (error) {
    console.error("Error updating link:", error.message);
    setMessage(error.message || "Error updating link.");
  }
};

const handleSortByDate = () => {
  const newSortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
  setSortOrder(newSortOrder);
  
  const sortedLinks = [...links].sort((a, b) => {
      const dateA = new Date(a.createdAt);
      const dateB = new Date(b.createdAt);
      return newSortOrder === 'asc' ? dateA - dateB : dateB - dateA;
  });
  
  setFilteredLinks(sortedLinks);
};

const handleFilterByStatus = () => {
  if (statusFilter === 'active') {
      setStatusFilter('inactive');
      setFilteredLinks(links.filter(link => link.status === 'Inactive')); // Adjusted to match your data
  } else {
      setStatusFilter('active');
      setFilteredLinks(links.filter(link => link.status === 'Active')); // Adjusted to match your data
  }
};

 // Handle sorting by date
 const handleSort = () => {
  const newSortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
  setSortOrder(newSortOrder);

  const sortedClicks = [...clicks].sort((a, b) => {
    const dateA = new Date(a.createdAt);
    const dateB = new Date(b.createdAt);
    return newSortOrder === 'asc' ? dateA - dateB : dateB - dateA;
  });

  setClicks(sortedClicks);
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
      <div className={`sidebar ${isSidebarVisible ? 'active' : ''}`}>

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
            <div className="settings-container">
        <li
          className={`settings ${activeMenu === "settings" ? "active" : ""}`}
          onClick={() => setActiveMenu("settings")}
        >
          <img src={activeMenu === "settings" ? settingBlue : setting} alt="Settings Icon" />
          Settings
        </li>
      </div>
          </ul>
        </nav>
      </div>

      {/* Main Content */}
      <div className={`main-content ${isSidebarVisible ? 'active' : ''}`}>
      <div className="hamburger-menu" onClick={toggleSidebar}>
          <img src={menuIcon} alt="Menu" className='menu' />
        </div>
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
  onChange={handleSearch} 
 
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
  {clicksByDevice.mobile > 0 || clicksByDevice.desktop > 0 || clicksByDevice.tablet > 0 ? (
    <ul className="click-stats">
      {clicksByDevice.mobile > 0 && (
        <li>
          <span>Mobile</span>
          <div className="bar">
            <div className="fill" style={{ width: `${(clicksByDevice.mobile / totalClicks) * 100}%` }}></div>
          </div>
          <span className="blue-text">{clicksByDevice.mobile}</span>
        </li>
      )}
      {clicksByDevice.desktop > 0 && (
        <li>
          <span>Desktop</span>
          <div className="bar">
            <div className="fill" style={{ width: `${(clicksByDevice.desktop / totalClicks) * 100}%` }}></div>
          </div>
          <span className="blue-text">{clicksByDevice.desktop}</span>
        </li>
      )}
      {clicksByDevice.tablet > 0 && (
        <li>
          <span>Tablet</span>
          <div className="bar">
            <div className="fill" style={{ width: `${(clicksByDevice.tablet / totalClicks) * 100}%` }}></div>
          </div>
          <span className="blue-text">{clicksByDevice.tablet}</span>
        </li>
      )}
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
                  <th onClick={handleSortByDate}>
                            Date <img src={sort} alt="" className='sort' />
                        </th>
                    <th>Original Link</th>
                    <th>Short Link</th>
                    <th>Remarks</th>
                    <th>Clicks</th>
                    <th onClick={handleFilterByStatus}>
                            Status <img src={sort} alt="" className='sort-status' />
                        </th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLinks.length > 0 ? (
                    filteredLinks.map((link) => (
                      <tr key={link._id}>
                        <td>{new Date(link.createdAt).toLocaleString('en-US', {
                          month: 'short',
                          day: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                          hour12: false
                        })}</td>
                        <td>{link.longUrl}</td>
                        <td className="short-link-cell">
                          {link.shortUrl.length > 15 
                            ? `${link.shortUrl.substring(0, 15)}....` 
                            : link.shortUrl}
                         <button 
    className="copy-btn" 
    onMouseEnter={() => handleMouseEnter(link._id, 'copy')}
    onMouseLeave={() => handleMouseLeave(link._id, 'copy')}
    onClick={() => handleCopyToClipboard(link.shortUrl)} // Call handleCopyToClipboard on click

  >
    <img src={hoverStates[link._id]?.copy ? blueCopy : copy} alt="Copy" className="copy-icon" />
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
  onMouseEnter={() => handleMouseEnter(link._id, 'edit')}
  onMouseLeave={() => handleMouseLeave(link._id, 'edit')}
  onClick={() => {
    setOriginalLink(link.longUrl); // Set the original link
    setRemarks(link.remarks); // Set the remarks
    setExpirationDate(link.expirationDate ? new Date(link.expirationDate).toISOString().slice(0, 16) : ""); // Set the expiration date
    setIsExpirationEnabled(!!link.expirationDate); // Enable expiration if it exists
    setEditLinkId(link._id); // Set the ID of the link being edited
    setShowPopup(true); // Show the popup
  }}
>
  <img src={hoverStates[link._id]?.edit ? blueEdit : edit} alt="Edit" />
</button>
  <button 
    className="delete-btn" 
    onMouseEnter={() => handleMouseEnter(link._id, 'delete')}
    onMouseLeave={() => handleMouseLeave(link._id, 'delete')}
    onClick={() => confirmDelete(link)}
  >
    <img src={hoverStates[link._id]?.delete ? redDlt : dlt} alt="Delete" />
  </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                    <td colSpan="7" className="nodata" >
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

{isPopupVisible && <CopyPopup />}
  {/* Confirmation Popup */}
  {showPopup && (
  <div className="popup-overlay">
    <div className="popup">
      <div className="popup-content">
        <div className="upper">
          <h2>Edit Link</h2>
          <img
            src={close}
            alt="Close"
            className="close-icon"
            onClick={() => {
              setShowPopup(false);
              handleClear(); // Clear fields when closing
            }} 
          />
        </div>
        <form onSubmit={handleEditSubmit}>
          {/* Original Link (Read-only) */}
          <label>
            Original Link <span className="required">*</span>
            <input
              type="text"
              value={originalLink}
              readOnly
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
              Save
            </button>
          </div>

          {/* Display Message */}
          {message && <p className="message">{message}</p>}
        </form>
      </div>
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
       <th onClick={handleSort} style={{ cursor: 'pointer' }}>
                  Date <img src={sort} alt="" className='sort' />
                </th>
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

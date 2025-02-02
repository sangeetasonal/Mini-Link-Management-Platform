# Mini Link Management Platform

## Objective
Create a web application that allows users to create, manage, and analyze shortened URLs, including advanced link distribution and account management features.

## Features and Requirements

### 1. URL Shortening
- **Functionality**: Users can input a long URL and generate a shortened version.
- **Unique Shortened URLs**: Ensure each shortened URL is unique.
- **Short Link Generation**: Use a hash or random string generator to create short links (e.g., `https://<hostname>/<6-8 digit alphanumeric>`).
- **Expiration Dates**: Allow users to set expiration dates for their links.

### 2. User Management
- **Registration and Login**: Implement user registration and login functionality using email and password.
- **Password Security**: Securely hash passwords before storing them in the database (e.g., using bcrypt).
- **Account Settings**:
  - **Update Profile**: Allow users to update their name and email.
  - **Email Update Logout**: If the user updates their email address, automatically log them out.
  - **Delete Account**: Allow users to delete their account, which removes all associated links and data.

### 3. Dashboard
- **User Dashboard**: Provide a dashboard showing a list of the user's shortened URLs, including:
  - Original URL.
  - Shortened URL.
  - Click analytics (number of clicks).
- **Link Management Options**: Include options to edit or delete links.

### 4. Click Tracking
- **Metadata Tracking**: Track metadata for each click, including:
  - Timestamp of the click.
  - IP address of the user.
  - User agent (browser and OS details).
- **Display Click Data**: Summarize click data in the dashboard.

### 5. Link Management
- **Edit Links**: Allow users to edit the original URL or its alias.
- **Delete Links**: Enable users to delete individual links.

### 6. Analytics
- **Detailed Analytics**: Provide detailed analytics for each shortened link, including:
  - Device type (mobile, desktop, tablet).
  - Browser details.

### 7. Responsive Design
- **Mobile and Desktop Compatibility**: Ensure the platform works seamlessly on both desktop and mobile devices using responsive design techniques (e.g., CSS Flexbox/Grid).

### 8. Pagination
- **Implement Pagination**: Add pagination for the list of links and analytics data to improve user experience and performance.

## Setup Instructions

Follow these steps to set up the project locally:

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/your-repo-name.git
cd your-repo-name
```

### 2. Set Up the Backend
Navigate to the backend directory:
```bash
cd backend
```
Install backend dependencies:
```bash
npm install
```
Create environment variables: Create a `.env` file in the backend directory and add the following variables:
```plaintext
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
PORT=5000
```
Replace `your_mongodb_connection_string` with your actual MongoDB connection string.
Replace `your_jwt_secret` with a secure secret for JWT signing.

Run the backend server:
```bash
npm start
```

### 3. Set Up the Frontend
Navigate to the frontend directory:
```bash
cd ../frontend
```
Install frontend dependencies:
```bash
npm install
```
Run the frontend application:
```bash
npm start
```
The frontend application should now be running at `http://localhost:3000`.

### 4. Access the Application
Open your web browser and go to `http://localhost:3000` to access the Mini Link Management Platform.

You can use the demo credentials provided below to log in or create a new account:

**Demo Credentials:**
- **Email**: bogo@gmail.com
- **Password**: 741


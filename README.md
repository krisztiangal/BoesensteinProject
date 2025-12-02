# Mountains Mountaineering App

## Project Description

I made this web app to practice what I learned about React, and rehearse my JavaScript knowledge. I wanted to create something that I would use myself, so I chose one of my favourite hobbies as a topic. About halfway through the creation process I realized that this is going to require more than my current level - but this is how one learns, right? AI was used during the development process.

## Features

*   User authentication (Login, Signup)
*   User profiles (viewing own and public profiles)
*   Mountain listings with detailed information
*   Wishlist functionality to save desired climbs
*   Ability to mark mountains as summited to track achievements
*   Users can upload new mountains to the database
*   Ranking system for users based on highest point achieved and most summits
*   Search functionality for mountains and users
*   Admin functionalities for managing content and users (if applicable and implemented)

## Technologies Used

### Frontend
*   **React:** A JavaScript library for building user interfaces.
*   **React Context API:** For robust global state management (e.g., `UserContext`).
*   **CSS Modules:** For component-scoped styling to prevent style conflicts.
*   **JavaScript (ES6+):** Modern JavaScript features for cleaner and more efficient code.

### Backend
*   **Node.js:** JavaScript runtime environment for the server-side logic.
*   **Express.js:** A fast, unopinionated, minimalist web framework for Node.js, used for building the REST API.
*   **JSON Web Tokens (JWT):** For secure, stateless authentication between the client and server.
*   **Bcrypt.js:** A library used for hashing passwords to ensure they are stored securely.
*   **Multer:** Node.js middleware for handling `multipart/form-data`, primarily used for file uploads (profile pictures, mountain images).
*   **`fs` / `fs/promises`:** Node.js built-in file system modules for asynchronous file operations like reading, writing, and managing uploaded files.
*   **`cors`:** A Node.js package providing middleware to enable Cross-Origin Resource Sharing, allowing the frontend to communicate with the backend from a different origin.
*   **`dotenv`:** A module that loads environment variables from a `.env` file into `process.env`.

### Data Storage
*   **File-based JSON:** User data and mountain details are persisted in `.json` and `.js` files located in the `backend/data` directory. This is a lightweight solution suitable for smaller projects or development environments.

## Installation and Setup

To get this project up and running on your local machine, follow these steps:

### 1. Clone the Repository

First, clone the project repository from GitHub:

```bash
git clone https://github.com/YOUR_USERNAME/mountains.git # Replace with your actual repository URL
cd mountains
```

### 2. Backend Setup

The backend server manages user authentication, mountain data, and image uploads.

a.  **Navigate to the backend directory:**
    ```bash
    cd backend
    ```

b.  **Install backend dependencies:**
    ```bash
    npm install
    ```

c.  **Create a `.env` file:**
    Create a new file named `.env` in the `mountains/backend` directory. This file will store sensitive environment variables. Copy the following content and fill in your actual secret keys and desired port:

    ```
    PORT=5000
    JWT_SECRET=your_super_secret_jwt_key_here # **IMPORTANT**: Use a strong, unique key for production!
    ```

d.  **Run the backend server:**
    ```bash
    node server.js
    # Alternatively, if a start script is defined in package.json (check backend/package.json for "scripts" section):
    # npm start
    ```
    The backend server should now be running, typically accessible at `http://localhost:5000` (or the port you configured).

### 3. Frontend Setup

The frontend is the React application that users interact with.

a.  **Navigate back to the project root:**
    ```bash
    cd .. 
    # Your frontend (React app) is located in the root 'mountains' directory.
    ```

b.  **Install frontend dependencies:**
    ```bash
    npm install
    ```

c.  **Create a `.env.local` file (if needed for production or specific environments):**
    For local development, the `API_BASE_URL` in `src/config/api.js` usually defaults to `http://localhost:5000`. However, if you need to specify a different API URL (e.g., for mobile testing with your machine's IP address or for a production deployment), create a file named `.env.local` in the root `mountains` directory (same level as `package.json`).

    *Example `.env.local` content:*
    ```
    REACT_APP_API_URL=http://192.168.32.201:5000 
    ```
    **Important:** Replace `192.168.32.201` with the *actual IP address* of the machine running your backend server if you are testing from other devices on your local network (like a mobile phone). Ensure your backend server's firewall allows incoming connections on the specified port.

d.  **Run the frontend development server:**
    ```bash
    npm start
    ```
    Your React application should automatically open in your web browser, typically at `http://localhost:3000`.

## Usage

Once both the frontend and backend servers are running:

1.  **Browse Mountains:** Explore the list of available mountains.
2.  **Sign Up / Log In:** Create an account or log in to access personalized features.
3.  **Manage Your Profile:** View your profile, update your profile picture, and see your wishlist and summited mountains.
4.  **Interact with Mountains:** Add mountains to your wishlist, mark them as summited, or even upload new mountains.
5.  **View Ranks:** See who has achieved the highest points or summited the most mountains.
6.  **Search:** Find specific mountains or users using the search bar.

## Contributing

We welcome contributions to the Mountains app! If you're interested in improving the project, please:

1.  Fork the repository.
2.  Create a new branch for your features or bug fixes.
3.  Submit a pull request with a clear description of your changes.

## License

This project is licensed under the MIT License - see the `LICENSE` file for details.

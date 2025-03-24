# Syncthreads Backend

This is the backend for the Syncthreads assignment, built using **Node.js** and **Express** with **SQLite** for database management. It includes authentication using **JWT** and APIs for login, dashboard, and map functionalities.

## Features

- **User Authentication** using JWT
- **Dashboard API** for fetching dashboard data
- **Map API** for retrieving map-related configurations
- **Protected Routes** requiring authentication
- **Error Handling** for invalid requests

## Technologies Used

- Node.js
- Express.js
- SQLite
- JSON Web Token (JWT)
- Bcrypt.js
- CORS

## Installation

### 1. Clone the repository
```sh
git clone https://github.com/srinivas9548/Syncthreads-Backend-Assignment.git
cd Syncthreads-Backend-Assignment
```

### 2. Install dependencies
```sh
npm install
```

### 3. Start the server
```sh
nodemon index.js
```

## Authentication
- On successful login, a JWT token is returned.
- This token must be included in the Authorization header (Bearer <token>) for accessing protected routes.

## API Endpoints

#### **1. User Authentication**

**Login API**
- **Method:** `POST`
- **Endpoint:** `/api/login`
- **Description:** Authenticates the user and returns a JWT token.
- **Request Body:**
```json
{
    "username": "srinivas",
    "password": "srinivas@2022"
}
```

#### **2. Dashboard API (Authentication)** 

**Get Dashboard Data**
- **Method:** `GET`
- **Endpoint:** `/api/dashboard`
- **Description:** Returns dashboard card component data (authenticationToken).
- **Headers:** Authorization: Bearer <JWT_TOKEN>

#### **3. Map API (Authentication)** 

**Get Map View Data**
- **Method:** `GET`
- **Endpoint:** `/api/map`
- **Description:** Returns initial map center coordinates and zoom level (authenticationToken).
- **Headers:** Authorization: Bearer <JWT_TOKEN>
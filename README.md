# University Management System

A comprehensive university management system built with React and Node.js.

## Features

- User Authentication (Admin, Instructor, Student)
- Course Management
- Student Enrollment
- Grade Management
- User Profile Management

## Tech Stack

- Frontend: React, Vite
- Backend: Node.js, Express
- Database: MySQL

## Getting Started

### Prerequisites

- Node.js
- MySQL

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
```

2. Install dependencies:
```bash
# Install client dependencies
cd client
npm install

# Install server dependencies
cd ../server
npm install
```

3. Set up the database:
```bash
cd server
node setup-database.js
```

4. Start the development servers:
```bash
# Start the backend server
cd server
npm start

# Start the frontend development server
cd client
npm run dev
```

## Environment Variables

Create a `.env` file in the server directory with the following variables:
```
DB_HOST=localhost
DB_USER=your_username
DB_PASSWORD=your_password
DB_NAME=ums_db
JWT_SECRET=your_jwt_secret
```

## Deployment

The application is deployed using:
- Frontend: Vercel
- Backend: Render.com
- Database: Clever Cloud

## License

This project is licensed under the MIT License. 
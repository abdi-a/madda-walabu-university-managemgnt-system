const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.FRONTEND_URL 
    : 'http://localhost:5173'
}));
app.use(express.json());

// Database connection with retry mechanism
const connectWithRetry = () => {
  const db = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'ums_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });

  db.connect((err) => {
    if (err) {
      console.error('Error connecting to the database:', err);
      console.log('Retrying in 5 seconds...');
      setTimeout(connectWithRetry, 5000);
      return;
    }
    console.log('Connected to MySQL database');
    
    // Make db available in routes
    app.locals.db = db;

    // Handle database connection errors
    db.on('error', (err) => {
      console.error('Database error:', err);
      if (err.code === 'PROTOCOL_CONNECTION_LOST') {
        console.log('Database connection was closed. Reconnecting...');
        connectWithRetry();
      } else {
        throw err;
      }
    });
  });
};

// Initial database connection
connectWithRetry();

// Routes
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const instructorRoutes = require('./routes/instructor');
const studentRoutes = require('./routes/student');

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/instructor', instructorRoutes);
app.use('/api/student', studentRoutes);

// Error handling middleware with more detailed errors
app.use((err, req, res, next) => {
  console.error('Error details:', err);
  
  // Check if error is a database error
  if (err.code && err.code.startsWith('ER_')) {
    return res.status(500).json({ 
      message: 'Database error occurred',
      error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
  }
  
  // Check if error is a validation error
  if (err.name === 'ValidationError') {
    return res.status(400).json({ 
      message: 'Validation error',
      error: err.message 
    });
  }
  
  // Default error
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 
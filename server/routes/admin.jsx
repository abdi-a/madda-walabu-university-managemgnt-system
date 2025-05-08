const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const mysql = require('mysql2');

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'ums_db'
});

// Middleware to verify admin token
const verifyAdmin = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    if (decoded.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    req.adminId = decoded.id;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

// Register Instructor
router.post('/register-instructor', verifyAdmin, async (req, res) => {
  const { name, email, password, department } = req.body;
  
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const query = 'INSERT INTO instructors (name, email, password, department) VALUES (?, ?, ?, ?)';
    db.query(query, [name, email, hashedPassword, department], (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: 'Error registering instructor' });
      }
      res.status(201).json({ message: 'Instructor registered successfully' });
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Register Course
router.post('/register-course', verifyAdmin, (req, res) => {
  const { courseCode, courseName, credits, department } = req.body;
  
  const query = 'INSERT INTO courses (course_code, course_name, credits, department) VALUES (?, ?, ?, ?)';
  db.query(query, [courseCode, courseName, credits, department], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Error registering course' });
    }
    res.status(201).json({ message: 'Course registered successfully' });
  });
});

// Get All Instructors
router.get('/instructors', verifyAdmin, (req, res) => {
  const query = 'SELECT id, name, email, department FROM instructors';
  db.query(query, (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Server error' });
    }
    res.json(results);
  });
});

// Get All Courses
router.get('/courses', verifyAdmin, (req, res) => {
  const query = 'SELECT * FROM courses';
  db.query(query, (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Server error' });
    }
    res.json(results);
  });
});

module.exports = router; 
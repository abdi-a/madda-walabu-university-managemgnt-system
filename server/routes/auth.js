const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mysql = require('mysql2');

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'ums_db'
});

// Admin Registration
router.post('/register/admin', async (req, res) => {
  const { email, password, name } = req.body;
  
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const query = 'INSERT INTO admins (email, password, name) VALUES (?, ?, ?)';
    db.query(query, [email, hashedPassword, name], (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: 'Error registering admin' });
      }
      res.status(201).json({ message: 'Admin registered successfully' });
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Student Registration
router.post('/register/student', async (req, res) => {
  const { studentId, email, password, name } = req.body;
  
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const query = 'INSERT INTO students (student_id, email, password, name) VALUES (?, ?, ?, ?)';
    db.query(query, [studentId, email, hashedPassword, name], (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: 'Error registering student' });
      }
      res.status(201).json({ message: 'Student registered successfully' });
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { email, password, role } = req.body;
  
  let table;
  let idField = 'id'; // Default ID field name
  
  switch(role) {
    case 'admin':
      table = 'admins';
      break;
    case 'instructor':
      table = 'instructors';
      idField = 'instructor_id';
      break;
    case 'student':
      table = 'students';
      idField = 'student_id';
      break;
    default:
      return res.status(400).json({ message: 'Invalid role' });
  }
  
  const query = `SELECT * FROM ${table} WHERE email = ?`;
  
  try {
    db.query(query, [email], async (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: 'Server error' });
      }
      
      if (results.length === 0) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
      
      const user = results[0];
      const isValidPassword = await bcrypt.compare(password, user.password);
      
      if (!isValidPassword) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
      
      // Remove password from user object before sending
      delete user.password;
      
      const token = jwt.sign(
        { id: user[idField], role: role },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '1h' }
      );
      
      res.json({
        token,
        user: {
          ...user,
          role: role
        }
      });
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Verify token route
router.get('/verify', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    let table;
    let idField = 'id';
    
    switch(decoded.role) {
      case 'admin':
        table = 'admins';
        break;
      case 'instructor':
        table = 'instructors';
        idField = 'instructor_id';
        break;
      case 'student':
        table = 'students';
        idField = 'student_id';
        break;
      default:
        return res.status(400).json({ message: 'Invalid role' });
    }
    
    const query = `SELECT * FROM ${table} WHERE ${idField} = ?`;
    
    db.query(query, [decoded.id], (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: 'Server error' });
      }
      
      if (results.length === 0) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      const user = results[0];
      delete user.password;
      
      res.json({
        ...user,
        role: decoded.role
      });
    });
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(401).json({ message: 'Invalid token' });
  }
});

module.exports = router; 
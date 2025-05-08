const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Login route
router.post('/login', async (req, res) => {
  const { email, password, role } = req.body;
  const db = req.app.locals.db;
  
  if (!email || !password || !role) {
    return res.status(400).json({ message: 'Please provide email, password and role' });
  }

  let table;
  let idField = 'id';
  
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
  
  try {
    const query = `SELECT * FROM ${table} WHERE email = ?`;
    const [results] = await db.promise().query(query, [email]);
    
    if (results.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    const user = results[0];
    const isValidPassword = await bcrypt.compare(password, user.password);
    
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Remove password from user object
    delete user.password;
    
    const token = jwt.sign(
      { id: user[idField], role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '1h' }
    );
    
    res.json({
      token,
      user: {
        ...user,
        role
      }
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
    const db = req.app.locals.db;
    
    let table;
    switch(decoded.role) {
      case 'admin':
        table = 'admins';
        break;
      case 'instructor':
        table = 'instructors';
        break;
      case 'student':
        table = 'students';
        break;
      default:
        return res.status(400).json({ message: 'Invalid role' });
    }
    
    const [user] = await db.promise().query(`SELECT * FROM ${table} WHERE id = ?`, [decoded.id]);
    
    if (!user[0]) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    delete user[0].password;
    res.json({
      ...user[0],
      role: decoded.role
    });
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(401).json({ message: 'Invalid token' });
  }
});

module.exports = router; 
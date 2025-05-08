const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

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

// Basic admin routes
router.get('/dashboard', (req, res) => {
  res.json({ message: 'Admin dashboard' });
});

// Get all instructors
router.get('/instructors', verifyAdmin, async (req, res) => {
  const db = req.app.locals.db;
  try {
    const [instructors] = await db.promise().query('SELECT id, name, email, department FROM instructors');
    res.json(instructors);
  } catch (error) {
    console.error('Error fetching instructors:', error);
    res.status(500).json({ message: 'Error fetching instructors' });
  }
});

// Add new instructor
router.post('/instructors', verifyAdmin, async (req, res) => {
  const db = req.app.locals.db;
  const { name, email, department } = req.body;

  try {
    // Generate a default password (you might want to send this via email in a real application)
    const defaultPassword = 'changeme123';
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

    const query = 'INSERT INTO instructors (name, email, password, department) VALUES (?, ?, ?, ?)';
    const [result] = await db.promise().query(query, [name, email, hashedPassword, department]);
    
    res.status(201).json({
      message: 'Instructor created successfully',
      id: result.insertId
    });
  } catch (error) {
    console.error('Error creating instructor:', error);
    res.status(500).json({ message: 'Error creating instructor' });
  }
});

// Update instructor
router.put('/instructors/:id', verifyAdmin, async (req, res) => {
  const db = req.app.locals.db;
  const { id } = req.params;
  const { name, email, department } = req.body;

  try {
    const query = 'UPDATE instructors SET name = ?, email = ?, department = ? WHERE id = ?';
    await db.promise().query(query, [name, email, department, id]);
    res.json({ message: 'Instructor updated successfully' });
  } catch (error) {
    console.error('Error updating instructor:', error);
    res.status(500).json({ message: 'Error updating instructor' });
  }
});

// Delete instructor
router.delete('/instructors/:id', verifyAdmin, async (req, res) => {
  const db = req.app.locals.db;
  const { id } = req.params;

  try {
    await db.promise().query('DELETE FROM instructors WHERE id = ?', [id]);
    res.json({ message: 'Instructor deleted successfully' });
  } catch (error) {
    console.error('Error deleting instructor:', error);
    res.status(500).json({ message: 'Error deleting instructor' });
  }
});

// Get all students
router.get('/students', verifyAdmin, async (req, res) => {
  const db = req.app.locals.db;
  try {
    const [students] = await db.promise().query('SELECT id, student_id, name, email FROM students');
    res.json(students);
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ message: 'Error fetching students' });
  }
});

// Add new student
router.post('/students', verifyAdmin, async (req, res) => {
  const db = req.app.locals.db;
  const { name, email, studentId } = req.body;

  try {
    // Generate a default password (you might want to send this via email in a real application)
    const defaultPassword = 'changeme123';
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

    const query = 'INSERT INTO students (student_id, name, email, password) VALUES (?, ?, ?, ?)';
    const [result] = await db.promise().query(query, [studentId, name, email, hashedPassword]);
    
    res.status(201).json({
      message: 'Student created successfully',
      id: result.insertId
    });
  } catch (error) {
    console.error('Error creating student:', error);
    res.status(500).json({ message: 'Error creating student' });
  }
});

// Update student
router.put('/students/:id', verifyAdmin, async (req, res) => {
  const db = req.app.locals.db;
  const { id } = req.params;
  const { name, email, studentId } = req.body;

  try {
    const query = 'UPDATE students SET name = ?, email = ?, student_id = ? WHERE id = ?';
    await db.promise().query(query, [name, email, studentId, id]);
    res.json({ message: 'Student updated successfully' });
  } catch (error) {
    console.error('Error updating student:', error);
    res.status(500).json({ message: 'Error updating student' });
  }
});

// Delete student
router.delete('/students/:id', verifyAdmin, async (req, res) => {
  const db = req.app.locals.db;
  const { id } = req.params;

  try {
    await db.promise().query('DELETE FROM students WHERE id = ?', [id]);
    res.json({ message: 'Student deleted successfully' });
  } catch (error) {
    console.error('Error deleting student:', error);
    res.status(500).json({ message: 'Error deleting student' });
  }
});

// Get dashboard statistics
router.get('/statistics', verifyAdmin, async (req, res) => {
  const db = req.app.locals.db;
  try {
    const [[studentCount]] = await db.promise().query('SELECT COUNT(*) as count FROM students');
    const [[instructorCount]] = await db.promise().query('SELECT COUNT(*) as count FROM instructors');
    const [[courseCount]] = await db.promise().query('SELECT COUNT(*) as count FROM courses');

    res.json({
      totalStudents: studentCount.count,
      totalInstructors: instructorCount.count,
      totalCourses: courseCount.count
    });
  } catch (error) {
    console.error('Error fetching statistics:', error);
    res.status(500).json({ message: 'Error fetching statistics' });
  }
});

// Get all courses
router.get('/courses', verifyAdmin, async (req, res) => {
  const db = req.app.locals.db;
  try {
    const [courses] = await db.promise().query('SELECT * FROM courses');
    res.json(courses);
  } catch (error) {
    console.error('Error fetching courses:', error);
    res.status(500).json({ message: 'Error fetching courses' });
  }
});

// Add new course
router.post('/courses', verifyAdmin, async (req, res) => {
  const db = req.app.locals.db;
  const { course_code, course_name, credits, department } = req.body;

  try {
    const query = 'INSERT INTO courses (course_code, course_name, credits, department) VALUES (?, ?, ?, ?)';
    const [result] = await db.promise().query(query, [course_code, course_name, credits, department]);
    
    res.status(201).json({
      message: 'Course created successfully',
      id: result.insertId
    });
  } catch (error) {
    console.error('Error creating course:', error);
    res.status(500).json({ message: 'Error creating course' });
  }
});

// Update course
router.put('/courses/:id', verifyAdmin, async (req, res) => {
  const db = req.app.locals.db;
  const { id } = req.params;
  const { course_code, course_name, credits, department } = req.body;

  try {
    const query = 'UPDATE courses SET course_code = ?, course_name = ?, credits = ?, department = ? WHERE id = ?';
    await db.promise().query(query, [course_code, course_name, credits, department, id]);
    res.json({ message: 'Course updated successfully' });
  } catch (error) {
    console.error('Error updating course:', error);
    res.status(500).json({ message: 'Error updating course' });
  }
});

// Delete course
router.delete('/courses/:id', verifyAdmin, async (req, res) => {
  const db = req.app.locals.db;
  const { id } = req.params;

  try {
    await db.promise().query('DELETE FROM courses WHERE id = ?', [id]);
    res.json({ message: 'Course deleted successfully' });
  } catch (error) {
    console.error('Error deleting course:', error);
    res.status(500).json({ message: 'Error deleting course' });
  }
});

module.exports = router; 
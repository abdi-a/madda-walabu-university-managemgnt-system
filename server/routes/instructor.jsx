const express = require('express');
const router = express.Router();
const mysql = require('mysql2');
const jwt = require('jsonwebtoken');

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'ums_db'
}).promise(); // Convert to promise-based connection

// Middleware to verify instructor token
const verifyInstructor = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    if (decoded.role !== 'instructor') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

// Offer Course
router.post('/offer-course', verifyInstructor, async (req, res) => {
  const { courseId, semester, year } = req.body;
  const instructorId = req.user.id;
  
  try {
    const query = 'INSERT INTO offered_courses (course_id, instructor_id, semester, year) VALUES (?, ?, ?, ?)';
    await db.query(query, [courseId, instructorId, semester, year]);
    res.status(201).json({ message: 'Course offered successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error offering course' });
  }
});

// Get Instructor's Offered Courses
router.get('/courses', verifyInstructor, async (req, res) => {
  try {
    const query = `
      SELECT oc.*, c.course_name, c.course_code 
      FROM offered_courses oc 
      JOIN courses c ON oc.course_id = c.id 
      WHERE oc.instructor_id = ?
    `;
    
    const [results] = await db.query(query, [req.user.id]);
    res.json(results);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Post Student Marks
router.post('/post-marks', verifyInstructor, async (req, res) => {
  const { offeredCourseId, studentId, activityType, marks, totalMarks } = req.body;
  
  try {
    const query = `
      INSERT INTO student_marks 
      (offered_course_id, student_id, activity_type, marks, total_marks) 
      VALUES (?, ?, ?, ?, ?)
    `;
    
    await db.query(query, [offeredCourseId, studentId, activityType, marks, totalMarks]);
    res.status(201).json({ message: 'Marks posted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error posting marks' });
  }
});

// Get Students in a Course
router.get('/course-students/:offeredCourseId', verifyInstructor, async (req, res) => {
  try {
    const query = `
      SELECT s.student_id, s.name, s.email 
      FROM student_courses sc
      JOIN students s ON sc.student_id = s.id
      WHERE sc.offered_course_id = ?
    `;
    
    const [results] = await db.query(query, [req.params.offeredCourseId]);
    res.json(results);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get instructor statistics
router.get('/stats', verifyInstructor, async (req, res) => {
  try {
    // Get total students enrolled in instructor's courses
    const [totalStudentsResult] = await db.query(`
      SELECT COUNT(DISTINCT sc.student_id) as count
      FROM offered_courses oc
      JOIN student_courses sc ON oc.id = sc.offered_course_id
      WHERE oc.instructor_id = ?
    `, [req.user.id]);

    // Get total courses taught by instructor
    const [totalCoursesResult] = await db.query(`
      SELECT COUNT(*) as count
      FROM offered_courses
      WHERE instructor_id = ?
    `, [req.user.id]);

    // Get average grade across all courses
    const [averageGradeResult] = await db.query(`
      SELECT AVG(sm.marks / sm.total_marks * 100) as average
      FROM student_marks sm
      JOIN offered_courses oc ON sm.offered_course_id = oc.id
      WHERE oc.instructor_id = ?
    `, [req.user.id]);

    res.json({
      totalStudents: totalStudentsResult[0].count || 0,
      totalCourses: totalCoursesResult[0].count || 0,
      averageGrade: averageGradeResult[0].average || 0
    });
  } catch (error) {
    console.error('Error fetching instructor statistics:', error);
    res.status(500).json({ message: 'Error fetching statistics' });
  }
});

module.exports = router; 
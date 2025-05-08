const express = require('express');
const router = express.Router();
const mysql = require('mysql2');

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'ums_db'
});

// Middleware to verify student token
const verifyStudent = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    if (decoded.role !== 'student') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    req.studentId = decoded.id;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

// Get Available Courses
router.get('/available-courses', verifyStudent, (req, res) => {
  const query = `
    SELECT oc.id as offered_course_id, c.course_code, c.course_name, 
           c.credits, i.name as instructor_name, oc.semester, oc.year
    FROM offered_courses oc
    JOIN courses c ON oc.course_id = c.id
    JOIN instructors i ON oc.instructor_id = i.id
    WHERE oc.semester = ? AND oc.year = ?
  `;
  
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth();
  const semester = currentMonth < 6 ? 'Spring' : 'Fall';
  
  db.query(query, [semester, currentYear], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Server error' });
    }
    res.json(results);
  });
});

// Register for Course
router.post('/register-course', verifyStudent, (req, res) => {
  const { offeredCourseId } = req.body;
  const studentId = req.studentId;
  
  const query = 'INSERT INTO student_courses (student_id, offered_course_id) VALUES (?, ?)';
  db.query(query, [studentId, offeredCourseId], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Error registering for course' });
    }
    res.status(201).json({ message: 'Course registration successful' });
  });
});

// Get Student's Enrolled Courses
router.get('/my-courses', verifyStudent, (req, res) => {
  const query = `
    SELECT c.course_code, c.course_name, i.name as instructor_name,
           oc.semester, oc.year
    FROM student_courses sc
    JOIN offered_courses oc ON sc.offered_course_id = oc.id
    JOIN courses c ON oc.course_id = c.id
    JOIN instructors i ON oc.instructor_id = i.id
    WHERE sc.student_id = ?
  `;
  
  db.query(query, [req.studentId], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Server error' });
    }
    res.json(results);
  });
});

// Get Course Marks
router.get('/course-marks/:offeredCourseId', verifyStudent, (req, res) => {
  const query = `
    SELECT activity_type, marks, total_marks
    FROM student_marks
    WHERE student_id = ? AND offered_course_id = ?
  `;
  
  db.query(query, [req.studentId, req.params.offeredCourseId], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Server error' });
    }
    res.json(results);
  });
});

module.exports = router; 
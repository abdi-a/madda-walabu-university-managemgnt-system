const express = require('express');
const router = express.Router();
const { instructorAuthMiddleware } = require('../middleware/auth');

// Apply instructor authentication middleware to all routes
router.use(instructorAuthMiddleware);

// Get instructor statistics
router.get('/stats', async (req, res) => {
  try {
    const db = req.app.locals.db;
    const instructorId = req.user.id;

    // Get total students enrolled in instructor's courses
    const [totalStudentsResult] = await db.promise().query(
      `SELECT COUNT(DISTINCT student_id) as total 
       FROM course_enrollments ce 
       JOIN courses c ON ce.course_id = c.id 
       WHERE c.instructor_id = ?`,
      [instructorId]
    );

    // Get active courses count
    const [activeCoursesResult] = await db.promise().query(
      `SELECT COUNT(*) as total 
       FROM courses 
       WHERE instructor_id = ? AND status = 'active'`,
      [instructorId]
    );

    // Get average grade across all courses
    const [averageGradeResult] = await db.promise().query(
      `SELECT AVG(grade) as average 
       FROM course_enrollments ce 
       JOIN courses c ON ce.course_id = c.id 
       WHERE c.instructor_id = ? AND grade IS NOT NULL`,
      [instructorId]
    );

    const stats = {
      totalStudents: totalStudentsResult[0].total || 0,
      activeCourses: activeCoursesResult[0].total || 0,
      averageGrade: averageGradeResult[0].average || 0
    };
    
    res.json(stats);
  } catch (error) {
    console.error('Error fetching instructor stats:', error);
    res.status(500).json({ message: 'Error fetching instructor statistics' });
  }
});

// Basic instructor routes
router.get('/dashboard', (req, res) => {
  res.json({ message: 'Instructor dashboard' });
});

module.exports = router; 
const express = require('express');
const router = express.Router();
const mysql = require('mysql2');
const jwt = require('jsonwebtoken');

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

// Get Student Statistics
router.get('/stats', verifyStudent, (req, res) => {
  const studentId = req.studentId;
  
  // Get enrolled courses count
  const enrolledCoursesQuery = `
    SELECT COUNT(*) as count
    FROM student_courses
    WHERE student_id = ?
  `;
  
  // Get completed credits
  const completedCreditsQuery = `
    SELECT COALESCE(SUM(c.credits), 0) as total
    FROM student_courses sc
    JOIN offered_courses oc ON sc.offered_course_id = oc.id
    JOIN courses c ON oc.course_id = c.id
    WHERE sc.student_id = ?
  `;
  
  // Get average grade
  const averageGradeQuery = `
    SELECT COALESCE(AVG(sm.marks / sm.total_marks * 100), 0) as average
    FROM student_marks sm
    WHERE sm.student_id = ?
  `;
  
  db.query(enrolledCoursesQuery, [studentId], (err, enrolledResults) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Error fetching enrolled courses count' });
    }
    
    db.query(completedCreditsQuery, [studentId], (err, creditsResults) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: 'Error fetching completed credits' });
      }
      
      db.query(averageGradeQuery, [studentId], (err, gradeResults) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ message: 'Error fetching average grade' });
        }
        
        res.json({
          enrolledCourses: enrolledResults[0].count || 0,
          completedCredits: creditsResults[0].total || 0,
          averageGrade: parseFloat(gradeResults[0].average) || 0
        });
      });
    });
  });
});

// Get Student Academic Progress
router.get('/progress', verifyStudent, (req, res) => {
  const studentId = req.studentId;
  
  // Get completed credits and calculate GPA
  const progressQuery = `
    SELECT 
      COALESCE(SUM(c.credits), 0) as completedCredits,
      COALESCE(AVG(sm.marks / sm.total_marks * 4), 0) as gpa
    FROM student_courses sc
    JOIN offered_courses oc ON sc.offered_course_id = oc.id
    JOIN courses c ON oc.course_id = c.id
    LEFT JOIN student_marks sm ON sc.student_id = sm.student_id 
      AND sc.offered_course_id = sm.offered_course_id
    WHERE sc.student_id = ?
  `;
  
  // Get semester grades for GPA trend
  const semesterGradesQuery = `
    SELECT 
      CONCAT(oc.semester, ' ', oc.year) as semester,
      AVG(sm.marks / sm.total_marks * 4) as gpa,
      (
        SELECT AVG(sm2.marks / sm2.total_marks * 4)
        FROM student_courses sc2
        JOIN offered_courses oc2 ON sc2.offered_course_id = oc2.id
        LEFT JOIN student_marks sm2 ON sc2.student_id = sm2.student_id 
          AND sc2.offered_course_id = sm2.offered_course_id
        WHERE sc2.student_id = ?
          AND (
            (oc2.year < oc.year) OR 
            (oc2.year = oc.year AND 
              CASE 
                WHEN oc.semester = 'Fall' THEN oc2.semester = 'Spring'
                ELSE false
              END
            )
          )
      ) as cumulativeGpa
    FROM student_courses sc
    JOIN offered_courses oc ON sc.offered_course_id = oc.id
    LEFT JOIN student_marks sm ON sc.student_id = sm.student_id 
      AND sc.offered_course_id = sm.offered_course_id
    WHERE sc.student_id = ?
    GROUP BY oc.semester, oc.year
    ORDER BY oc.year, CASE oc.semester WHEN 'Spring' THEN 1 WHEN 'Fall' THEN 2 END
  `;
  
  // Get recent grades
  const recentGradesQuery = `
    SELECT 
      c.course_name as courseName,
      c.course_code as courseCode,
      sm.marks / sm.total_marks * 100 as grade
    FROM student_courses sc
    JOIN offered_courses oc ON sc.offered_course_id = oc.id
    JOIN courses c ON oc.course_id = c.id
    LEFT JOIN student_marks sm ON sc.student_id = sm.student_id 
      AND sc.offered_course_id = sm.offered_course_id
    WHERE sc.student_id = ?
    ORDER BY oc.year DESC, 
      CASE oc.semester 
        WHEN 'Fall' THEN 2 
        WHEN 'Spring' THEN 1 
      END DESC,
      c.course_code
    LIMIT 5
  `;
  
  // Get course progress
  const courseProgressQuery = `
    SELECT 
      c.id,
      c.course_name as name,
      COUNT(DISTINCT a.id) as totalAssignments,
      COUNT(DISTINCT CASE WHEN sm.marks IS NOT NULL THEN a.id END) as completedAssignments,
      AVG(sm.marks / sm.total_marks * 100) as currentGrade
    FROM student_courses sc
    JOIN offered_courses oc ON sc.offered_course_id = oc.id
    JOIN courses c ON oc.course_id = c.id
    LEFT JOIN assignments a ON oc.id = a.offered_course_id
    LEFT JOIN student_marks sm ON sc.student_id = sm.student_id 
      AND a.id = sm.assignment_id
    WHERE sc.student_id = ?
      AND oc.semester = ? 
      AND oc.year = ?
    GROUP BY c.id, c.course_name
  `;
  
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth();
  const semester = currentMonth < 6 ? 'Spring' : 'Fall';

  db.query(progressQuery, [studentId], (err, progressResults) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Error fetching progress' });
    }
    
    db.query(semesterGradesQuery, [studentId, studentId], (err, semesterResults) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: 'Error fetching semester grades' });
      }
      
      db.query(recentGradesQuery, [studentId], (err, recentResults) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ message: 'Error fetching recent grades' });
        }

        db.query(courseProgressQuery, [studentId, semester, currentYear], (err, courseProgressResults) => {
          if (err) {
            console.error(err);
            return res.status(500).json({ message: 'Error fetching course progress' });
          }
          
          res.json({
            gpa: parseFloat(progressResults[0].gpa) || 0,
            completedCredits: progressResults[0].completedCredits || 0,
            totalCredits: 120,
            semesterGrades: semesterResults || [],
            recentGrades: recentResults || [],
            courseProgress: courseProgressResults || []
          });
        });
      });
    });
  });
});

module.exports = router; 
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Paper,
  Grid,
  IconButton,
  AppBar,
  Toolbar,
  Box,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Alert,
  CircularProgress,
  Button,
  Divider
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Add as AddIcon
} from '@mui/icons-material';
import axios from 'axios';

const ViewCourses = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [availableCourses, setAvailableCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      headers: {
        Authorization: `Bearer ${token}`
      }
    };
  };

  useEffect(() => {
    fetchCourses();
    fetchAvailableCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setError('');
      setLoading(true);
      const response = await axios.get(
        'http://localhost:5000/api/student/my-courses',
        getAuthHeaders()
      );
      setCourses(response.data);
    } catch (error) {
      console.error('Error fetching courses:', error);
      setError('Failed to fetch courses. Please try again later.');
      if (error.response?.status === 401) {
        navigate('/');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableCourses = async () => {
    try {
      const response = await axios.get(
        'http://localhost:5000/api/student/available-courses',
        getAuthHeaders()
      );
      setAvailableCourses(response.data);
    } catch (error) {
      console.error('Error fetching available courses:', error);
      setError('Failed to fetch available courses. Please try again later.');
    }
  };

  const handleRegisterCourse = async (offeredCourseId) => {
    try {
      await axios.post(
        'http://localhost:5000/api/student/register-course',
        { offeredCourseId },
        getAuthHeaders()
      );
      // Refresh both lists after successful registration
      fetchCourses();
      fetchAvailableCourses();
    } catch (error) {
      console.error('Error registering for course:', error);
      setError('Failed to register for course. Please try again later.');
    }
  };

  const fetchAssignments = async (courseId) => {
    try {
      setError('');
      const response = await axios.get(
        `http://localhost:5000/api/courses/${courseId}/assignments`,
        getAuthHeaders()
      );
      setAssignments(response.data);
    } catch (error) {
      console.error('Error fetching assignments:', error);
      setError('Failed to fetch assignments. Please try again later.');
      if (error.response?.status === 401) {
        navigate('/');
      }
    }
  };

  const handleCourseSelect = (course) => {
    setSelectedCourse(course);
    fetchAssignments(course.id);
  };

  const getGradeColor = (grade) => {
    if (!grade) return 'default';
    const numGrade = parseFloat(grade);
    if (numGrade >= 90) return 'success';
    if (numGrade >= 70) return 'primary';
    if (numGrade >= 60) return 'warning';
    return 'error';
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh'
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            onClick={() => navigate('/student-dashboard')}
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1, ml: 2 }}>
            My Courses
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg">
        {error && (
          <Alert severity="error" sx={{ mt: 3, mb: 2 }}>
            {error}
          </Alert>
        )}
        
        <Grid container spacing={3} sx={{ mt: 3 }}>
          {/* Enrolled Courses */}
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
              Enrolled Courses
            </Typography>
            <Paper>
              {courses.length === 0 ? (
                <Box sx={{ p: 3, textAlign: 'center' }}>
                  <Typography color="textSecondary">
                    No courses found
                  </Typography>
                </Box>
              ) : (
                courses.map((course) => (
                  <Card 
                    key={course.id}
                    sx={{ 
                      mb: 2, 
                      cursor: 'pointer',
                      bgcolor: selectedCourse?.id === course.id ? 'action.selected' : 'inherit'
                    }}
                    onClick={() => handleCourseSelect(course)}
                  >
                    <CardContent>
                      <Typography variant="h6">{course.course_name}</Typography>
                      <Typography color="textSecondary">
                        Instructor: {course.instructor_name}
                      </Typography>
                      <Typography variant="body2">
                        {course.semester} {course.year}
                      </Typography>
                    </CardContent>
                  </Card>
                ))
              )}
            </Paper>
          </Grid>

          {/* Available Courses */}
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
              Available Courses
            </Typography>
            <Paper>
              {availableCourses.length === 0 ? (
                <Box sx={{ p: 3, textAlign: 'center' }}>
                  <Typography color="textSecondary">
                    No available courses found
                  </Typography>
                </Box>
              ) : (
                availableCourses.map((course) => (
                  <Card key={course.offered_course_id} sx={{ mb: 2 }}>
                    <CardContent>
                      <Typography variant="h6">{course.course_name}</Typography>
                      <Typography color="textSecondary">
                        Code: {course.course_code}
                      </Typography>
                      <Typography variant="body2">
                        Instructor: {course.instructor_name}
                      </Typography>
                      <Typography variant="body2">
                        Credits: {course.credits}
                      </Typography>
                      <Typography variant="body2">
                        {course.semester} {course.year}
                      </Typography>
                      <Box sx={{ mt: 2 }}>
                        <Button
                          variant="contained"
                          startIcon={<AddIcon />}
                          onClick={() => handleRegisterCourse(course.offered_course_id)}
                        >
                          Register
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                ))
              )}
            </Paper>
          </Grid>

          {/* Course Details and Assignments */}
          {selectedCourse && (
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Course Details: {selectedCourse.course_name}
              </Typography>
              <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="body1" gutterBottom>
                  <strong>Course Code:</strong> {selectedCourse.course_code}
                </Typography>
                <Typography variant="body1" gutterBottom>
                  <strong>Instructor:</strong> {selectedCourse.instructor_name}
                </Typography>
                <Typography variant="body1" gutterBottom>
                  <strong>Schedule:</strong> {selectedCourse.semester} {selectedCourse.year}
                </Typography>
              </Paper>

              <Typography variant="h6" gutterBottom>
                Assignments
              </Typography>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Title</TableCell>
                      <TableCell>Due Date</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Grade</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {assignments.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} align="center">
                          No assignments found
                        </TableCell>
                      </TableRow>
                    ) : (
                      assignments.map((assignment) => (
                        <TableRow key={assignment.id}>
                          <TableCell>{assignment.title}</TableCell>
                          <TableCell>{new Date(assignment.dueDate).toLocaleDateString()}</TableCell>
                          <TableCell>
                            {assignment.submitted ? (
                              <Chip 
                                icon={<CheckCircleIcon />} 
                                label="Submitted" 
                                color="success" 
                                size="small" 
                              />
                            ) : (
                              <Chip 
                                icon={<WarningIcon />} 
                                label="Pending" 
                                color="warning" 
                                size="small" 
                              />
                            )}
                          </TableCell>
                          <TableCell>
                            {assignment.grade ? (
                              <Chip 
                                label={assignment.grade}
                                color={getGradeColor(assignment.grade)}
                                size="small"
                              />
                            ) : (
                              'Not graded'
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>
          )}
        </Grid>
      </Container>
    </>
  );
};

export default ViewCourses; 
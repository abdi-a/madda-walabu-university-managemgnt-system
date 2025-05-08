import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Button,
  AppBar,
  Toolbar,
  IconButton,
  Card,
  CardContent,
  CardActions,
  Divider,
  List,
  ListItem,
  ListItemText,
  Chip
} from '@mui/material';
import { Logout as LogoutIcon } from '@mui/icons-material';
import axios from 'axios';

const StudentDashboard = () => {
  const { user, logout } = useAuth();
  const [courses, setCourses] = useState([]);
  const [stats, setStats] = useState({
    enrolledCourses: 0,
    averageGrade: 0,
    completedCredits: 0
  });
  const [assignments, setAssignments] = useState([]);

  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        const token = localStorage.getItem('token');
        const [coursesRes, statsRes, assignmentsRes] = await Promise.all([
          axios.get('http://localhost:5000/api/student/courses', {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get('http://localhost:5000/api/student/stats', {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get('http://localhost:5000/api/student/assignments', {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);
        
        setCourses(coursesRes.data);
        setStats(statsRes.data);
        setAssignments(assignmentsRes.data);
      } catch (error) {
        console.error('Failed to fetch student data:', error);
      }
    };

    fetchStudentData();
  }, []);

  const handleLogout = () => {
    logout();
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Student Dashboard
          </Typography>
          <IconButton color="inherit" onClick={handleLogout}>
            <LogoutIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Grid container spacing={3}>
          {/* Welcome Section */}
          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h5" gutterBottom>
                Welcome, {user?.name || 'Student'}
              </Typography>
            </Paper>
          </Grid>

          {/* Statistics Cards */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 140 }}>
              <Typography variant="h6" gutterBottom>
                Enrolled Courses
              </Typography>
              <Typography variant="h3" component="div">
                {stats.enrolledCourses}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 140 }}>
              <Typography variant="h6" gutterBottom>
                Average Grade
              </Typography>
              <Typography variant="h3" component="div">
                {stats.averageGrade.toFixed(1)}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 140 }}>
              <Typography variant="h6" gutterBottom>
                Completed Credits
              </Typography>
              <Typography variant="h3" component="div">
                {stats.completedCredits}
              </Typography>
            </Paper>
          </Grid>

          {/* Enrolled Courses */}
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                My Courses
              </Typography>
              <Grid container spacing={2}>
                {courses.map((course) => (
                  <Grid item xs={12} key={course.id}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6">{course.name}</Typography>
                        <Typography color="textSecondary" gutterBottom>
                          Instructor: {course.instructor}
                        </Typography>
                        <Divider sx={{ my: 1 }} />
                        <Typography variant="body2">
                          Grade: {course.grade || 'N/A'}
                        </Typography>
                        <Typography variant="body2">
                          Schedule: {course.schedule}
                        </Typography>
                      </CardContent>
                      <CardActions>
                        <Button size="small">View Details</Button>
                        <Button size="small">View Materials</Button>
                      </CardActions>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Paper>
          </Grid>

          {/* Upcoming Assignments */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2, height: '100%' }}>
              <Typography variant="h6" gutterBottom>
                Upcoming Assignments
              </Typography>
              <List>
                {assignments.map((assignment) => (
                  <ListItem key={assignment.id}>
                    <ListItemText
                      primary={assignment.title}
                      secondary={
                        <>
                          <Typography variant="body2" color="textSecondary">
                            Due: {new Date(assignment.dueDate).toLocaleDateString()}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            Course: {assignment.courseName}
                          </Typography>
                        </>
                      }
                    />
                    <Chip
                      label={assignment.status}
                      color={assignment.status === 'Pending' ? 'warning' : 'success'}
                      size="small"
                    />
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Grid>

          {/* Quick Actions */}
          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Quick Actions
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <Button variant="contained" fullWidth>
                    Course Registration
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Button variant="contained" fullWidth>
                    View Schedule
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Button variant="contained" fullWidth>
                    View Transcript
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Button variant="contained" fullWidth>
                    Contact Advisor
                  </Button>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default StudentDashboard; 
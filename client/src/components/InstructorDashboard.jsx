import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Button,
  List,
  ListItem,
  ListItemText,
  AppBar,
  Toolbar,
  IconButton,
  Card,
  CardContent,
  CardActions,
  Divider
} from '@mui/material';
import { Logout as LogoutIcon } from '@mui/icons-material';
import axios from 'axios';

const InstructorDashboard = () => {
  const { user, logout } = useAuth();
  const [courses, setCourses] = useState([]);
  const [stats, setStats] = useState({
    totalStudents: 0,
    activeCourses: 0,
    averageGrade: 0
  });

  useEffect(() => {
    const fetchInstructorData = async () => {
      try {
        const token = localStorage.getItem('token');
        const [coursesRes, statsRes] = await Promise.all([
          axios.get('http://localhost:5000/api/instructor/courses', {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get('http://localhost:5000/api/instructor/stats', {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);
        
        setCourses(coursesRes.data);
        setStats(statsRes.data);
      } catch (error) {
        console.error('Failed to fetch instructor data:', error);
      }
    };

    fetchInstructorData();
  }, []);

  const handleLogout = () => {
    logout();
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Instructor Dashboard
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
                Welcome, {user?.name || 'Instructor'}
              </Typography>
            </Paper>
          </Grid>

          {/* Statistics Cards */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 140 }}>
              <Typography variant="h6" gutterBottom>
                Total Students
              </Typography>
              <Typography variant="h3" component="div">
                {stats.totalStudents}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 140 }}>
              <Typography variant="h6" gutterBottom>
                Active Courses
              </Typography>
              <Typography variant="h3" component="div">
                {stats.activeCourses}
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

          {/* Courses Section */}
          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                My Courses
              </Typography>
              <Grid container spacing={2}>
                {courses.map((course) => (
                  <Grid item xs={12} md={6} key={course.id}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6">{course.name}</Typography>
                        <Typography color="textSecondary" gutterBottom>
                          Course Code: {course.code}
                        </Typography>
                        <Divider sx={{ my: 1 }} />
                        <Typography variant="body2">
                          Students Enrolled: {course.enrolledStudents}
                        </Typography>
                        <Typography variant="body2">
                          Schedule: {course.schedule}
                        </Typography>
                      </CardContent>
                      <CardActions>
                        <Button size="small">View Details</Button>
                        <Button size="small">Manage Grades</Button>
                      </CardActions>
                    </Card>
                  </Grid>
                ))}
              </Grid>
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
                    Create Assignment
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Button variant="contained" fullWidth>
                    Schedule Class
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Button variant="contained" fullWidth>
                    View Attendance
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Button variant="contained" fullWidth>
                    Send Announcement
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

export default InstructorDashboard; 
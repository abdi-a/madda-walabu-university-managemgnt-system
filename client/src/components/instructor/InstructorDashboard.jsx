import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Container,
  Typography,
  Paper,
  Box,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  AppBar,
  Toolbar,
  IconButton
} from '@mui/material';
import {
  Class as ClassIcon,
  Assessment as AssessmentIcon,
  Assignment as AssignmentIcon,
  Logout as LogoutIcon
} from '@mui/icons-material';
import axios from 'axios';

const InstructorDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalCourses: 0,
    averageGrade: 0
  });

  useEffect(() => {
    if (!user || user.role !== 'instructor') {
      navigate('/');
      return;
    }

    fetchStats();
  }, [user, navigate]);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/instructor/stats', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const menuItems = [
    {
      title: 'Manage Courses',
      icon: <ClassIcon sx={{ fontSize: 40 }} />,
      description: 'View and manage your courses, students, and grades',
      action: () => navigate('/instructor/courses')
    },
    {
      title: 'Course Statistics',
      icon: <AssessmentIcon sx={{ fontSize: 40 }} />,
      description: 'View detailed statistics for your courses',
      action: () => navigate('/instructor/statistics')
    },
    {
      title: 'Assignments',
      icon: <AssignmentIcon sx={{ fontSize: 40 }} />,
      description: 'Create and manage course assignments',
      action: () => navigate('/instructor/assignments')
    }
  ];

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Instructor Dashboard
          </Typography>
          <Typography variant="subtitle1" sx={{ mr: 2 }}>
            Welcome, {user?.name}
          </Typography>
          <IconButton color="inherit" onClick={handleLogout}>
            <LogoutIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg">
        <Box sx={{ mt: 4 }}>
          {/* Statistics Summary */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={4}>
              <Paper sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="h6">Total Students</Typography>
                <Typography variant="h4">{stats.totalStudents}</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Paper sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="h6">Active Courses</Typography>
                <Typography variant="h4">{stats.totalCourses}</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Paper sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="h6">Average Grade</Typography>
                <Typography variant="h4">{stats.averageGrade.toFixed(1)}</Typography>
              </Paper>
            </Grid>
          </Grid>

          {/* Menu Items */}
          <Grid container spacing={3}>
            {menuItems.map((item, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardContent sx={{ flexGrow: 1, textAlign: 'center' }}>
                    <Box sx={{ mb: 2, color: 'primary.main' }}>
                      {item.icon}
                    </Box>
                    <Typography variant="h6" gutterBottom>
                      {item.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {item.description}
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button 
                      fullWidth 
                      variant="contained" 
                      onClick={item.action}
                    >
                      Access
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Container>
    </>
  );
};

export default InstructorDashboard; 
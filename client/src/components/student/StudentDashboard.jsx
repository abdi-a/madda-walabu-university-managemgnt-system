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
  MenuBook as MenuBookIcon,
  Assessment as AssessmentIcon,
  Assignment as AssignmentIcon,
  Logout as LogoutIcon
} from '@mui/icons-material';
import axios from 'axios';

const StudentDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    enrolledCourses: 0,
    completedCredits: 0,
    averageGrade: 0
  });

  useEffect(() => {
    if (!user || user.role !== 'student') {
      navigate('/');
      return;
    }

    fetchStats();
  }, [user, navigate]);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/student/stats', {
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
      title: 'My Courses',
      icon: <MenuBookIcon sx={{ fontSize: 40 }} />,
      description: 'View your enrolled courses and grades',
      action: () => navigate('/student/courses')
    },
    {
      title: 'Academic Progress',
      icon: <AssessmentIcon sx={{ fontSize: 40 }} />,
      description: 'Track your academic performance and progress',
      action: () => navigate('/student/progress')
    },
    {
      title: 'Assignments',
      icon: <AssignmentIcon sx={{ fontSize: 40 }} />,
      description: 'View and submit course assignments',
      action: () => navigate('/student/assignments')
    }
  ];

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Student Dashboard
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
                <Typography variant="h6">Enrolled Courses</Typography>
                <Typography variant="h4">{stats.enrolledCourses}</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Paper sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="h6">Completed Credits</Typography>
                <Typography variant="h4">{stats.completedCredits}</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Paper sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="h6">Average Grade</Typography>
                <Typography variant="h4">
                  {typeof stats.averageGrade === 'number' ? stats.averageGrade.toFixed(1) : '0.0'}
                </Typography>
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

export default StudentDashboard; 
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
  People as PeopleIcon,
  School as SchoolIcon,
  Book as BookIcon,
  Assessment as AssessmentIcon,
  ExitToApp as LogoutIcon
} from '@mui/icons-material';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalInstructors: 0,
    totalCourses: 0
  });

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/');
    }
    // TODO: Fetch statistics from backend
  }, [user, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const menuItems = [
    {
      title: 'Manage Students',
      icon: <PeopleIcon sx={{ fontSize: 40 }} />,
      description: 'Add, view, edit, or remove students',
      action: () => navigate('/admin/students')
    },
    {
      title: 'Manage Instructors',
      icon: <SchoolIcon sx={{ fontSize: 40 }} />,
      description: 'Add, view, edit, or remove instructors',
      action: () => navigate('/admin/instructors')
    },
    {
      title: 'Manage Courses',
      icon: <BookIcon sx={{ fontSize: 40 }} />,
      description: 'Add, view, edit, or remove courses',
      action: () => navigate('/admin/courses')
    },
    {
      title: 'System Statistics',
      icon: <AssessmentIcon sx={{ fontSize: 40 }} />,
      description: 'View system statistics and reports',
      action: () => navigate('/admin/statistics')
    }
  ];

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            UMS Admin Dashboard
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
        <Box sx={{ mt: 4, mb: 4 }}>
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
                <Typography variant="h6">Total Instructors</Typography>
                <Typography variant="h4">{stats.totalInstructors}</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Paper sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="h6">Total Courses</Typography>
                <Typography variant="h4">{stats.totalCourses}</Typography>
              </Paper>
            </Grid>
          </Grid>

          {/* Main Menu */}
          <Grid container spacing={3}>
            {menuItems.map((item, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardContent sx={{ flexGrow: 1, textAlign: 'center' }}>
                    {item.icon}
                    <Typography gutterBottom variant="h5" component="h2" sx={{ mt: 2 }}>
                      {item.title}
                    </Typography>
                    <Typography>
                      {item.description}
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button 
                      size="small" 
                      fullWidth 
                      variant="contained"
                      onClick={item.action}
                    >
                      Manage
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

export default AdminDashboard; 
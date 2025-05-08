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
  CircularProgress,
  Alert
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  People as PeopleIcon,
  School as SchoolIcon,
  Book as BookIcon
} from '@mui/icons-material';
import axios from 'axios';

const StatCard = ({ title, value, icon }) => (
  <Paper sx={{ p: 3, textAlign: 'center', height: '100%' }}>
    <Box sx={{ color: 'primary.main', mb: 2 }}>
      {icon}
    </Box>
    <Typography variant="h6" gutterBottom>
      {title}
    </Typography>
    <Typography variant="h3">
      {value}
    </Typography>
  </Paper>
);

const SystemStatistics = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalInstructors: 0,
    totalCourses: 0
  });
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
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/admin/statistics', getAuthHeaders());
      setStats(response.data);
      setError('');
      setLoading(false);
    } catch (error) {
      console.error('Error fetching statistics:', error);
      setError('Failed to fetch statistics. Please try again.');
      setLoading(false);
      if (error.response?.status === 401) {
        navigate('/');
      }
    }
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
            onClick={() => navigate('/admin-dashboard')}
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1, ml: 2 }}>
            System Statistics
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <StatCard
              title="Total Students"
              value={stats.totalStudents}
              icon={<PeopleIcon sx={{ fontSize: 40 }} />}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <StatCard
              title="Total Instructors"
              value={stats.totalInstructors}
              icon={<SchoolIcon sx={{ fontSize: 40 }} />}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <StatCard
              title="Total Courses"
              value={stats.totalCourses}
              icon={<BookIcon sx={{ fontSize: 40 }} />}
            />
          </Grid>
        </Grid>
      </Container>
    </>
  );
};

export default SystemStatistics; 
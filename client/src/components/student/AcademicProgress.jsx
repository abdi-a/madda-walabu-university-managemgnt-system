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
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  School as SchoolIcon,
  Timeline as TimelineIcon,
  Grade as GradeIcon
} from '@mui/icons-material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import axios from 'axios';

const AcademicProgress = () => {
  const navigate = useNavigate();
  const [progress, setProgress] = useState({
    gpa: 0,
    completedCredits: 0,
    totalCredits: 120,
    semesterGrades: [],
    courseProgress: [],
    recentGrades: []
  });

  useEffect(() => {
    fetchProgress();
  }, []);

  const fetchProgress = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/student/progress', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProgress(response.data);
    } catch (error) {
      console.error('Error fetching academic progress:', error);
    }
  };

  const getGradeColor = (grade) => {
    if (!grade) return 'default';
    const numGrade = parseFloat(grade);
    if (numGrade >= 90) return 'success';
    if (numGrade >= 70) return 'primary';
    if (numGrade >= 60) return 'warning';
    return 'error';
  };

  const StatCard = ({ title, value, icon, subtitle }) => (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          {icon}
          <Typography variant="h6" sx={{ ml: 1 }}>
            {title}
          </Typography>
        </Box>
        <Typography variant="h4" sx={{ mb: 1 }}>
          {value}
        </Typography>
        {subtitle && (
          <Typography variant="body2" color="text.secondary">
            {subtitle}
          </Typography>
        )}
      </CardContent>
    </Card>
  );

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
            Academic Progress
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg">
        <Box sx={{ mt: 4, mb: 4 }}>
          {/* Overview Cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={4}>
              <StatCard
                title="Current GPA"
                value={progress.gpa.toFixed(2)}
                icon={<GradeIcon color="primary" />}
                subtitle="Cumulative Grade Point Average"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <StatCard
                title="Credits Completed"
                value={`${progress.completedCredits}/${progress.totalCredits}`}
                icon={<SchoolIcon color="primary" />}
                subtitle="Total Credit Hours"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <TimelineIcon color="primary" />
                    <Typography variant="h6" sx={{ ml: 1 }}>
                      Program Progress
                    </Typography>
                  </Box>
                  <Box sx={{ mb: 1 }}>
                    <LinearProgress 
                      variant="determinate" 
                      value={(progress.completedCredits / progress.totalCredits) * 100} 
                      sx={{ height: 10, borderRadius: 5 }}
                    />
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {((progress.completedCredits / progress.totalCredits) * 100).toFixed(1)}% completed
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* GPA Trend Chart */}
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  GPA Trend
                </Typography>
                <Box sx={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={progress.semesterGrades}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="semester" />
                      <YAxis domain={[0, 4]} />
                      <Tooltip />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="gpa" 
                        stroke="#2196f3" 
                        name="Semester GPA"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="cumulativeGpa" 
                        stroke="#4caf50" 
                        name="Cumulative GPA"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </Box>
              </Paper>
            </Grid>

            {/* Recent Grades */}
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Recent Grades
                </Typography>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Course</TableCell>
                        <TableCell align="right">Grade</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {progress.recentGrades.map((grade) => (
                        <TableRow key={grade.courseId}>
                          <TableCell>{grade.courseName}</TableCell>
                          <TableCell align="right">
                            <Chip
                              label={grade.grade}
                              color={getGradeColor(grade.grade)}
                              size="small"
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            </Grid>

            {/* Course Progress */}
            <Grid item xs={12}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Current Semester Progress
                </Typography>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Course</TableCell>
                        <TableCell>Assignments Completed</TableCell>
                        <TableCell>Current Grade</TableCell>
                        <TableCell>Progress</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {progress.courseProgress.map((course) => (
                        <TableRow key={course.id}>
                          <TableCell>{course.name}</TableCell>
                          <TableCell>
                            {course.completedAssignments}/{course.totalAssignments}
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={course.currentGrade || 'N/A'}
                              color={getGradeColor(course.currentGrade)}
                              size="small"
                            />
                          </TableCell>
                          <TableCell sx={{ width: '30%' }}>
                            <LinearProgress
                              variant="determinate"
                              value={(course.completedAssignments / course.totalAssignments) * 100}
                              sx={{ height: 8, borderRadius: 4 }}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            </Grid>
          </Grid>
        </Box>
      </Container>
    </>
  );
};

export default AcademicProgress; 
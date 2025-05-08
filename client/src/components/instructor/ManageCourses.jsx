import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Paper,
  Grid,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  AppBar,
  Toolbar,
  Box,
  Card,
  CardContent,
  CardActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Grade as GradeIcon
} from '@mui/icons-material';
import axios from 'axios';

const ManageCourses = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [students, setStudents] = useState([]);
  const [openGradeDialog, setOpenGradeDialog] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [gradeValue, setGradeValue] = useState('');

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/instructor/courses', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCourses(response.data);
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  const fetchStudents = async (courseId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:5000/api/instructor/courses/${courseId}/students`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStudents(response.data);
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const handleCourseSelect = (course) => {
    setSelectedCourse(course);
    fetchStudents(course.id);
  };

  const handleOpenGradeDialog = (student) => {
    setSelectedStudent(student);
    setGradeValue(student.grade || '');
    setOpenGradeDialog(true);
  };

  const handleGradeSubmit = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `http://localhost:5000/api/instructor/courses/${selectedCourse.id}/students/${selectedStudent.id}/grade`,
        { grade: gradeValue },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Refresh students list
      fetchStudents(selectedCourse.id);
      setOpenGradeDialog(false);
    } catch (error) {
      console.error('Error updating grade:', error);
    }
  };

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            onClick={() => navigate('/instructor-dashboard')}
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1, ml: 2 }}>
            Manage Courses
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg">
        <Grid container spacing={3} sx={{ mt: 3 }}>
          {/* Courses List */}
          <Grid item xs={12} md={4}>
            <Typography variant="h6" gutterBottom>
              My Courses
            </Typography>
            <Paper>
              {courses.map((course) => (
                <Card 
                  key={course.id}
                  sx={{ mb: 2, cursor: 'pointer', bgcolor: selectedCourse?.id === course.id ? 'action.selected' : 'inherit' }}
                  onClick={() => handleCourseSelect(course)}
                >
                  <CardContent>
                    <Typography variant="h6">{course.name}</Typography>
                    <Typography color="textSecondary">
                      Code: {course.code}
                    </Typography>
                    <Typography variant="body2">
                      Students: {course.enrolledCount}
                    </Typography>
                  </CardContent>
                </Card>
              ))}
            </Paper>
          </Grid>

          {/* Students List */}
          <Grid item xs={12} md={8}>
            {selectedCourse ? (
              <>
                <Typography variant="h6" gutterBottom>
                  Students in {selectedCourse.name}
                </Typography>
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Name</TableCell>
                        <TableCell>Student ID</TableCell>
                        <TableCell>Grade</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {students.map((student) => (
                        <TableRow key={student.id}>
                          <TableCell>{student.name}</TableCell>
                          <TableCell>{student.studentId}</TableCell>
                          <TableCell>{student.grade || 'Not graded'}</TableCell>
                          <TableCell>
                            <IconButton onClick={() => handleOpenGradeDialog(student)}>
                              <GradeIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </>
            ) : (
              <Paper sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="body1">
                  Select a course to view enrolled students
                </Typography>
              </Paper>
            )}
          </Grid>
        </Grid>
      </Container>

      {/* Grade Dialog */}
      <Dialog open={openGradeDialog} onClose={() => setOpenGradeDialog(false)}>
        <DialogTitle>Update Grade</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Grade"
            type="text"
            fullWidth
            value={gradeValue}
            onChange={(e) => setGradeValue(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenGradeDialog(false)}>Cancel</Button>
          <Button onClick={handleGradeSubmit} variant="contained">
            Update
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ManageCourses; 
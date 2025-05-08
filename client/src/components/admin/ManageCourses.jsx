import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  AppBar,
  Toolbar,
  Box
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import axios from 'axios';

const ManageCourses = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [formData, setFormData] = useState({
    courseCode: '',
    courseName: '',
    credits: '',
    department: ''
  });

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/admin/courses', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCourses(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching courses:', error);
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const courseData = {
        course_code: formData.courseCode,
        course_name: formData.courseName,
        credits: parseInt(formData.credits),
        department: formData.department
      };

      if (selectedCourse) {
        await axios.put(
          `http://localhost:5000/api/admin/courses/${selectedCourse.id}`,
          courseData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        await axios.post(
          'http://localhost:5000/api/admin/courses',
          courseData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
      fetchCourses();
      setOpenDialog(false);
    } catch (error) {
      console.error('Error saving course:', error);
    }
  };

  const columns = [
    { field: 'course_code', headerName: 'Course Code', width: 130 },
    { field: 'course_name', headerName: 'Course Name', width: 250 },
    { field: 'credits', headerName: 'Credits', width: 100 },
    { field: 'department', headerName: 'Department', width: 200 },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 150,
      renderCell: (params) => (
        <>
          <IconButton onClick={() => {
            setSelectedCourse(params.row);
            setFormData({
              courseCode: params.row.course_code,
              courseName: params.row.course_name,
              credits: params.row.credits.toString(),
              department: params.row.department
            });
            setOpenDialog(true);
          }}>
            <EditIcon />
          </IconButton>
          <IconButton onClick={() => {
            if (window.confirm('Are you sure you want to delete this course?')) {
              const token = localStorage.getItem('token');
              axios.delete(
                `http://localhost:5000/api/admin/courses/${params.row.id}`,
                { headers: { Authorization: `Bearer ${token}` } }
              )
                .then(() => fetchCourses())
                .catch(error => console.error('Error deleting course:', error));
            }
          }}>
            <DeleteIcon />
          </IconButton>
        </>
      ),
    },
  ];

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
            Manage Courses
          </Typography>
          <Button
            color="inherit"
            startIcon={<AddIcon />}
            onClick={() => {
              setSelectedCourse(null);
              setFormData({
                courseCode: '',
                courseName: '',
                credits: '',
                department: ''
              });
              setOpenDialog(true);
            }}
          >
            Add Course
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg">
        <Box sx={{ mt: 4 }}>
          <Paper sx={{ width: '100%', overflow: 'hidden' }}>
            <DataGrid
              rows={courses}
              columns={columns}
              pageSize={10}
              rowsPerPageOptions={[10]}
              checkboxSelection
              disableSelectionOnClick
              autoHeight
              loading={loading}
            />
          </Paper>
        </Box>
      </Container>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>
          {selectedCourse ? 'Edit Course' : 'Add New Course'}
        </DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Course Code"
              value={formData.courseCode}
              onChange={(e) => setFormData({ ...formData, courseCode: e.target.value })}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Course Name"
              value={formData.courseName}
              onChange={(e) => setFormData({ ...formData, courseName: e.target.value })}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Credits"
              type="number"
              value={formData.credits}
              onChange={(e) => setFormData({ ...formData, credits: e.target.value })}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Department"
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              margin="normal"
              required
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {selectedCourse ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ManageCourses; 
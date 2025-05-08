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
  Box,
  Alert
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import axios from 'axios';

const ManageInstructors = () => {
  const navigate = useNavigate();
  const [instructors, setInstructors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedInstructor, setSelectedInstructor] = useState(null);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    department: ''
  });

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      headers: {
        Authorization: `Bearer ${token}`
      }
    };
  };

  useEffect(() => {
    fetchInstructors();
  }, []);

  const fetchInstructors = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/admin/instructors', getAuthHeaders());
      setInstructors(response.data);
      setError('');
      setLoading(false);
    } catch (error) {
      console.error('Error fetching instructors:', error);
      setError('Failed to fetch instructors. Please try again.');
      setLoading(false);
      if (error.response?.status === 401) {
        navigate('/');
      }
    }
  };

  const handleOpenDialog = (instructor = null) => {
    setError('');
    if (instructor) {
      setFormData({
        name: instructor.name,
        email: instructor.email,
        department: instructor.department
      });
      setSelectedInstructor(instructor);
    } else {
      setFormData({
        name: '',
        email: '',
        department: ''
      });
      setSelectedInstructor(null);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedInstructor(null);
    setFormData({
      name: '',
      email: '',
      department: ''
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      if (selectedInstructor) {
        await axios.put(
          `http://localhost:5000/api/admin/instructors/${selectedInstructor.id}`,
          formData,
          getAuthHeaders()
        );
      } else {
        await axios.post(
          'http://localhost:5000/api/admin/instructors',
          formData,
          getAuthHeaders()
        );
      }
      fetchInstructors();
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving instructor:', error);
      setError(error.response?.data?.message || 'Failed to save instructor. Please try again.');
      if (error.response?.status === 401) {
        navigate('/');
      }
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this instructor?')) {
      try {
        await axios.delete(
          `http://localhost:5000/api/admin/instructors/${id}`,
          getAuthHeaders()
        );
        fetchInstructors();
      } catch (error) {
        console.error('Error deleting instructor:', error);
        setError('Failed to delete instructor. Please try again.');
        if (error.response?.status === 401) {
          navigate('/');
        }
      }
    }
  };

  const columns = [
    { field: 'name', headerName: 'Name', width: 200 },
    { field: 'email', headerName: 'Email', width: 250 },
    { field: 'department', headerName: 'Department', width: 200 },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 150,
      renderCell: (params) => (
        <>
          <IconButton onClick={() => handleOpenDialog(params.row)}>
            <EditIcon />
          </IconButton>
          <IconButton onClick={() => handleDelete(params.row.id)}>
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
            Manage Instructors
          </Typography>
          <Button
            color="inherit"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Add Instructor
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg">
        <Box sx={{ mt: 4 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <Paper sx={{ width: '100%', overflow: 'hidden' }}>
            <DataGrid
              rows={instructors}
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

      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>
          {selectedInstructor ? 'Edit Instructor' : 'Add New Instructor'}
        </DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mt: 2, mb: 1 }}>
              {error}
            </Alert>
          )}
          <Box component="form" sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
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
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {selectedInstructor ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ManageInstructors; 
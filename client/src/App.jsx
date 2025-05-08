import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './components/Login';
import AdminDashboard from './components/admin/AdminDashboard';
import ManageStudents from './components/admin/ManageStudents';
import ManageInstructors from './components/admin/ManageInstructors';
import ManageCourses from './components/admin/ManageCourses';
import SystemStatistics from './components/admin/SystemStatistics';
import InstructorDashboard from './components/instructor/InstructorDashboard';
import InstructorManageCourses from './components/instructor/ManageCourses';
import InstructorStatistics from './components/instructor/CourseStatistics';
import StudentDashboard from './components/student/StudentDashboard';
import StudentViewCourses from './components/student/ViewCourses';
import StudentProgress from './components/student/AcademicProgress';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <div className="App">
        <Routes>
          <Route path="/" element={<Login />} />
          
          {/* Admin Routes */}
          <Route 
            path="/admin-dashboard" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/students" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <ManageStudents />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/instructors" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <ManageInstructors />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/courses" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <ManageCourses />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/statistics" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <SystemStatistics />
              </ProtectedRoute>
            } 
          />
          
          {/* Instructor Routes */}
          <Route 
            path="/instructor-dashboard" 
            element={
              <ProtectedRoute allowedRoles={['instructor']}>
                <InstructorDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/instructor/courses" 
            element={
              <ProtectedRoute allowedRoles={['instructor']}>
                <InstructorManageCourses />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/instructor/statistics" 
            element={
              <ProtectedRoute allowedRoles={['instructor']}>
                <InstructorStatistics />
              </ProtectedRoute>
            } 
          />
          
          {/* Student Routes */}
          <Route 
            path="/student-dashboard" 
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <StudentDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/student/courses" 
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <StudentViewCourses />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/student/progress" 
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <StudentProgress />
              </ProtectedRoute>
            } 
          />

          {/* Catch all route - redirect to login */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </AuthProvider>
  );
}

export default App;
 
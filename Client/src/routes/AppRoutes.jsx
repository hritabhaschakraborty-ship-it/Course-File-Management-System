import React from 'react';
import { Routes, Route, Navigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Login from '../pages/Login';
import AdminDashboard from '../pages/admin/AdminDashboard';
import FacultyDashboard from '../pages/faculty/FacultyDashboard';
import MyCourses from '../pages/faculty/MyCourses';
import CourseWorkspace from '../pages/faculty/CourseWorkspace';
import CourseDocuments from '../pages/faculty/CourseDocuments';
import LessonPlanCalendar from '../pages/faculty/LessonPlanCalendar';
import MarksAssessmentManagement from '../pages/faculty/MarksAssessmentManagement';
import CopoAnalytics from '../pages/faculty/CopoAnalytics';
import StudentAttendanceManagement from '../pages/faculty/StudentAttendanceManagement';
import ConsolidatedDossierPreview from '../pages/faculty/ConsolidatedDossierPreview';
import HODDashboard from '../pages/hod/HODDashboard';
import ReviewerDashboard from '../pages/reviewer/ReviewerDashboard';
import StudentDashboard from '../pages/student/StudentDashboard';
import Notifications from '../pages/Notifications';

const getHomeForRole = (role) => ({
  ADMIN: '/admin',
  FACULTY: '/faculty',
  REVIEWER: '/reviewer',
  HOD: '/hod',
  STUDENT: '/student'
}[role] || '/login');

// Route guard to check user login and role clearance
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f8fafc', color: '#1e293b' }}>Loading Session...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <main
        role="alert"
        style={{ minHeight: '100vh', display: 'grid', placeContent: 'center', textAlign: 'center', padding: '2rem', background: '#f8fafc', color: '#0f172a' }}
      >
        <h1>Access denied</h1>
        <p>You do not have permission to view this page.</p>
        <Link to={getHomeForRole(user.role)}>Return to your workspace</Link>
      </main>
    );
  }

  return children;
};

// Route guard to redirect already logged in users away from login page
const AnonymousRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f8fafc', color: '#1e293b' }}>Loading Session...</div>;
  }

  if (user) {
    return <Navigate to={getHomeForRole(user.role)} replace />;
  }

  return children;
};

const AppRoutes = () => {
  const { user } = useAuth();
  
  return (
    <Routes>
      {/* Login Route */}
      <Route path="/login" element={
        <AnonymousRoute>
          <Login />
        </AnonymousRoute>
      } />

      <Route path="/notifications" element={
        <ProtectedRoute allowedRoles={['ADMIN', 'FACULTY', 'REVIEWER', 'HOD', 'STUDENT']}>
          <Notifications />
        </ProtectedRoute>
      } />

      <Route path="/student" element={
        <ProtectedRoute allowedRoles={['STUDENT']}>
          <StudentDashboard />
        </ProtectedRoute>
      } />

      {/* Admin Protected Routes */}
      <Route path="/admin" element={
        <ProtectedRoute allowedRoles={['ADMIN']}>
          <AdminDashboard />
        </ProtectedRoute>
      } />

      {/* Faculty Protected Routes */}
      <Route path="/faculty" element={
        <ProtectedRoute allowedRoles={['FACULTY']}>
          <FacultyDashboard />
        </ProtectedRoute>
      } />

      <Route path="/faculty/courses" element={
        <ProtectedRoute allowedRoles={['FACULTY']}>
          <MyCourses />
        </ProtectedRoute>
      } />
      
      <Route path="/faculty/course/:id" element={
        <ProtectedRoute allowedRoles={['FACULTY']}>
          <CourseWorkspace />
        </ProtectedRoute>
      } />

      <Route path="/faculty/course/:id/documents" element={
        <ProtectedRoute allowedRoles={['FACULTY']}>
          <CourseDocuments />
        </ProtectedRoute>
      } />

      <Route path="/faculty/course/:id/lesson-plan" element={
        <ProtectedRoute allowedRoles={['FACULTY']}>
          <LessonPlanCalendar />
        </ProtectedRoute>
      } />

      <Route path="/faculty/course/:id/assessments" element={
        <ProtectedRoute allowedRoles={['FACULTY']}>
          <MarksAssessmentManagement />
        </ProtectedRoute>
      } />

      <Route path="/faculty/course/:id/copo" element={
        <ProtectedRoute allowedRoles={['FACULTY']}>
          <CopoAnalytics />
        </ProtectedRoute>
      } />

      <Route path="/faculty/course/:id/attendance" element={
        <ProtectedRoute allowedRoles={['FACULTY']}>
          <StudentAttendanceManagement />
        </ProtectedRoute>
      } />

      <Route path="/faculty/course/:id/preview" element={
        <ProtectedRoute allowedRoles={['FACULTY', 'REVIEWER', 'HOD', 'ADMIN']}>
          <ConsolidatedDossierPreview />
        </ProtectedRoute>
      } />

      {/* HOD Protected Routes */}
      <Route path="/hod" element={
        <ProtectedRoute allowedRoles={['HOD']}>
          <HODDashboard />
        </ProtectedRoute>
      } />

      <Route path="/hod/review/:id" element={
        <ProtectedRoute allowedRoles={['HOD']}>
          <ReviewerDashboard />
        </ProtectedRoute>
      } />

      {/* Reviewer Protected Routes */}
      <Route path="/reviewer" element={
        <ProtectedRoute allowedRoles={['REVIEWER']}>
          <ReviewerDashboard />
        </ProtectedRoute>
      } />

      {/* Default Catch-all */}
      <Route path="*" element={
        <Navigate to={user ? getHomeForRole(user.role) : '/login'} replace />
      } />
    </Routes>
  );
};

export default AppRoutes;

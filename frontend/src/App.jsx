import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './login_page/LoginPage'; 
import AdminLogin from './admin_pages/AdminLogin';
import StudentDashboard from './student_pages/StudentDashboard';
import WelcomePage from './login_page/WelcomePage';
import UserContact from './contact_page/UserContact';
import CoursesPage from './courses_page/CoursesPage';
import IndividualCourseView from './courses_page/IndividualCourseView';
import AdminDashboard from './admin_pages/AdminDashboard.jsx';
import AssignmentPage from './admin_pages/assignmentpage.jsx';
import ProtectedRoute from './components/ProtectedRoute';
import AdminProtectedRoute from './components/AdminProtectedRoute';

function App() {
  return (
    <Router>
      <Routes>

        <Route path="/" element={<WelcomePage />} />
        {/* Redirect empty root url '/' directly to login */}
        <Route path="/" element={<Navigate to="/login" replace />} />


        {/*User Contact*/}
        <Route path="/contact" element={<UserContact />} />

        {/*Courses*/}
        <Route path="/courses" element={<CoursesPage />} />
<Route path="/course-view/:courseId" element={<IndividualCourseView />} />


        {/* Both authentication paths load the unified LoginPage parent container */}
        <Route path="/signup" element={<LoginPage initialView="signup" />} />
        <Route path="/login" element={<LoginPage initialView="login" />} /> 

        {/* Administration and Student Routing Modules */}
        <Route path="/admin" element={<AdminLogin />} />
       
       <Route
  path="/dashboard"
  element={
    <ProtectedRoute>
      <StudentDashboard />
    </ProtectedRoute>
  }
/>

  <Route
  path="/admin-dashboard"
  element={
    <AdminProtectedRoute>
      <AdminDashboard />
    </AdminProtectedRoute>
  }
/>

<Route path="/admin-assignments" element={<AssignmentPage />} />
      </Routes>
    </Router>
  );
}

export default App;
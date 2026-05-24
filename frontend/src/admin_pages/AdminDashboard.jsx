import React, { useState, useEffect } from 'react';

// Material UI Components
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton'; 
import MenuIcon from '@mui/icons-material/Menu'; 

// Components
import Sidebar from './Sidebar.jsx';
import AdminCourses from './AdminCourses.jsx';
import CourseAnalytics from './CourseAnalytics';
import AssignmentPage from './assignmentpage.jsx';
import LearnerSatisfaction from './Learnersatisfaction.jsx';
import AnnouncementPage from './AnnouncementPage.jsx';
import NotesPage from './notesPage.jsx';
import AdminQueriesPage from './AdminQueriesPage.jsx';
import AdminSetting from './adminsetting.jsx';
import AdminOverview from './AdminOverview.jsx';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('Overview');
  const [adminId, setAdminId] = useState(null);
  const [adminName, setAdminName] = useState('Administrator');
  const [mobileOpen, setMobileOpen] = useState(false); 

  useEffect(() => {
    // ✅ Check BOTH 'admin' and 'user' keys to ensure compatibility with your login sessions
    const storedAdmin = localStorage.getItem('admin') || localStorage.getItem('user');
    
    if (storedAdmin) {
      try {
        const parsedAdmin = JSON.parse(storedAdmin);
        
        // Match username formats
        if (parsedAdmin?.username || parsedAdmin?.name) {
          setAdminName(parsedAdmin.username || parsedAdmin.name);
        }
        
        // ✅ Grab the ID properly so the settings check doesn't fail
        if (parsedAdmin?.id || parsedAdmin?._id || parsedAdmin?.userId) {
          setAdminId(parsedAdmin.id || parsedAdmin._id || parsedAdmin.userId);
        }
      } catch (error) {
        console.error("Error parsing admin data from localStorage:", error);
      }
    }
  }, []);

  /* =========================================
      RENDER PAGES DYNAMICALLY
     ========================================= */
  const renderPage = () => {
    if (activeTab === 'Courses') {
      return <AdminCourses />;
    }

    if (activeTab === 'Course Analytics') {
      return <CourseAnalytics />;
    }

    if (activeTab === 'Assignments') {
      return <AssignmentPage />;
    }

    if (activeTab === 'Learner Satisfaction') {
      return <LearnerSatisfaction />;
    }

    if (activeTab === 'Announcement') {
      return <AnnouncementPage />;
    }

    if (activeTab === 'Notes') {
      return <NotesPage />;
    }

    if (activeTab === 'Queries') { 
      return <AdminQueriesPage />;
    }

    // ✅ Clean route match evaluation block
    if (activeTab === 'Setting') { 
      return <AdminSetting userId={adminId} />;
    }

    if (activeTab === 'Overview') {
  return <AdminOverview />;
}

    if (activeTab === 'Overview') {
      return (
        <Box>
          <Typography
            variant="h4"
            sx={{
              fontWeight: '800',
              color: '#1e293b',
              marginBottom: '1rem'
            }}
          >
            Admin Overview
          </Typography>

          <Typography
            sx={{
              color: '#64748b'
            }}
          >
            Welcome to Eduvantaa Admin Panel.
          </Typography>
        </Box>
      );
    }

    return (
      <Typography
        sx={{
          fontWeight: '700',
          color: '#64748b'
        }}
      >
        {activeTab} Page Coming Soon
      </Typography>
    );
  };

  return (
    <Box
      sx={{
        display: 'flex',
        minHeight: '100vh',
        background: '#f8fafc'
      }}
    >
      {/* SIDEBAR SYSTEM */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        adminName={adminName}
        mobileOpen={mobileOpen} 
        setMobileOpen={setMobileOpen} 
      />

      {/* MAIN CONTAINER LAYOUT */}
      <Box
        component="main"
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          height: '100vh',
          overflow: 'hidden'
        }}
      >
        {/* FIXED MOBILE TOP BAR */}
        <Box 
          sx={{ 
            display: { xs: 'flex', md: 'none' }, 
            alignItems: 'center', 
            padding: '1rem 1.5rem',
            background: '#ffffff',
            borderBottom: '1px solid #e2e8f0',
            gap: '0.5rem',
            zIndex: 10
          }}
        >
          <IconButton
            color="inherit"
            edge="start"
            onClick={() => setMobileOpen(true)}
            sx={{ color: '#1e293b' }}
          >
            <MenuIcon />
          </IconButton>
          
          <Typography variant="h6" sx={{ fontWeight: '800', color: '#1e293b' }}>
            Eduvantaa<Box component="span" sx={{ color: '#58a533' }}>.</Box>
          </Typography>
        </Box>

        {/* PAGE CONTENT WRAPPER */}
        <Box
          sx={{
            flex: 1,
            overflowY: 'auto',
            padding: { xs: '1.5rem', md: '3rem' }
          }}
        >
          {/* BREADCRUMB INDICATOR */}
          <Typography
            sx={{
              marginBottom: '2rem',
              color: '#64748b',
              fontSize: '0.9rem'
            }}
          >
            Pages /
            <Box
              component="span"
              sx={{
                color: '#3B592D',
                fontWeight: '700',
                marginLeft: '5px'
              }}
            >
              {activeTab}
            </Box>
          </Typography>

          {/* This renders whichever active page component matches the tab selection */}
          {renderPage()}
        </Box>

      </Box>
    </Box>
  );
};

export default AdminDashboard;
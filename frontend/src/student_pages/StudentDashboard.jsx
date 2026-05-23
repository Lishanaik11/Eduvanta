import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Material UI Core Layout Components
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import CircularProgress from '@mui/material/CircularProgress';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';

// Material UI Vector Icons
import DashboardIcon from '@mui/icons-material/Dashboard';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import BorderColorIcon from '@mui/icons-material/BorderColor';
import AssignmentIcon from '@mui/icons-material/Assignment';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import DownloadIcon from '@mui/icons-material/Download';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import AssignmentLateIcon from '@mui/icons-material/AssignmentLate';
import CampaignIcon from '@mui/icons-material/Campaign';
import ContactSupportIcon from '@mui/icons-material/ContactSupport';
import RateReviewRoundedIcon from '@mui/icons-material/RateReviewRounded';
import MenuIcon from '@mui/icons-material/Menu';

// Sub-page Dashboard View Modules
import CoursesPage from '../courses_page/CoursesPage.jsx'; 
import DownloadsPage from '../courses_page/DownloadsPage.jsx'; 
import Assigmentpage from '../courses_page/Assigmentpage.jsx';
import Setting from './setting.jsx';
import CertificatePage from '../courses_page/certificatePage.jsx';
import ContactPage from './contactpage.jsx';
import FeedbackPage from '../courses_page/FeedbackPage.jsx';
import StudentAnnouncementPage from '../courses_page/AnnouncementPage.jsx';

const StudentDashboard = () => {
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [hasUnreadAnnouncements, setHasUnreadAnnouncements] = useState(false);
  const [studentName, setStudentName] = useState('Student');
  const [currentUserId, setCurrentUserId] = useState(null);
  const [latestAnnouncementTimestamp, setLatestAnnouncementTimestamp] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);
  
  // Dashboard Metrics State Realignment
  const [metrics, setMetrics] = useState({ enrolledCourses: 0, pendingAssignments: 0 });
  const [loadingMetrics, setLoadingMetrics] = useState(true);

  const navigate = useNavigate();
  const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  const sidebarWidth = 280;

  /* =====================================================
     CHECK NEW ANNOUNCEMENTS
  ===================================================== */
  useEffect(() => {
    const checkAnnouncements = async () => {
      try {
        const response = await fetch(`${backendUrl}/api/announcements/all`);
        const data = await response.json();

        if (response.ok && data.success && data.announcements.length > 0) {
          // Latest announcement timestamp
          const latestAnnouncementTime = data.announcements[0].updated_at || data.announcements[0].created_at;
          setLatestAnnouncementTimestamp(latestAnnouncementTime);

          // Last seen timestamp
          const lastSeen = localStorage.getItem('lastSeenAnnouncement');

          // If new announcement exists
          if (!lastSeen || new Date(latestAnnouncementTime) > new Date(lastSeen)) {
            setHasUnreadAnnouncements(true);
          } else {
            setHasUnreadAnnouncements(false);
          }
        }
      } catch (error) {
        console.error('Announcement check failed:', error);
      }
    };

    checkAnnouncements();
  }, [backendUrl]);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    console.log("LOCAL STORAGE USER:", storedUser);

    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        console.log("PARSED USER:", parsed);

        if (parsed) {
          if (parsed.name) setStudentName(parsed.name);
          if (parsed.id) {
            setCurrentUserId(parsed.id);
            console.log("CURRENT USER UUID:", parsed.id);
          }
        }
      } catch (e) {
        console.error("Failed to parse user session info:", e);
      }
    }
  }, []);

  // Fetch performance indicators once validation parameters map hooks run safely
  useEffect(() => {
    const fetchDashboardMetrics = async () => {
      if (!currentUserId) return;
      try {
        setLoadingMetrics(true);
        const response = await fetch(`${backendUrl}/api/dashboard/metrics/${currentUserId}`);

        if (!response.ok) {
          const text = await response.text();
          console.error("Backend error response:", text);
          return;
        }

        const data = await response.json();
        if (response.ok && data.success) {
          setMetrics(data.metrics);
        }
      } catch (err) {
        console.error("Failed to call backend structural metrics metrics:", err);
      } finally {
        setLoadingMetrics(false);
      }
    };

    if (activeTab === 'Dashboard') {
      fetchDashboardMetrics();
    }
  }, [currentUserId, activeTab, backendUrl]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    alert("Logged out successfully.");
    navigate('/login');
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const menuItems = [
    { name: 'Dashboard', icon: <DashboardIcon sx={{ fontSize: '1.4rem' }} /> },
    { name: 'Courses', icon: <MenuBookIcon sx={{ fontSize: '1.4rem' }} /> },
    { name: 'Enrolled Courses', icon: <BorderColorIcon sx={{ fontSize: '1.4rem' }} /> },
    { name: 'Assignments', icon: <AssignmentIcon sx={{ fontSize: '1.4rem' }} /> },
    { name: 'Notes', icon: <LibraryBooksIcon sx={{ fontSize: '1.4rem' }} /> },
    { name: 'Downloads', icon: <DownloadIcon sx={{ fontSize: '1.4rem' }} /> },
    { name: 'Announcements', icon: <CampaignIcon sx={{ fontSize: '1.4rem' }} /> },
    { name: 'Certificates', icon: <WorkspacePremiumIcon sx={{ fontSize: '1.4rem' }} /> },
    { name: 'Feedback', icon: <RateReviewRoundedIcon sx={{ fontSize: '1.4rem' }} /> },
    { name: 'Contact', icon: <ContactSupportIcon sx={{ fontSize: '1.4rem' }} /> },
    { name: 'Setting', icon: <SettingsIcon sx={{ fontSize: '1.4rem' }} /> }
  ];

  const renderViewportSubView = () => {
    if (activeTab === 'Courses') {
      return <CoursesPage viewMode="all" userId={currentUserId} />;
    }
    
    if (activeTab === 'Enrolled Courses') {
      return <CoursesPage viewMode="enrolled" userId={currentUserId} />;
    }

    if (activeTab === 'Assignments') {
      return <Assigmentpage userId={currentUserId} />;
    }

    if (activeTab === 'Notes') {
      return <CoursesPage viewMode="notes" userId={currentUserId} />;
    }

    if (activeTab === 'Downloads') {
      return <DownloadsPage userId={currentUserId} />;
    }

    if (activeTab === 'Setting') {
      return <Setting userId={currentUserId} />;
    }

    if (activeTab === 'Contact') {
      return <ContactPage />;
    }

    if (activeTab === 'Feedback') {
      return <FeedbackPage userId={currentUserId} />;
    }

    if (activeTab === 'Announcements') {
      return <StudentAnnouncementPage />;
    }

    if (activeTab === 'Certificates') {
      return <CertificatePage userId={currentUserId} />;
    }
    
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
        {/* Welcome Section */}
        <Box>
          <Typography variant="h4" sx={{ fontWeight: '800', color: '#1e293b', fontSize: '2.2rem', marginBottom: '0.25rem' }}>
            Hello, {studentName}
          </Typography>
          <Typography sx={{ color: '#64748b', fontSize: '1rem', fontWeight: '500' }}>
            Welcome back to your workspace layout overview environment.
          </Typography>
        </Box>

        {/* Dashboard Performance Data Metric Cards Layout */}
        <Grid container spacing={4}>
          {/* Card 1: Enrolled Modules Metric Tracker */}
          <Grid item xs={12} sm={6} md={4}>
            <Paper
              elevation={0}
              onClick={() => setActiveTab('Enrolled Courses')}
              sx={{
                padding: '2rem',
                background: '#ffffff',
                borderRadius: '16px',
                border: '1px solid #e2e8f0',
                display: 'flex',
                flexDirection: 'column',
                gap: '1.25rem',
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.01)',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 12px 20px -8px rgba(59, 89, 45, 0.12)',
                  borderColor: '#3B592D'
                }
              }}
            >
              {/* Header Row: Enrolled Courses Text ---- Icon */}
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', gap: '1.5rem', width: '100%' }}>
                <Typography sx={{ color: '#64748b', fontSize: '0.85rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>
                  Enrolled Courses
                </Typography>
                <Box sx={{ background: '#eef6f0', width: '36px', height: '36px', borderRadius: '10px', border: '1px solid #dbebe0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <WorkspacePremiumIcon sx={{ color: '#3B592D', fontSize: '1.25rem' }} />
                </Box>
              </Box>
              {/* Metric Number Content */}
              <Box>
                {loadingMetrics ? (
                  <CircularProgress size={24} sx={{ color: '#3B592D' }} />
                ) : (
                  <Typography variant="h3" sx={{ fontWeight: '800', color: '#1e293b', fontSize: '2.5rem', lineHeight: 1 }}>
                    {metrics.enrolledCourses}
                  </Typography>
                )}
              </Box>
            </Paper>
          </Grid>

          {/* Card 2: Outlined Unsubmitted Assignments Tracker */}
          <Grid item xs={12} sm={6} md={4}>
            <Paper
              elevation={0}
              onClick={() => setActiveTab('Assignments')}
              sx={{
                padding: '2rem',
                background: '#ffffff',
                borderRadius: '16px',
                border: '1px solid #e2e8f0',
                display: 'flex',
                flexDirection: 'column',
                gap: '1.25rem',
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.01)',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 12px 20px -8px rgba(239, 68, 68, 0.12)',
                  borderColor: '#ef4444'
                }
              }}
            >
              {/* Header Row: Pending Assignments Text ---- Icon */}
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', gap: '1.5rem', width: '100%' }}>
                <Typography sx={{ color: '#64748b', fontSize: '0.85rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>
                  Pending Assignments
                </Typography>
                <Box sx={{ background: '#fff5f5', width: '36px', height: '36px', borderRadius: '10px', border: '1px solid #fca5a5', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <AssignmentLateIcon sx={{ color: '#ef4444', fontSize: '1.25rem' }} />
                </Box>
              </Box>

              {/* Metric Number Content */}
              <Box>
                {loadingMetrics ? (
                  <CircularProgress size={24} sx={{ color: '#ef4444' }} />
                ) : (
                  <Typography variant="h3" sx={{ fontWeight: '800', color: '#1e293b', fontSize: '2.5rem', lineHeight: 1 }}>
                    {metrics.pendingAssignments}
                  </Typography>
                )}
              </Box>
            </Paper>
          </Grid>
        </Grid>

        {/* Informative Module Summary Row */}
        <Paper 
          elevation={0}
          sx={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            padding: '2.5rem',
            borderRadius: '16px',
            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)'
          }}
        >
          <Typography variant="h5" sx={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '0.5rem', color: '#1e293b' }}>
            System Core Updates
          </Typography>
          <Typography sx={{ color: '#64748b', lineHeight: '1.6', fontSize: '0.95rem' }}>
            Your dashboard modules display tracking info derived directly from your ongoing course registrations and assignment submissions. Click on either metrics card above to jump straight into action items.
          </Typography>
        </Paper>
      </Box>
    );
  };

  // Reusable Sidebar Content Internal Component
  const sidebarContent = (
    <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%', padding: '2.5rem 1.5rem' }}>
      <Box>
        <Typography sx={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '2.5rem', paddingLeft: '1rem', color: '#1e293b' }}>
          Eduvantaa<Box component="span" sx={{ color: '#58a533' }}>.</Box> 
        </Typography>
        
        <Box component="nav" sx={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {menuItems.map((item) => {
            const isSelected = activeTab === item.name;
            return (
              <Box
                key={item.name}
                onClick={() => {
                  setActiveTab(item.name);
                  setMobileOpen(false); // Auto-close drawer on mobile link clicks

                  // Mark announcements as read
                  if (item.name === 'Announcements') {
                    setHasUnreadAnnouncements(false);
                    localStorage.setItem('lastSeenAnnouncement', latestAnnouncementTimestamp);
                  }
                }}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  padding: '0.85rem 1.25rem',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '0.95rem',
                  transition: 'all 0.2s ease',
                  background: isSelected ? '#3B592D' : 'transparent',
                  color: isSelected ? '#ffffff' : '#64748b',
                  '&:hover': {
                    background: isSelected ? '#3B592D' : '#f1f5f9',
                    color: isSelected ? '#ffffff' : '#1e293b'
                  }
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', color: isSelected ? '#ffffff' : '#94a3b8' }}>
                  {item.icon}
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {item.name}

                  {item.name === 'Announcements' && hasUnreadAnnouncements && (
                    <Box
                      sx={{
                        width: '10px',
                        height: '10px',
                        borderRadius: '50%',
                        background: '#ef4444',
                        animation: 'pulse 1s infinite',
                        '@keyframes pulse': {
                          '0%': { transform: 'scale(1)', opacity: 1 },
                          '50%': { transform: 'scale(1.4)', opacity: 0.5 },
                          '100%': { transform: 'scale(1)', opacity: 1 }
                        }
                      }}
                    />
                  )}
                </Box>
              </Box>
            );
          })}
        </Box>
      </Box>

      {/* PROFILE CARD & LOGOUT */}
      <Box sx={{ borderTop: '1px solid #e2e8f0', paddingTop: '1.5rem' }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', marginBottom: '1.25rem', paddingLeft: '0.5rem' }}>
          <Typography component="span" sx={{ fontWeight: '700', fontSize: '1.05rem', color: '#1e293b' }}>
            {studentName}
          </Typography>
          <Typography component="span" sx={{ fontSize: '0.8rem', color: '#64748b' }}>
            Student Dashboard Account
          </Typography>
        </Box>
        
        <Button 
          onClick={handleLogout}
          fullWidth
          variant="outlined"
          startIcon={<LogoutIcon />}
          sx={{
            background: '#fef2f2',
            color: '#ef4444',
            borderColor: '#fca5a5',
            padding: '0.75rem',
            borderRadius: '8px',
            fontWeight: '600',
            textTransform: 'none',
            '&:hover': {
              background: '#fee2e2',
              borderColor: '#ef4444'
            }
          }}
        >
          Logout Account
        </Button>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', background: '#f8fafc', color: '#0f172a', fontFamily: "'Poppins', sans-serif" }}>
      
      {/* MOBILE DRAWERS COMPONENT */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }} // Better open performance on mobile devices
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: sidebarWidth, borderRight: '1px solid #e2e8f0', background: '#ffffff' },
        }}
      >
        {sidebarContent}
      </Drawer>

      {/* DESKTOP PERMANENT SIDEBAR */}
      <Box 
        component="aside" 
        sx={{ 
          width: sidebarWidth, 
          background: '#ffffff', 
          borderRight: '1px solid #e2e8f0', 
          display: { xs: 'none', md: 'block' },
          flexShrink: 0
        }}
      >
        {sidebarContent}
      </Box>

      {/* VIEWPORT CONTROLLER */}
      <Box 
        component="main" 
        sx={{ 
          flexGrow: 1, 
          padding: { xs: '2rem 1.5rem', sm: '3rem 4rem' }, 
          overflowY: 'auto', 
          maxHeight: '100vh',
          width: { md: `calc(100% - ${sidebarWidth}px)` }
        }}
      >
        {/* Mobile Header Bar containing Menu Trigger Toggle Button */}
        <Box sx={{ display: { xs: 'flex', md: 'none' }, alignItems: 'center', marginBottom: '1.5rem' }}>
          <IconButton
            color="inherit"
            aria-label="open sidebar"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, color: '#1e293b' }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" sx={{ fontWeight: '800', color: '#1e293b' }}>
            Eduvantaa<Box component="span" sx={{ color: '#58a533' }}>.</Box>
          </Typography>
        </Box>

        <Typography sx={{ marginBottom: '2rem', fontSize: '0.875rem', color: '#64748b' }}>
          Pages / <Box component="span" sx={{ color: '#3B592D', fontWeight: '500' }}>{activeTab}</Box>
        </Typography>
        
        {renderViewportSubView()}
      </Box>
    </Box>
  );
};

export default StudentDashboard;
import React from 'react';
import { useNavigate } from 'react-router-dom';

// Material UI Components
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Drawer from '@mui/material/Drawer'; 

// Icons
import DashboardIcon from '@mui/icons-material/Dashboard';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import AssignmentIcon from '@mui/icons-material/Assignment';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import CampaignIcon from '@mui/icons-material/Campaign';
import ContactSupportIcon from '@mui/icons-material/ContactSupport';
import SentimentSatisfiedAltIcon from '@mui/icons-material/SentimentSatisfiedAlt';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';


const Sidebar = ({
  activeTab,
  setActiveTab,
  adminName = 'Administrator',
  mobileOpen = false, 
  setMobileOpen 
}) => {

  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('admin');

    alert('Admin logged out successfully.');

    navigate('/admin-login');
  };

  const menuItems = [
    {
      name: 'Overview',
      icon: <DashboardIcon sx={{ fontSize: '1.4rem' }} />
    },
    {
      name: 'Courses',
      icon: <MenuBookIcon sx={{ fontSize: '1.4rem' }} />
    },
    {
      name: 'Course Analytics',
      icon: <AnalyticsIcon sx={{ fontSize: '1.4rem' }} />
    },
    {
      name: 'Assignments',
      icon: <AssignmentIcon sx={{ fontSize: '1.4rem' }} />
    },
    {
      name: 'Notes',
      icon: <LibraryBooksIcon sx={{ fontSize: '1.4rem' }} />
    },
    {
      name: 'Announcement',
      icon: <CampaignIcon sx={{ fontSize: '1.4rem' }} />
    },
    {
      name: 'Queries',
      icon: <ContactSupportIcon sx={{ fontSize: '1.4rem' }} />
    },
    {
      name: 'Learner Satisfaction',
      icon: <SentimentSatisfiedAltIcon sx={{ fontSize: '1.4rem' }} />
    },
    {
      name: 'Setting',
      icon: <SettingsIcon sx={{ fontSize: '1.4rem' }} />
    }
  ];

  const sidebarInnerContent = (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        height: '100%',
        padding: '2.5rem 1.5rem',
        background: '#ffffff'
      }}
    >
      {/* TOP SECTION */}
      <Box>

        {/* LOGO */}
        <Typography
          sx={{
            fontSize: '1.6rem',
            fontWeight: '800',
            marginBottom: '2.5rem',
            paddingLeft: '1rem',
            color: '#1e293b'
          }}
        >
          Eduvantaa
          <Box
            component="span"
            sx={{
              color: '#58a533'
            }}
          >
            .
          </Box>
        </Typography>

        {/* NAVIGATION */}
        <Box
          component="nav"
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem'
          }}
        >
          {menuItems.map((item) => {

            const isSelected = activeTab === item.name;

            return (
              <Box
                key={item.name}
                onClick={() => {
                  setActiveTab(item.name);
                  if (setMobileOpen) setMobileOpen(false); 
                }}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  padding: '0.9rem 1.25rem',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '0.95rem',
                  transition: 'all 0.25s ease',
                  background: isSelected
                    ? '#3B592D'
                    : 'transparent',

                  color: isSelected
                    ? '#ffffff'
                    : '#64748b',

                  '&:hover': {
                    background: isSelected
                      ? '#3B592D'
                      : '#f1f5f9',

                    color: isSelected
                      ? '#ffffff'
                      : '#1e293b'
                  }
                }}
              >

                {/* ICON */}
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    color: isSelected
                      ? '#ffffff'
                      : '#94a3b8'
                  }}
                >
                  {item.icon}
                </Box>

                {/* TEXT */}
                {item.name}

              </Box>
            );
          })}
        </Box>
      </Box>

      {/* BOTTOM PROFILE SECTION */}
      <Box
        sx={{
          borderTop: '1px solid #e2e8f0',
          paddingTop: '1.5rem'
        }}
      >

        {/* ADMIN INFO */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.25rem',
            marginBottom: '1.25rem',
            paddingLeft: '0.5rem'
          }}
        >

          <Typography
            component="span"
            sx={{
              fontWeight: '700',
              fontSize: '1.05rem',
              color: '#1e293b'
            }}
          >
            {adminName}
          </Typography>

          <Typography
            component="span"
            sx={{
              fontSize: '0.8rem',
              color: '#64748b'
            }}
          >
            Admin Dashboard
          </Typography>

        </Box>

        {/* LOGOUT BUTTON */}
        <Button
          fullWidth
          variant="outlined"
          startIcon={<LogoutIcon />}
          onClick={handleLogout}
          sx={{
            background: '#fef2f2',
            color: '#ef4444',
            borderColor: '#fca5a5',
            padding: '0.75rem',
            borderRadius: '10px',
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
    <>
      {/* 1. MOBILE SLIDING DRAWER (Only mounts/opens on mobile sizes) */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        ModalProps={{ keepMounted: true }} 
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { 
            boxSizing: 'border-box', 
            width: '280px', 
            borderRight: '1px solid #e2e8f0',
            background: '#ffffff'
          },
        }}
      >
        {sidebarInnerContent}
      </Drawer>

      {/* 2. DESKTOP PERMANENT SIDEBAR (Strictly hidden on smaller screens via display property) */}
      <Box
        component="aside"
        sx={{
          width: '280px',
          minHeight: '100vh',
          background: '#ffffff',
          borderRight: '1px solid #e2e8f0',
          display: { xs: 'none', md: 'block' }, // ✅ THIS LINE IS TRICK: Completely removes it from phone layouts!
          flexShrink: 0
        }}
      >
        {sidebarInnerContent}
      </Box>
    </>
  );
};

export default Sidebar;
import React from 'react';
import { useEffect, useState } from 'react';

// Material UI Components
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';

// Material UI Icons
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import MenuBookOutlinedIcon from '@mui/icons-material/MenuBookOutlined';
import AssignmentTurnedInOutlinedIcon from '@mui/icons-material/AssignmentTurnedInOutlined';
import RateReviewOutlinedIcon from '@mui/icons-material/RateReviewOutlined';
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined';
import CardMembershipOutlinedIcon from '@mui/icons-material/CardMembershipOutlined';

const AdminOverview = () => {

    const [metrics, setMetrics] = useState({
    totalStudents: 0,
    totalCourses: 0,
    activeEnrollments: 0,
    pendingAssignments: 0,
    completedCourses: 0,
    certificatesIssued: 0
  });

  const backendUrl =
    import.meta.env.VITE_API_URL;

  /* =========================
     FETCH OVERVIEW
  ========================= */
  useEffect(() => {

    fetchAdminOverview();

  }, []);

  const fetchAdminOverview = async () => {

    try {

      const response = await fetch(
        `${backendUrl}/api/admin/overview`
      );
      const data = await response.json();
      if (response.ok) {
        setMetrics(data.metrics);
      }
    } catch (error) {
      console.error(
        'Overview fetch failed:',
        error
      );

    }
  };

  // Array holding the metric data configurations, matching your requested parameters
  const overviewMetrics = [
    {
      title: 'Total Students',
      description: 'Total registered students',
      value: metrics.totalStudents,// Placeholder data, ready to be linked with back-end state
      icon: <PeopleAltOutlinedIcon sx={{ fontSize: '1.8rem' }} />,
      color: '#3B592D',
      bgColor: 'rgba(59, 89, 45, 0.08)',
    },
    {
      title: 'Total Courses',
      description: 'Courses created',
      value: metrics.totalCourses,
      icon: <MenuBookOutlinedIcon sx={{ fontSize: '1.8rem' }} />,
      color: '#0284c7',
      bgColor: 'rgba(2, 132, 199, 0.08)',
    },
    {
      title: 'Active Enrollments',
      description: 'Students enrolled',
      value: metrics.activeEnrollments,
      icon: <AssignmentTurnedInOutlinedIcon sx={{ fontSize: '1.8rem' }} />,
      color: '#4f46e5',
      bgColor: 'rgba(79, 70, 229, 0.08)',
    },
    {
      title: 'Pending Assignments',
      description: 'Need admin review',
      value: metrics.pendingAssignments,
      icon: <RateReviewOutlinedIcon sx={{ fontSize: '1.8rem' }} />,
      color: '#d97706',
      bgColor: 'rgba(217, 119, 6, 0.08)',
    },
    {
      title: 'Completed Courses',
      description: 'Students finished',
      value: metrics.completedCourses,
      icon: <SchoolOutlinedIcon sx={{ fontSize: '1.8rem' }} />,
      color: '#16a34a',
      bgColor: 'rgba(22, 163, 74, 0.08)',
    },
    {
      title: 'Certificates Issued',
      description: 'Total certificates generated',
      value: metrics.certificatesIssued,
      icon: <CardMembershipOutlinedIcon sx={{ fontSize: '1.8rem' }} />,
      color: '#7c3aed',
      bgColor: 'rgba(124, 58, 237, 0.08)',
    },
  ];

  return (
    <Box>
      {/* Title Section Container */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: '800',
            color: '#1e293b',
            letterSpacing: '-0.5px',
            fontSize: '1.85rem',
          }}
        >
          Admin Overview
        </Typography>
        <Typography
          variant="body2"
          sx={{
            color: '#64748b',
            mt: 0.5,
          }}
        >
          Welcome to Eduvantaa Admin Panel. Here is your operational metric breakdown.
        </Typography>
      </Box>

      {/* Grid Dashboard Layout */}
      <Grid container spacing={3}>
        {overviewMetrics.map((card, index) => (
          <Grid item xs={12} sm={6} lg={4} key={index}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: '16px',
                border: '1px solid #e2e8f0',
                bgcolor: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 10px 15px -3px rgba(0,0,0,0.02), 0 4px 6px -4px rgba(0,0,0,0.02)',
                },
              }}
            >
              {/* Left Content Column */}
              <Box>
                <Typography
                  variant="subtitle2"
                  sx={{
                    color: '#64748b',
                    fontWeight: '700',
                    textTransform: 'uppercase',
                    fontSize: '0.75rem',
                    letterSpacing: '0.5px',
                  }}
                >
                  {card.title}
                </Typography>
                
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: '800',
                    color: '#1e293b',
                    my: 0.5,
                    fontSize: '1.75rem',
                  }}
                >
                  {card.value}
                </Typography>

                <Typography
                  variant="caption"
                  sx={{
                    color: '#94a3b8',
                    fontWeight: '500',
                    display: 'block',
                  }}
                >
                  {card.description}
                </Typography>
              </Box>

              {/* Right Decorative Icon Context Wrapper */}
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  p: 2,
                  borderRadius: '12px',
                  color: card.color,
                  bgcolor: card.bgColor,
                }}
              >
                {card.icon}
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default AdminOverview;
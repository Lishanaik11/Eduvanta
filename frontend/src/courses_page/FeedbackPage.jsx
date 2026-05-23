import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Rating from '@mui/material/Rating';
import MenuItem from '@mui/material/MenuItem';
import SendIcon from '@mui/icons-material/Send';
import CircularProgress from '@mui/material/CircularProgress';

const FeedbackPage = ({ userId }) => {
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  
  // Form States
  const [rating, setRating] = useState(0);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    courseId: '',
    feedbackText: ''
  });

  const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  // Fetch enrolled courses for the dropdown options array matrix maps
  useEffect(() => {

    // Auto fill logged in user details
    const storedUser = localStorage.getItem('user');

    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);

      setFormData(prev => ({
        ...prev,
        name: parsedUser.name || '',
        email: parsedUser.email || ''
      }));
    }

    const fetchEnrolledCourses = async () => {
      if (!userId) return;
      try {
        setLoadingCourses(true);
        // Direct route connection endpoint querying student module parameters
        const response = await fetch(`${backendUrl}/api/courses/user/${userId}`);
        const data = await response.json();
        
        if (response.ok && data.success) {
          setEnrolledCourses(data.enrollments || []);
        } else {
          console.error("Failed to fetch enrolled context tracks:", data.message);
        }
      } catch (err) {
        console.error("Error retrieving user tracking courses payload:", err);
      } finally {
        setLoadingCourses(false);
      }
    };

    fetchEnrolledCourses();
  }, [userId, backendUrl]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFormSubmission = async (e) => {
    e.preventDefault();

    if (!rating) {
      alert("Please provide an Overall Rating structural score.");
      return;
    }
    if (!formData.courseId) {
      alert("Please select an enrolled workspace course framework.");
      return;
    }

    try {
      const response = await fetch(`${backendUrl}/api/feedback/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          rating,
          ...formData
        })
      });

      const data = await response.json();
      if (response.ok && data.success) {
        alert("Feedback submitted successfully! Thank you for your review.");
        // Clear active inputs matrix states safely
        setRating(0);
        setFormData({ name: '', email: '', courseId: '', feedbackText: '' });
      } else {
        alert(data.message || "Failed to catalog feedback rows entry logs.");
      }
    } catch (err) {
      console.error("Structural processing submission runtime exception error:", err);
      alert("Server payload execution fault indicator. Try again.");
    }
  };

  return (
    <Box sx={{ maxWidth: '850px', margin: '0 auto', padding: { xs: '1rem', sm: '1.5rem', md: '2rem' }, boxSizing: 'border-box' }}>
      {/* Title Header Layout Component Group */}
      <Box sx={{ marginBottom: '2.5rem' }}>
        <Typography variant="h4" sx={{ fontSize: { xs: '1.5rem', sm: '1.85rem' }, fontWeight: '800', color: '#1e293b', marginBottom: '0.5rem' }}>
          Share Your Experience
        </Typography>
        <Typography sx={{ color: '#64748b', fontSize: '0.95rem' }}>
          Tell us about your experience with our educational website courses and instruction models.
        </Typography>
      </Box>

      {/* Main Structural Input Paper Panel */}
      <Paper
        elevation={0}
        component="form"
        onSubmit={handleFormSubmission}
        sx={{
          padding: { xs: '1.25rem', sm: '2.5rem' },
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '2rem',
          boxShadow: '0 4px 6px -1px rgba(0,0,0,0.01)'
        }}
      >
        {/* Star Rating Layout Area Component Mapping */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <Typography sx={{ fontSize: '0.95rem', fontWeight: '700', color: '#0f172a' }}>
            Overall Rating *
          </Typography>
          <Rating
            name="overall-rating"
            value={rating}
            onChange={(event, newValue) => setRating(newValue)}
            size="large"
            sx={{
              color: '#3B592D',
              '& .MuiRating-iconEmpty': { color: '#cbd5e1' }
            }}
          />
        </Box>

        {/* Form Inputs Row 1: Name & Email Row Container */}
        <Box sx={{ display: 'flex', gap: '1.5rem', flexDirection: { xs: 'column', sm: 'row' } }}>
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <Typography sx={{ fontSize: '0.95rem', fontWeight: '700', color: '#0f172a' }}>
              Name *
            </Typography>
            <TextField
              fullWidth
              size="small"
              name="name"
              placeholder="Your name"
              required
              value={formData.name}
              onChange={handleInputChange}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '10px',
                  background: '#f8fafc',
                  '&.Mui-focused fieldset': { borderColor: '#3B592D' }
                }
              }}
            />
          </Box>

          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <Typography sx={{ fontSize: '0.95rem', fontWeight: '700', color: '#0f172a' }}>
              Email *
            </Typography>
            <TextField
              fullWidth
              size="small"
              name="email"
              type="email"
              placeholder="your.email@example.com"
              required
              value={formData.email}
              onChange={handleInputChange}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '10px',
                  background: '#f8fafc',
                  '&.Mui-focused fieldset': { borderColor: '#3B592D' }
                }
              }}
            />
          </Box>
        </Box>

        {/* Form Input Row 2: Enrolled Courses Dynamic Selection Dropdown Drop Options Box */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <Typography sx={{ fontSize: '0.95rem', fontWeight: '700', color: '#0f172a' }}>
            Feedback Courses *
          </Typography>
         <TextField
  select
  fullWidth
  size="small"
  name="courseId"
  required
  value={formData.courseId}
  onChange={handleInputChange}
  disabled={loadingCourses}
  sx={{
    '& .MuiOutlinedInput-root': {
      borderRadius: '10px',
      background: '#f8fafc',
      '&.Mui-focused fieldset': {
        borderColor: '#3B592D'
      }
    }
  }}
>
  <MenuItem value="" disabled>
    Select a course
  </MenuItem>

  {loadingCourses ? (
    <MenuItem disabled value="">
      <Box sx={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <CircularProgress size={20} sx={{ color: '#3B592D' }} />
        <Typography variant="body2">
          Fetching courses...
        </Typography>
      </Box>
    </MenuItem>
  ) : enrolledCourses.length === 0 ? (
    <MenuItem disabled value="">
      No enrolled courses found
    </MenuItem>
  ) : (
    enrolledCourses.map((course) => (
      <MenuItem
        key={course.course_id}
        value={course.course_id}
      >
        {course.course_title}
      </MenuItem>
    ))
  )}
</TextField>
        </Box>

        {/* Form Input Row 3: Multiline Narrative Feedback Content Area Box */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <Typography sx={{ fontSize: '0.95rem', fontWeight: '700', color: '#0f172a' }}>
            Your Feedback *
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={5}
            name="feedbackText"
            placeholder="Tell us more about your experience..."
            required
            value={formData.feedbackText}
            onChange={handleInputChange}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '10px',
                background: '#f8fafc',
                '&.Mui-focused fieldset': { borderColor: '#3B592D' }
              }
            }}
          />
        </Box>

        {/* Direct Action Request Form Submission Pipeline Dispatcher */}
        <Box sx={{ display: 'flex', justifyContent: { xs: 'stretch', sm: 'flex-start' } }}>
          <Button
            type="submit"
            variant="contained"
            startIcon={<SendIcon />}
            sx={{
              background: '#3B592D',
              color: '#ffffff',
              borderRadius: '10px',
              padding: '0.75rem 2rem',
              fontWeight: '600',
              textTransform: 'none',
              boxShadow: 'none',
              width: { xs: '100%', sm: 'auto' },
              marginTop: '0.5rem',
              '&:hover': {
                background: '#2c4322',
                boxShadow: 'none'
              }
            }}
          >
            Submit Feedback
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default FeedbackPage;
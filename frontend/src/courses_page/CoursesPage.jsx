import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Material UI Core Imports
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import InputBase from '@mui/material/InputBase';
import Grid from '@mui/material/Grid';
import Chip from '@mui/material/Chip';
import Skeleton from '@mui/material/Skeleton';
import IconButton from '@mui/material/IconButton';

// Material UI Icons
import FileOpenIcon from '@mui/icons-material/FileOpen';
import SearchIcon from '@mui/icons-material/Search';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ClearIcon from '@mui/icons-material/Clear';
import SchoolIcon from '@mui/icons-material/School';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import BookmarkCheckIcon from '@mui/icons-material/CheckCircleOutlined';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import DownloadIcon from '@mui/icons-material/Download';

const isValidUserIdentity = (id) => {
  if (!id) return false;
  return String(id).trim().length > 0;
};

const CoursesPage = ({ viewMode }) => {
  const navigate = useNavigate();

  const [courses, setCourses] = useState([]);
  const [userEnrollments, setUserEnrollments] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const [selectedCourseForNotes, setSelectedCourseForNotes] = useState(null);
  const [courseNotesList, setCourseNotesList] = useState([]);
  const [notesLoading, setNotesLoading] = useState(false);
  const [coursesLoading, setCoursesLoading] = useState(true);

  const backendUrl = import.meta.env.VITE_API_URL;

  // ✅ FETCH COURSES FROM DB
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setCoursesLoading(true);
        const res = await fetch(`${backendUrl}/api/courses`);
        const data = await res.json();

        if (res.ok) {
          setCourses(data.courses || []);
        }
      } catch (err) {
        console.error("Failed to load courses", err);
      } finally {
        setCoursesLoading(false);
      }
    };

    fetchCourses();
  }, [backendUrl]);

  // ✅ FETCH USER ENROLLMENTS
  useEffect(() => {
    const fetchEnrollments = async () => {
      const userId = localStorage.getItem('userId');

      if (!isValidUserIdentity(userId)) return;

      try {
        const res = await fetch(`${backendUrl}/api/courses/user/${userId}`);
        const data = await res.json();

        if (res.ok) {
          const map = {};
          (data.enrollments || []).forEach((e) => {
            map[String(e.course_id)] = e.status || 'Enrolled';
          });

          setUserEnrollments(map);
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchEnrollments();
  }, [backendUrl]);

  // ✅ ENROLL OR OPEN COURSE
  const handleEnrollmentAction = async (course) => {
    const status = userEnrollments[String(course.id)];

    if (status) {
      navigate(`/course-view/${course.id}`, { state: { course } });
      return;
    }

    const userId = localStorage.getItem('userId');

    if (!isValidUserIdentity(userId)) {
      alert("Login required");
      return;
    }

    try {
      const res = await fetch(`${backendUrl}/api/courses/enroll`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          courseId: course.id,
          courseTitle: course.title
        })
      });

      const data = await res.json();

      if (res.ok) {
        alert("Enrolled successfully!");

        setUserEnrollments((prev) => ({
          ...prev,
          [String(course.id)]: 'Pending'
        }));
      } else {
        alert(data.message || "Enrollment failed");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // ✅ NOTES
  const handleOpenNotesPanel = async (course) => {
    setSelectedCourseForNotes(course);
    setNotesLoading(true);

    try {
      const res = await fetch(`${backendUrl}/api/course_notes/course/${course.id}`);

      if (res.ok) {
        const data = await res.json();
        console.log("COURSE NOTES RESPONSE:", data);

        if (data.success) {
          setCourseNotesList(data.notes || []);
        } else {
          setCourseNotesList([]);
        }
      } else {
        setCourseNotesList([]);
      }
    } catch (err) {
      console.error(err);
      setCourseNotesList([]);
    } finally {
      setNotesLoading(false);
    }
  };

  // ✅ DOWNLOAD NOTES ACTION
  const handleDownloadAction = async (note) => {
    try {
      const fileUrl = `${backendUrl}${note.file_url}`;

      const link = document.createElement('a');
      link.href = fileUrl;
      link.download = note.title || 'document';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      const userId = localStorage.getItem('userId');
      if (userId) {
        await fetch(`${backendUrl}/api/notes/download`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, noteId: note.id })
        });
      }
    } catch (err) {
      console.error('Download failed:', err);
      alert('Failed to download file');
    }
  };

  const getDocIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'pdf': return '📕';
      case 'image': return '🖼️';
      case 'doc':
      case 'docx': return '📘';
      default: return '📄';
    }
  };

  // ✅ FILTER LOGIC
  const structuralFilter =
    (viewMode === 'enrolled' || viewMode === 'notes')
      ? courses.filter(c => userEnrollments[String(c.id)])
      : courses;

  const coursesToRender = structuralFilter.filter((course) =>
    course.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // ================= NOTES VIEW =================
  if (viewMode === 'notes' && selectedCourseForNotes) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: '2rem', width: '100%' }}>
        <Box>
          <Button
            onClick={() => setSelectedCourseForNotes(null)}
            startIcon={<ArrowBackIcon />}
            sx={{
              color: '#475569',
              fontWeight: '600',
              textTransform: 'none',
              padding: '0.6rem 1.2rem',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              background: '#ffffff',
              boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
              transition: 'all 0.2s',
              '&:hover': {
                background: '#f8fafc',
                borderColor: '#cbd5e1',
                transform: 'translateX(-2px)'
              }
            }}
          >
            Back to Notes Overview
          </Button>
        </Box>

        <Paper 
          elevation={0} 
          sx={{ 
            p: { xs: '2rem', md: '3rem' },
            background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
            color: '#ffffff',
            borderRadius: '24px',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.15)'
          }}
        >
          <Box sx={{ position: 'absolute', right: '-40px', bottom: '-40px', opacity: 0.08, color: '#ffffff' }}>
            <LibraryBooksIcon sx={{ fontSize: '200px' }} />
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: '1rem', mb: '1rem' }}>
            <Box sx={{ p: '0.5rem', borderRadius: '8px', display: 'flex', background: 'rgba(255,255,255,0.1)' }}>
              <MenuBookIcon sx={{ color: '#94a3b8' }} />
            </Box>
            <Typography variant="overline" sx={{ color: '#94a3b8', fontWeight: '700', letterSpacing: '1px' }}>
              Study Module Materials
            </Typography>
          </Box>

          <Typography variant="h4" sx={{ fontWeight: '800', fontSize: { xs: '1.75rem', md: '2.5rem' }, mb: '1rem', letterSpacing: '-0.5px' }}>
            {selectedCourseForNotes.title}
          </Typography>

          <Typography sx={{ color: '#cbd5e1', fontSize: '1rem', fontWeight: '400', lineHeight: '1.7', maxWidth: '800px' }}>
            {selectedCourseForNotes.description}
          </Typography>
        </Paper>

        <Box sx={{ mt: 1 }}>
          <Typography variant="h5" sx={{ fontWeight: '800', color: '#0f172a', mb: 3, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            Available Handouts 
            <Chip label={`${courseNotesList.length} Resources`} size="small" sx={{ background: '#f1f5f9', color: '#475569', fontWeight: '700' }} />
          </Typography>

          {notesLoading ? (
            <Grid container spacing={3}>
              {[1, 2, 3].map((n) => (
                <Grid item xs={12} sm={6} md={4} key={n}>
                  <Skeleton variant="rounded" height={180} sx={{ borderRadius: '16px' }} />
                </Grid>
              ))}
            </Grid>
          ) : courseNotesList.length === 0 ? (
            <Paper sx={{ p: '5rem 2rem', textAlign: 'center', background: '#f8fafc', border: '2px dashed #e2e8f0', borderRadius: '20px', boxShadow: 'none' }}>
              <Typography sx={{ color: '#64748b', fontWeight: '600', fontSize: '1.1rem' }}>
                No active document resources found for this module yet.
              </Typography>
            </Paper>
          ) : (
            <Grid container spacing={3}>
              {courseNotesList.map((note) => (
                <Grid item xs={12} sm={6} md={4} key={note.id} sx={{ display: 'flex' }}>
                  <Paper 
                    elevation={0}
                    sx={{ 
                      p: '1.75rem',
                      background: '#ffffff',
                      borderRadius: '16px',
                      border: '1px solid #e2e8f0',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      width: '100%',
                      height: '100%',
                      boxSizing: 'border-box',
                      minHeight: '220px',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      '&:hover': {
                        borderColor: '#3B592D',
                        transform: 'translateY(-4px)',
                        boxShadow: '0 12px 24px -6px rgba(59, 89, 45, 0.12)'
                      }
                    }}
                  >
                    <Box sx={{ mt: 'auto' }}>
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', mb: '0.75rem' }}>
                        <Typography sx={{ fontWeight: '800', color: '#1e293b', fontSize: '1.1rem', lineHeight: '1.4' }}>
                          {note.title}
                        </Typography>
                        <Box sx={{ fontSize: '1.5rem', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.08))' }}>
                          {getDocIcon(note.file_type)}
                        </Box>
                      </Box>

                      <Typography sx={{ fontSize: '0.875rem', color: '#64748b', fontWeight: '500', lineHeight: '1.6', mb: '1.5rem' }}>
                        {note.description || "No description overview provided for this specific material entry."}
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', gap: '0.5rem', width: '100%', mt: 'auto' }}>
                      <Button
                        component="a"
                        href={`${backendUrl}${note.file_url}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        variant="contained"
                        disableElevation
                        startIcon={<FileOpenIcon sx={{ fontSize: '1.1rem' }} />}
                        sx={{
                          flex: 1,
                          background: '#3B592D',
                          color: '#ffffff',
                          fontWeight: '700',
                          textTransform: 'none',
                          borderRadius: '10px',
                          padding: '0.6rem 1rem',
                          fontSize: '0.875rem',
                          '&:hover': { background: '#2c4222' }
                        }}
                      >
                        Open
                      </Button>
                      
                      <IconButton
                        onClick={() => handleDownloadAction(note)}
                        title="Download Document"
                        sx={{
                          background: '#f1f5f9',
                          color: '#475569',
                          borderRadius: '10px',
                          padding: '0.6rem',
                          transition: 'all 0.2s',
                          '&:hover': {
                            background: '#e2e8f0',
                            color: '#0f172a'
                          }
                        }}
                      >
                        <DownloadIcon sx={{ fontSize: '1.25rem' }} />
                      </IconButton>
                    </Box>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      </Box>
    );
  }

  // ================= MAIN VIEW =================
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: '2.5rem', width: '100%' }}>
      
      {/* Header Banner Block Section */}
      <Box sx={{ 
        display: 'flex', 
        flexDirection: { xs: 'column', md: 'row' }, 
        alignItems: { md: 'center' }, 
        justifyContent: 'space-between', 
        gap: '2rem',
        pb: '1rem',
        borderBottom: '1px solid #f1f5f9'
      }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: '0.75rem', mb: '0.25rem' }}>
            <Box sx={{ 
              display: 'flex', 
              p: '0.5rem', 
              borderRadius: '10px', 
              background: 'linear-gradient(135deg, #eef6f0 0%, #e1efe5 100%)',
              color: '#3B592D'
            }}>
              {viewMode === 'notes' ? <LibraryBooksIcon fontSize="small" /> : <SchoolIcon fontSize="small" />}
            </Box>
            <Typography variant="h4" sx={{ fontWeight: '900', color: '#0f172a', fontSize: { xs: '1.75rem', md: '2.2rem' }, letterSpacing: '-0.5px' }}>
              {viewMode === 'all' && 'Explore Courses'}
              {viewMode === 'enrolled' && 'Enrolled Workspace'}
              {viewMode === 'notes' && 'Academic Notes Archive'}
            </Typography>
          </Box>
          <Typography sx={{ color: '#64748b', fontSize: '0.95rem', fontWeight: '500', pl: '3.25rem', display: { xs: 'none', sm: 'block' } }}>
            {viewMode === 'all' && 'Discover new instructional modules and expand your academic knowledge base.'}
            {viewMode === 'enrolled' && 'Track and access all active academic syllabus setups assigned to your account.'}
            {viewMode === 'notes' && 'Select any active registry curriculum card profile below to view documentation notes.'}
          </Typography>
        </Box>

        {/* Search Layout Box */}
        <Paper 
          elevation={0}
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            padding: '0.7rem 1.2rem', 
            background: '#ffffff',
            borderRadius: '14px',
            border: '1px solid',
            borderColor: isFocused ? '#3B592D' : '#e2e8f0',
            width: { xs: '100%', md: '340px' },
            boxShadow: isFocused ? '0 4px 12px rgba(59, 89, 45, 0.08), 0 0 0 3px rgba(59, 89, 45, 0.04)' : '0 2px 4px rgba(0,0,0,0.02)',
            transition: 'all 0.25s ease'
          }}
        >
          <SearchIcon sx={{ color: isFocused ? '#3B592D' : '#94a3b8', marginRight: '0.75rem', fontSize: '1.3rem' }} />
          <InputBase
            placeholder="Search across courses..."
            value={searchQuery}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{ 
              flex: 1, 
              fontSize: '0.9rem', 
              fontWeight: '600',
              color: '#1e293b',
              '& ::placeholder': { color: '#94a3b8', opacity: 1 }
            }}
          />
          {searchQuery && (
            <Button 
              onClick={() => setSearchQuery('')}
              sx={{ minWidth: 'auto', padding: 0, color: '#94a3b8', '&:hover': { color: '#ef4444' } }}
            >
              <ClearIcon sx={{ fontSize: '1.1rem' }} />
            </Button>
          )}
        </Paper>
      </Box>

      {/* Courses Grid Pipeline System */}
      {coursesLoading ? (
        <Grid container spacing={3} sx={{ justifyContent: 'flex-start' }}>
          {[1, 2, 3].map((n) => (
            <Grid item xs={12} sm={6} md={4} key={n}>
              <Skeleton variant="rounded" height={260} sx={{ borderRadius: '20px' }} />
            </Grid>
          ))}
        </Grid>
      ) : coursesToRender.length === 0 ? (
        <Paper sx={{ p: '6rem 2rem', textAlign: 'center', background: '#ffffff', border: '2px dashed #e2e8f0', borderRadius: '24px', boxShadow: 'none' }}>
          <Typography sx={{ color: '#94a3b8', fontWeight: '600', fontSize: '1.1rem' }}>
            No standard curriculum courses match your active search filter query.
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {coursesToRender.map((course) => {
            const status = userEnrollments[String(course.id)];
            const isNotesMode = viewMode === 'notes';
            const isEnrolled = !!status;
            
            let btnBg = '#3B592D';
            let btnHoverBg = '#2c4222';
            let btnText = 'Enroll';

            if (isNotesMode) {
              btnBg = '#0f172a';
              btnHoverBg = '#1e293b';
              btnText = 'Access Notes';
            } else if (isEnrolled) {
              btnBg = 'transparent';
              btnText = 'Open';
            }

            return (
              <Grid item xs={12} sm={6} md={4} key={course.id} sx={{ display: 'flex' }}>
                <Paper 
                  elevation={0}
                  sx={{
                    width: "100%",
                    height: "100%",
                    boxSizing: "border-box",
                    padding: "1.8rem",
                    background: "#ffffff",
                    borderRadius: "20px",
                    border: "1px solid",
                    borderColor: isEnrolled && !isNotesMode ? "#d1e7d6" : "#e2e8f0",
                    display: "flex",                 
flexDirection: "column",
height: "100%",
                    minHeight: "280px",
                    position: 'relative',
                    overflow: 'hidden',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    boxShadow: '0 4px 10px rgba(0, 0, 0, 0.01)',
                    '&:hover': {
                      transform: 'translateY(-6px)',
                      boxShadow: isEnrolled && !isNotesMode 
                        ? '0 20px 30px -10px rgba(59, 89, 45, 0.15)' 
                        : '0 20px 30px -10px rgba(15, 23, 42, 0.08)',
                      borderColor: isEnrolled && !isNotesMode ? '#3B592D' : '#cbd5e1'
                    }
                  }}
                >
                  {/* Decorative top color edge rule line */}
                  <Box sx={{ 
                    position: 'absolute', 
                    top: 0, 
                    left: 0, 
                    right: 0, 
                    height: '4px', 
                    background: isEnrolled && !isNotesMode ? 'linear-gradient(90deg, #3B592D, #689f4c)' : 'linear-gradient(90deg, #e2e8f0, #cbd5e1)'
                  }} />

               <Box sx={{
  display: "flex",
  flexDirection: "column",
  gap: "0.5rem",
  flex: 1
}}>
                    {/* Status badge row layout */}
                    {isEnrolled && (
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', width: '100%' }}>
                        <Chip 
                          icon={<BookmarkCheckIcon style={{ color: status === 'Pending' ? '#b45309' : '#15803d', fontSize: '1rem' }} />}
                          label={status} 
                          size="small"
                          sx={{ 
                            background: status === 'Pending' ? '#fef3c7' : '#dcfce7', 
                            color: status === 'Pending' ? '#b45309' : '#15803d',
                            fontWeight: '700',
                            fontSize: '0.75rem',
                            height: '24px'
                          }} 
                        />
                      </Box>
                    )}

                    <Typography variant="h6" sx={{ fontWeight: '800', color: '#0f172a', fontSize: '1.25rem', lineHeight: '1.4', letterSpacing: '-0.3px' }}>
                      {course.title}
                    </Typography>

                   <Typography
  sx={{
    fontSize: "0.875rem",
    color: "#64748b",
    fontWeight: "500",
    lineHeight: "1.6",
    whiteSpace: 'pre-line',

    display: "-webkit-box",
    WebkitLineClamp: 3,
    WebkitBoxOrient: "vertical",
    overflow: "hidden"
  }}
>
  {course.description}
</Typography>
                  </Box>

                  <Box>
                    <Button
                      fullWidth
                      variant={isEnrolled && !isNotesMode ? "outlined" : "contained"}
                      disableElevation
                      onClick={() =>
                        viewMode === 'notes'
                          ? handleOpenNotesPanel(course)
                          : handleEnrollmentAction(course)
                      }
                      sx={{
                        background: btnBg,
                        color: isEnrolled && !isNotesMode ? '#3B592D' : '#ffffff',
                        borderColor: isEnrolled && !isNotesMode ? '#3B592D' : 'transparent',
                        fontWeight: '800',
                        fontSize: '0.875rem',
                        textTransform: 'none',
                        borderRadius: '12px',
                        padding: '0.75rem 1.5rem',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          background: isEnrolled && !isNotesMode ? '#eef6f0' : btnHoverBg,
                          borderColor: '#3B592D',
                          transform: 'translateY(-1px)'
                        }
                      }}
                    >
                      {btnText}
                    </Button>
                  </Box>
                </Paper>
              </Grid>
            );
          })}
        </Grid>
      )}
    </Box>
  );
};

export default CoursesPage;
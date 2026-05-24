// src/courses_page/certificatePage.jsx

import React, { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import CircularProgress from '@mui/material/CircularProgress';

import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DownloadIcon from '@mui/icons-material/Download';

import Certificate from './certificate';

const CertificatePage = ({ userId }) => {
  const [completedCourses, setCompletedCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [previewItem, setPreviewItem] = useState(null);
  const [generatingId, setGeneratingId] = useState(null);

  const backendUrl =
    import.meta.env.VITE_API_URL;

  /**
   * FETCH COMPLETED ENROLLMENTS
   */
  const fetchCompletedCourses = async () => {
    if (!userId) return;

    try {
      setLoading(true);

      const response = await fetch(
        `${backendUrl}/api/courses/user/${userId}`
      );

      const data = await response.json();

      if (response.ok && data.success) {

        const completedOnly = (data.enrollments || []).filter(
          (course) => course.status === 'Completed'
        );

       const storedUser = JSON.parse(
  localStorage.getItem('user')
);

const formatted = completedOnly.map((course, index) => ({
  id: index + 1,
  courseId: course.course_id,
  subjectName: course.course_title,
 studentName:
  JSON.parse(localStorage.getItem('user'))?.name ||
  JSON.parse(localStorage.getItem('user'))?.fullName ||
  localStorage.getItem('userName') ||
  'Student',
}));

        setCompletedCourses(formatted);

      } else {
        setCompletedCourses([]);
      }

    } catch (err) {
      console.error('❌ Error fetching completed courses:', err);
      setCompletedCourses([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompletedCourses();
  }, [userId]);

  /**
   * GENERATE CERTIFICATE
   */
  const handleGenerateCertificate = async (course) => {
    try {
      setGeneratingId(course.courseId);

      const response = await fetch(
        `${backendUrl}/api/courses/certificate/generate`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            userId,
            courseId: course.courseId,
            courseTitle: course.subjectName,
            studentName: course.studentName
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || 'Failed to generate certificate');
        return;
      }

      alert(data.message);

    } catch (err) {
      console.error('❌ Generate certificate error:', err);

      alert('Server error while generating certificate.');
    } finally {
      setGeneratingId(null);
    }
  };

  /**
   * LOADING
   */
  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          padding: '4rem'
        }}
      >
        <CircularProgress sx={{ color: '#3B592D' }} />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ marginBottom: '2.5rem' }}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: '800',
            color: '#1e293b',
            marginBottom: '0.25rem'
          }}
        >
          Your Earned Certificates
        </Typography>

        <Typography
          sx={{
            color: '#64748b',
            fontWeight: '500'
          }}
        >
          Review, open, or download verified course credentials.
        </Typography>
      </Box>

      {completedCourses.length === 0 ? (
        <Paper
          sx={{
            padding: '3rem',
            textAlign: 'center',
            borderRadius: '12px',
            border: '1px solid #e2e8f0'
          }}
        >
          <WorkspacePremiumIcon
            sx={{
              fontSize: '4rem',
              color: '#cbd5e1',
              marginBottom: '1rem'
            }}
          />

          <Typography
            sx={{
              color: '#64748b',
              fontWeight: '600'
            }}
          >
            Complete courses to unlock certificates.
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {completedCourses.map((course, idx) => {
            const chosenTheme =
              idx % 2 === 0 ? 'purple' : 'blue';

            const themeAccent =
              chosenTheme === 'purple'
                ? '#7c3aed'
                : '#0284c7';

            return (
              <Grid
                item
                xs={12}
                sm={6}
                md={4}
                key={course.courseId}
              >
                <Paper
                  sx={{
                    padding: '2rem',
                    borderRadius: '16px',
                    border: '1px solid #e2e8f0',
                    background: '#ffffff',
                    position: 'relative',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    minHeight: '220px',
                    transition: 'all 0.3s ease'
                  }}
                >
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      bottom: 0,
                      width: '6px',
                      background: themeAccent
                    }}
                  />

                  <Box>
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginBottom: '1rem'
                      }}
                    >
                      <Typography
                        variant="caption"
                        sx={{
                          textTransform: 'uppercase',
                          fontWeight: '800',
                          color: themeAccent
                        }}
                      >
                        Verified Credential
                      </Typography>

                      <WorkspacePremiumIcon
                        sx={{ color: themeAccent }}
                      />
                    </Box>

                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: '700',
                        color: '#1e293b'
                      }}
                    >
                      {course.subjectName}
                    </Typography>
                  </Box>

                  <Box sx={{ marginTop: '1.5rem' }}>
                    <Typography
                      sx={{
                        fontSize: '0.8rem',
                        color: '#94a3b8',
                        marginBottom: '1rem'
                      }}
                    >
                      Completed on: {course.completionDate}
                    </Typography>

                    <Box sx={{ display: 'flex', gap: '1rem' }}>
                      <Button
                        variant="contained"
                        size="small"
                        startIcon={<VisibilityIcon />}
                        onClick={() =>
                          setPreviewItem({
                            ...course,
                            chosenTheme
                          })
                        }
                        sx={{
                          background: '#1e293b',
                          textTransform: 'none'
                        }}
                      >
                        Open
                      </Button>

                      <Button
                        variant="contained"
                        size="small"
                        startIcon={<DownloadIcon />}
                        disabled={
                          generatingId === course.courseId
                        }
                        onClick={() =>
                          handleGenerateCertificate(course)
                        }
                        sx={{
                          background: '#3B592D',
                          textTransform: 'none'
                        }}
                      >
                        {generatingId === course.courseId
                          ? 'Generating...'
                          : 'Generate'}
                      </Button>
                    </Box>
                  </Box>
                </Paper>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* PREVIEW MODAL */}
      <Dialog
        open={Boolean(previewItem)}
        onClose={() => setPreviewItem(null)}
        maxWidth="md"
        fullWidth
      >
        <DialogContent>
          {previewItem && (
            <Certificate
              studentName={previewItem.studentName}
              subjectName={previewItem.subjectName}
              completionDate={previewItem.completionDate}
              variantColor={previewItem.chosenTheme}
              downloadModeOnly={false}
            />
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default CertificatePage;
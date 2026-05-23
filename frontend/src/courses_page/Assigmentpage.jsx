import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Chip from '@mui/material/Chip';
import Link from '@mui/material/Link';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import AssignmentIcon from '@mui/icons-material/Assignment';
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import FileUploadIcon from '@mui/icons-material/FileUpload';
import UndoIcon from '@mui/icons-material/Undo';
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import FeedbackOutlinedIcon from "@mui/icons-material/FeedbackOutlined";

const Assigmentpage = ({ userId }) => {
  const [assignments, setAssignments] = useState([]);
  const [inputLinks, setInputLinks] = useState({});
  const [loading, setLoading] = useState(true);

  const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }
    loadAssignmentsData();
  }, [userId]);

  const loadAssignmentsData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${backendUrl}/api/assignments/${userId}`);
      const data = await response.json();

      if (response.ok) {
        setAssignments(data.assignments || []);
      }
    } catch (err) {
      console.error('Error fetching assignments payload:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLinkTextChange = (id, value) => {
    setInputLinks(prev => ({ ...prev, [id]: value }));
  };

  const handleLocalFileUpload = (e, assignmentId) => {
    const file = e.target.files[0];
    if (!file) return;
    setInputLinks(prev => ({ ...prev, [assignmentId]: file }));
  };

  const executeSubmissionAction = async (assignmentId) => {
    const file = inputLinks[assignmentId];
    if (!file) {
      alert("Please upload file or provide link");
      return;
    }

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('assignmentId', assignmentId);
      formData.append('userId', userId);

      const response = await fetch(`${backendUrl}/api/assignments/submit`, {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        alert("Assignment uploaded successfully");

        setInputLinks(prev => {
          const updated = { ...prev };
          delete updated[assignmentId];
          return updated;
        });

        loadAssignmentsData();
      } else {
        const data = await response.json();
        alert(data.message);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const executeUnsubmitAction = async (assignmentId) => {
    if (!window.confirm("Are you sure you want to unsubmit?")) return;

    try {
      const response = await fetch(`${backendUrl}/api/assignments/unsubmit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assignmentId, userId })
      });

      if (response.ok) {
        alert("Submission recalled successfully.");
        loadAssignmentsData();
      } else {
        const data = await response.json();
        alert(data.message || "Failed to unsubmit assignment.");
      }
    } catch (err) {
      console.error("Error unsubmitting assignment:", err);
    }
  };

  const renderStatusBadge = (item) => {
    const overdueFlag = new Date(item.due_date) < new Date();
    let chipStyles = {};

    if (item.status === 'Graded' || item.status === 'Approved') {
      chipStyles = { bgcolor: "#e2f0d9", color: "#2e7d32", border: "1px solid #b8e0a4" };
      return <Chip label="APPROVED" size="small" sx={{ ...chipStyles, borderRadius: "6px", fontSize: "0.7rem", fontWeight: "700", letterSpacing: "0.5px" }} />;
    }
    if (item.status === 'Rejected') {
      chipStyles = { bgcolor: "#fce8e6", color: "#c62828", border: "1px solid #f5c2c1" };
      return <Chip label="REJECTED" size="small" sx={{ ...chipStyles, borderRadius: "6px", fontSize: "0.7rem", fontWeight: "700", letterSpacing: "0.5px" }} />;
    }
    if (item.status === 'Submitted') {
      chipStyles = { bgcolor: "rgba(59, 89, 45, 0.12)", color: "#3B592D", border: "1px solid rgba(59, 89, 45, 0.3)" };
      return <Chip label="SUBMITTED" size="small" sx={{ ...chipStyles, borderRadius: "6px", fontSize: "0.7rem", fontWeight: "700", letterSpacing: "0.5px" }} />;
    }
    if (overdueFlag) {
      chipStyles = { bgcolor: "#fce8e6", color: "#c62828", border: "1px solid #f5c2c1" };
      return <Chip label="OVERDUE" size="small" sx={{ ...chipStyles, borderRadius: "6px", fontSize: "0.7rem", fontWeight: "700", letterSpacing: "0.5px" }} />;
    }
    chipStyles = { bgcolor: "#fff3e0", color: "#ef6c00", border: "1px solid #ffe0b2" };
    return <Chip label="PENDING SUBMISSION" size="small" sx={{ ...chipStyles, borderRadius: "6px", fontSize: "0.7rem", fontWeight: "700", letterSpacing: "0.5px" }} />;
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <Typography sx={{ color: '#64748b', fontSize: '1rem', fontWeight: '500' }}>
          🔄 Synchronizing assignments data context structures...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ width: "100%", p: { xs: 2, md: 4 }, bgcolor: "#f8fafc", minHeight: "100vh" }}>
      
      {/* HEADER SECTION */}
      <Box sx={{ mb: 5, display: "flex", alignItems: "center", gap: 2 }}>
        <Box 
          sx={{ 
            bgcolor: "#3B592D", 
            color: "white", 
            p: 1.5, 
            borderRadius: "14px", 
            display: "flex", 
            boxShadow: "0 4px 14px rgba(59, 89, 45, 0.25)" 
          }}
        >
          <AssignmentOutlinedIcon fontSize="medium" />
        </Box>
        <Box>
          <Typography variant="h4" fontWeight="800" color="#1e293b" sx={{ letterSpacing: "-0.5px", fontSize: '1.85rem' }}>
            My Course Assignments Dashboard
          </Typography>
          <Typography variant="body2" color="#64748b" sx={{ mt: 0.5 }}>
            View curriculum projects, upload workspace materials, and track grading feedback.
          </Typography>
        </Box>
      </Box>

      {/* ASSIGNMENTS CONTAINER LIST */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {assignments.map((task) => {
          const isOverdue = new Date(task.due_date) < new Date();
          const localizedTimeText = new Date(task.due_date).toLocaleDateString();

          return (
            <Paper 
              key={task.id} 
              elevation={0}
              sx={{ 
                padding: '2rem', 
                border: '1px solid #e2e8f0', 
                borderRadius: '16px',
                boxShadow: "0 4px 6px -1px rgba(0,0,0,0.01), 0 2px 4px -1px rgba(0,0,0,0.01)",
                bgcolor: '#ffffff',
                transition: "transform 0.2s, box-shadow 0.2s",
                "&:hover": {
                  boxShadow: "0 10px 15px -3px rgba(0,0,0,0.03), 0 4px 6px -4px rgba(0,0,0,0.03)"
                }
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 2 }}>
                <Typography variant="h5" sx={{ fontWeight: '700', color: '#1e293b', fontSize: '1.25rem' }}>
                  {task.title}
                </Typography>
                {renderStatusBadge(task)}
              </Box>

              <Typography sx={{ mt: 1.5, color: '#475569', fontSize: '0.95rem', lineHeight: 1.6 }}>
                {task.description}
              </Typography>

              <Box sx={{ mt: 2.5, display: 'flex', alignItems: 'center', gap: 1, color: isOverdue && task.status !== 'Submitted' && task.status !== 'Approved' && task.status !== 'Graded' ? '#c62828' : '#64748b', fontSize: '0.85rem', fontWeight: '600' }}>
                <EventAvailableIcon sx={{ fontSize: 18 }} />
                Due Date: {localizedTimeText}
              </Box>

              <Box sx={{ borderTop: '1px solid #f1f5f9', mt: 2.5, pt: 2.5 }}>
                {(task.status === 'Submitted' || task.status === 'Approved' || task.status === 'Graded') ? (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                    
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                      <CheckCircleIcon sx={{ color: '#3B592D', fontSize: 20 }} />
                      <Link 
                        href={`${backendUrl}${task.submitted_url}`} 
                        target="_blank"
                        sx={{ 
                          color: '#3B592D', 
                          fontWeight: '600', 
                          fontSize: '0.9rem',
                          textDecoration: 'none',
                          '&:hover': { textDecoration: 'underline' }
                        }}
                      >
                        View Attached Submission File
                      </Link>
                    </Box>

                    {task.status === 'Submitted' ? (
                      <Button
                        variant="outlined"
                        color="error"
                        startIcon={<UndoIcon />}
                        onClick={() => executeUnsubmitAction(task.id)}
                        sx={{
                          borderRadius: "20px",
                          textTransform: "none",
                          fontWeight: "700",
                          px: 2.5,
                          py: 0.5,
                          fontSize: "0.8rem"
                        }}
                      >
                        Unsubmit Assignment
                      </Button>
                    ) : (
                      <Button
                        variant="contained"
                        disabled
                        startIcon={<CheckCircleIcon />}
                        sx={{
                          borderRadius: "20px",
                          textTransform: "none",
                          fontWeight: "700",
                          px: 2.5,
                          py: 0.5,
                          fontSize: "0.8rem",
                          background: '#3B592D',
                          color: '#fff',
                          '&.Mui-disabled': {
                            background: '#3B592D',
                            color: '#fff',
                            opacity: 0.5
                          }
                        }}
                      >
                        Accepted
                      </Button>
                    )}
                  </Box>
                ) : (
                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    <Button
                      component="label"
                      variant="outlined"
                      startIcon={<FileUploadIcon />}
                      color={inputLinks[task.id] ? "success" : "inherit"}
                      sx={{
                        minWidth: '140px',
                        borderRadius: "10px",
                        textTransform: "none",
                        fontWeight: "600",
                        fontSize: "0.875rem",
                        borderColor: inputLinks[task.id] ? '#b8e0a4' : '#cbd5e1',
                        bgcolor: inputLinks[task.id] ? '#e2f0d9' : 'transparent',
                        color: inputLinks[task.id] ? '#2e7d32' : '#475569',
                        '&:hover': {
                          borderColor: inputLinks[task.id] ? '#2e7d32' : '#94a3b8',
                          bgcolor: inputLinks[task.id] ? '#e2f0d9' : '#f1f5f9'
                        }
                      }}
                    >
                      {inputLinks[task.id] ? 'File Staged ✓' : 'Choose File'}
                      <input
                        type="file"
                        hidden
                        onChange={(e) => handleLocalFileUpload(e, task.id)}
                      />
                    </Button>

                    <Button
                      variant="contained"
                      onClick={() => executeSubmissionAction(task.id)}
                      disabled={!inputLinks[task.id]}
                      sx={{
                        borderRadius: "10px",
                        textTransform: "none",
                        fontWeight: "600",
                        fontSize: "0.875rem",
                        px: 3,
                        background: '#3B592D',
                        boxShadow: "0 2px 4px rgba(59, 89, 45, 0.15)",
                        '&:hover': {
                          background: '#2f4725'
                        }
                      }}
                    >
                      Upload & Submit
                    </Button>
                  </Box>
                )}
              </Box>

              {/* REJECTED FEEDBACK ALERT BOX */}
              {task.status === 'Deleted' || (task.status === 'Rejected' && task.feedback) && (
                <Box 
                  sx={{ 
                    mt: 2, 
                    p: 2, 
                    bgcolor: "#fce8e6", 
                    borderRadius: "12px", 
                    border: "1px solid #f5c2c1",
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 1.5
                  }}
                >
                  <FeedbackOutlinedIcon sx={{ color: "#c62828", mt: 0.2, fontSize: 20 }} />
                  <Box>
                    <Typography variant="body2" sx={{ color: "#c62828", fontWeight: "700", fontSize: "0.85rem" }}>
                      Evaluation Feedback
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#7a1c1c", mt: 0.5, fontSize: "0.9rem", fontWeight: "500" }}>
                      {task.feedback}
                    </Typography>
                  </Box>
                </Box>
              )}

            </Paper>
          );
        })}
      </Box>
    </Box>
  );
};

export default Assigmentpage;
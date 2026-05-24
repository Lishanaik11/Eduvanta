import React, { useState, useEffect } from 'react';

// Material UI Core Imports
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import Chip from '@mui/material/Chip';
import Skeleton from '@mui/material/Skeleton';
import Tooltip from '@mui/material/Tooltip';
import TextField from '@mui/material/TextField';

// Material UI Icons
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import ReplyIcon from '@mui/icons-material/Reply';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import PersonIcon from '@mui/icons-material/Person';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';

const AdminQueriesPage = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState({});

  const backendUrl = import.meta.env.VITE_API_URL;

  // ✅ FETCH ALL MESSAGES FROM BACKEND
  const fetchMessages = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${backendUrl}/api/contact/messages`);
      const data = await res.json();

      if (res.ok) {
        setMessages(data.messages || []);
      } else {
        console.error(data.message || "Failed to load queries");
      }
    } catch (err) {
      console.error("Pipeline breakdown tracking system queries:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [backendUrl]);

  // ✅ REPLY VIA SYSTEM EMAIL PIPELINE
const handleReplySubmit = async (msg) => {

  const text = replyText[msg.id]?.trim();

  if (!text) {
    alert("Please enter a response body before sending.");
    return;
  }

  try {

    const res = await fetch(
      `${backendUrl}/api/contact/messages/reply/${msg.id}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          admin_reply: text
        })
      }
    );

    const data = await res.json();

    if (!res.ok) {
      alert(data.message || 'Failed to send reply');
      return;
    }

    alert('Reply stored successfully');

    // Clear reply field
    setReplyText((prev) => ({
      ...prev,
      [msg.id]: ''
    }));

    // Refresh messages
    fetchMessages();

  } catch (error) {

    console.error(error);

    alert('Failed to send reply');

  }

};

  const handleReplyChange = (id, val) => {
    setReplyText((prev) => ({ ...prev, [id]: val }));
  };

  // ✅ DELETE MESSAGE ROUTINE
  const handleDeleteMessage = async (id) => {
    if (!window.confirm("Are you sure you want to permanently delete this user entry?")) return;

    try {
      const res = await fetch(`${backendUrl}/api/contact/messages/${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();

      if (res.ok) {
        setMessages((prev) => prev.filter((item) => item.id !== id));
      } else {
        alert(data.message || "Deletion sequence failed.");
      }
    } catch (err) {
      console.error(err);
      alert("Network error trying to process operation.");
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
      
      {/* Header Section */}
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        pb: '1.5rem',
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
              <QuestionAnswerIcon fontSize="small" />
            </Box>
            <Typography variant="h4" sx={{ fontWeight: '900', color: '#0f172a', fontSize: { xs: '1.75rem', md: '2.2rem' }, letterSpacing: '-0.5px' }}>
              User Queries & Grievances
            </Typography>
          </Box>
          <Typography sx={{ color: '#64748b', fontSize: '0.95rem', fontWeight: '500', pl: '3.25rem', display: { xs: 'none', sm: 'block' } }}>
            Manage incoming contact communication, verify user requests, and submit replies.
          </Typography>
        </Box>

        <Chip 
          label={`${messages.length} Active Tickets`} 
          variant="filled"
          sx={{ background: '#3B592D', color: '#ffffff', fontWeight: '700', borderRadius: '8px' }} 
        />
      </Box>

      {/* Main Grid Render Logic */}
      {loading ? (
        <Grid container spacing={3}>
          {[1, 2, 3].map((n) => (
            <Grid item xs={12} key={n}>
              <Skeleton variant="rounded" height={200} sx={{ borderRadius: '20px' }} />
            </Grid>
          ))}
        </Grid>
      ) : messages.length === 0 ? (
        <Paper sx={{ p: '6rem 2rem', textAlign: 'center', background: '#ffffff', border: '2px dashed #e2e8f0', borderRadius: '24px', boxShadow: 'none' }}>
          <Typography sx={{ color: '#94a3b8', fontWeight: '600', fontSize: '1.1rem' }}>
            Excellent status! No unresolved contact logs or messages pending inside the system registry.
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {messages.map((msg) => (
            <Grid item xs={12} key={msg.id}>
              <Paper
                elevation={0}
                sx={{
                  padding: '2rem',
                  background: '#ffffff',
                  borderRadius: '20px',
                  border: '1px solid #e2e8f0',
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    borderColor: '#cbd5e1',
                    boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.04)'
                  }
                }}
              >
                {/* Decorative border bar line accent */}
                <Box sx={{ 
                  position: 'absolute', top: 0, left: 0, bottom: 0, width: '4px', 
                  background: 'linear-gradient(180deg, #3B592D 0%, #527c3f 100%)' 
                }} />

                <Grid container spacing={3}>
                  {/* Left Column: User Profile Info Metadata */}
                  <Grid item xs={12} md={4} sx={{ borderRight: { md: '1px solid #f1f5f9' }, pr: { md: '1rem' } }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <PersonIcon sx={{ color: '#64748b', fontSize: '1.2rem' }} />
                        <Typography sx={{ fontWeight: '800', color: '#0f172a', fontSize: '1.1rem' }}>
                          {msg.student_name} 
                        </Typography>
                      </Box>

                      <Box sx={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <EmailIcon sx={{ color: '#64748b', fontSize: '1.2rem' }} />
                        <Typography sx={{ fontWeight: '600', color: '#475569', fontSize: '0.9rem', wordBreak: 'break-all' }}>
                         {msg.student_email}
                        </Typography>
                      </Box>


                      {msg.created_at && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: '0.75rem', mt: '0.5rem' }}>
                          <CalendarTodayIcon sx={{ color: '#94a3b8', fontSize: '1rem' }} />
                          <Typography sx={{ color: '#94a3b8', fontSize: '0.8rem', fontWeight: '600' }}>
                            {new Date(msg.created_at).toLocaleString()}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </Grid>

                  {/* Right Column: Content Body & Reply Interface Controls */}
                  <Grid item xs={12} md={8} sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '1.5rem', pl: { md: '1rem' } }}>
                    
                    <Box>
                      <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: '700', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                        Submitted Narrative Message
                      </Typography>
                      <Paper elevation={0} sx={{ p: '1.2rem', bg: '#f8fafc', background: '#f8fafc', borderRadius: '12px', mt: '0.5rem', border: '1px solid #f1f5f9' }}>
                        <Typography sx={{ fontSize: '0.95rem', color: '#1e293b', fontWeight: '500', lineHeight: '1.6', whiteSpace: 'pre-line' }}>
                          {msg.message}
                        </Typography>
                      </Paper>
                    </Box>

                    {/* Quick Reply Form Field Block */}
                    <Box sx={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-end' }}>
                      <TextField 
                        fullWidth
                        multiline
                        maxRows={4}
                        variant="outlined"
                        placeholder={`Draft secure communication back to ${msg.student_name}...`}
                        value={replyText[msg.id] || ''}
                        onChange={(e) => handleReplyChange(msg.id, e.target.value)}
                        InputProps={{
                          sx: {
                            borderRadius: '12px',
                            fontSize: '0.875rem',
                            fontWeight: '500',
                            background: '#ffffff',
                            '& fieldset': { borderColor: '#e2e8f0' },
                            '&:hover fieldset': { borderColor: '#cbd5e1 !important' },
                            '&.Mui-focused fieldset': { borderColor: '#3B592D !important' }
                          }
                        }}
                      />

                      <Box sx={{ display: 'flex', gap: '0.5rem' }}>
                        <Tooltip title="Send Direct Email Response" arrow>
                          <Button
                            variant="contained"
                            disableElevation
                            onClick={() => handleReplySubmit(msg)}
                            sx={{
                              background: '#3B592D',
                              color: '#ffffff',
                              borderRadius: '12px',
                              minWidth: '48px',
                              width: '48px',
                              height: '48px',
                              p: 0,
                              '&:hover': { background: '#2c4222' }
                            }}
                          >
                            <ReplyIcon sx={{ fontSize: '1.25rem' }} />
                          </Button>
                        </Tooltip>

                        <Tooltip title="Discard Form Log Record" arrow>
                          <Button
                            variant="outlined"
                            onClick={() => handleDeleteMessage(msg.id)}
                            sx={{
                              borderColor: '#fee2e2',
                              background: '#fef2f2',
                              color: '#ef4444',
                              borderRadius: '12px',
                              minWidth: '48px',
                              width: '48px',
                              height: '48px',
                              p: 0,
                              '&:hover': {
                                background: '#ffeeee',
                                borderColor: '#fca5a5',
                                color: '#dc2626'
                              }
                            }}
                          >
                            <DeleteOutlinedIcon sx={{ fontSize: '1.25rem' }} />
                          </Button>
                        </Tooltip>
                      </Box>
                    </Box>

                  </Grid>
                </Grid>

              </Paper>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default AdminQueriesPage;
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Card,
  CardContent,
  Stack,
  TextField,
  InputAdornment,
  Chip,
  Avatar
} from '@mui/material';

// Icons
import SearchIcon from '@mui/icons-material/Search';
import CampaignRoundedIcon from '@mui/icons-material/CampaignRounded';
import EventNoteRoundedIcon from '@mui/icons-material/EventNoteRounded';
import RecordVoiceOverRoundedIcon from '@mui/icons-material/RecordVoiceOverRounded';

export default function StudentAnnouncementPage() {
  const [announcements, setAnnouncements] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  const backendUrl = import.meta.env.VITE_API_URL;

  // Fetch all system announcements broadcasted by Admin
  const fetchAnnouncements = async () => {
    try {
      const response = await fetch(`${backendUrl}/api/announcements/all`);
      const data = await response.json();
      if (response.ok && data.success) {
        setAnnouncements(data.announcements || []);
      }
    } catch (error) {
      console.error('Error fetching announcements:', error);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  // Filter announcements based on user search query
  const filteredAnnouncements = announcements.filter((ann) =>
    ann.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ann.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Box sx={{ width: '100%', maxWidth: '1000px', mx: 'auto', px: { xs: 1, sm: 2 } }}>
      
      {/* HEADER HERO SECTION */}
      <Box 
        sx={{ 
          mb: 4, 
          p: { xs: 3, sm: 4 }, 
          borderRadius: '20px', 
          background: 'linear-gradient(135deg, #3B592D 0%, #2c4322 100%)',
          color: '#ffffff',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 8px 24px rgba(59, 89, 45, 0.15)'
        }}
      >
        <Box sx={{ position: 'relative', zIndex: 2 }}>
          <Chip 
            label="Notice Board" 
            size="small" 
            sx={{ 
              bgcolor: 'rgba(255, 255, 255, 0.2)', 
              color: '#ffffff', 
              fontWeight: '700', 
              mb: 2,
              backdropFilter: 'blur(4px)'
            }} 
          />
          <Typography 
            variant="h4" 
            sx={{ 
              fontWeight: '800', 
              mb: 1,
              fontSize: { xs: '1.8rem', sm: '2.5rem' },
              letterSpacing: '-0.5px'
            }}
          >
            Campus & Course Updates
          </Typography>
          <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)', maxWidth: '600px', fontSize: '0.95rem' }}>
            Stay up to date with official announcements, schedule shifts, and system-wide modifications broadcasted by your administration.
          </Typography>
        </Box>
        
        {/* Decorative background icon */}
        <CampaignRoundedIcon 
          sx={{ 
            position: 'absolute', 
            right: '-20px', 
            bottom: '-20px', 
            fontSize: '180px', 
            color: 'rgba(255, 255, 255, 0.06)',
            transform: 'rotate(-15deg)'
          }} 
        />
      </Box>

      {/* SEARCH AND FILTER CONTROL UTILITY */}
      <Box sx={{ mb: 4 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search announcements by keywords..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: '#94a3b8' }} />
              </InputAdornment>
            ),
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: '14px',
              bgcolor: '#ffffff',
              border: '1px solid #e2e8f0',
              '& fieldset': { border: 'none' },
              boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
              '&.Mui-focused': {
                boxShadow: '0 4px 12px rgba(59, 89, 45, 0.08)',
                border: '1px solid #3B592D'
              }
            }
          }}
        />
      </Box>

      {/* ANNOUNCEMENTS TIMELINE FEED */}
      <Stack spacing={3}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 0.5 }}>
          <Typography variant="h6" sx={{ fontWeight: '800', color: '#1e293b', fontSize: '1.1rem' }}>
            Latest Broadcasts
          </Typography>
          <Chip 
            label={`${filteredAnnouncements.length} Total`} 
            variant="outlined" 
            size="small" 
            sx={{ fontWeight: '700', color: '#64748b', borderColor: '#e2e8f0' }} 
          />
        </Box>

        {filteredAnnouncements.length === 0 ? (
          <Paper 
            elevation={0} 
            sx={{ 
              p: 8, 
              textAlign: 'center', 
              borderRadius: '16px', 
              border: '1px solid #e2e8f0', 
              bgcolor: '#ffffff' 
            }}
          >
            <CampaignRoundedIcon sx={{ color: '#cbd5e1', fontSize: '3rem', mb: 1.5 }} />
            <Typography sx={{ color: '#64748b', fontWeight: '600', mb: 0.5 }}>
              All Quiet Here!
            </Typography>
            <Typography variant="body2" sx={{ color: '#94a3b8' }}>
              No active announcements match your search queries or have been published yet.
            </Typography>
          </Paper>
        ) : (
          filteredAnnouncements.map((ann) => (
            <Card 
              key={ann.id} 
              elevation={0} 
              sx={{ 
                borderRadius: '16px', 
                border: '1px solid #e2e8f0', 
                bgcolor: '#ffffff', 
                width: '100%',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': { 
                  transform: 'translateY(-2px)',
                  boxShadow: '0 6px 20px rgba(0,0,0,0.03)' 
                }
              }}
            >
              <CardContent sx={{ p: { xs: 2.5, sm: 4 }, '&:last-child': { pb: { xs: 2.5, sm: 4 } } }}>
                
                {/* CARD TOP BAR META DATA */}
                <Box 
                  sx={{ 
                    display: 'flex', 
                    flexDirection: { xs: 'column', sm: 'row' }, 
                    justifyContent: 'space-between', 
                    alignItems: { xs: 'flex-start', sm: 'center' }, 
                    gap: 2, 
                    mb: 2.5 
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Avatar 
                      sx={{ 
                        bgcolor: '#f1f5f9', 
                        color: '#3B592D',
                        width: 42,
                        height: 42,
                        border: '1px solid #e2e8f0'
                      }}
                    >
                      <RecordVoiceOverRoundedIcon fontSize="small" />
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: '800', color: '#0f172a', lineHeight: 1.2 }}>
                        Eduvantaa
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#3b592d', fontWeight: '700' }}>
                        Official Management
                      </Typography>
                    </Box>
                  </Box>

                  {/* DATE TIMESTAMP */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, color: '#94a3b8' }}>
                    <EventNoteRoundedIcon sx={{ fontSize: '1rem' }} />
                    <Typography variant="caption" sx={{ fontWeight: '500' }}>
                      {new Date(ann.created_at || ann.date).toLocaleString([], { 
                        dateStyle: 'medium', 
                        timeStyle: 'short' 
                      })}
                    </Typography>
                  </Box>
                </Box>

                {/* ANNOUNCEMENT HEADER TITLE */}
                <Typography 
                  variant="h6" 
                  sx={{ 
                    fontWeight: '800', 
                    color: '#0f172a', 
                    fontSize: '1.25rem', 
                    lineHeight: 1.4,
                    mb: 1.5
                  }}
                >
                  {ann.title}
                </Typography>

                {/* MAIN CONTENT TEXT BODY */}
                <Typography 
                  variant="body1" 
                  sx={{ 
                    color: '#334155', 
                    fontSize: '0.98rem', 
                    lineHeight: 1.7, 
                    whiteSpace: 'pre-wrap' 
                  }}
                >
                  {ann.content}
                </Typography>

              </CardContent>
            </Card>
          ))
        )}
      </Stack>
    </Box>
  );
}
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Card,
  CardContent,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack
} from '@mui/material';

// Icons
import CampaignIcon from '@mui/icons-material/Campaign';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import SendIcon from '@mui/icons-material/Send';

export default function AnnouncementPage() {
  const [announcements, setAnnouncements] = useState([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  
  // State for Editing
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');

  const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  // Fetch all system announcements
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

  // Submit a new global announcement
  const handleCreateAnnouncement = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    try {
      const token = localStorage.getItem('token');

const response = await fetch(
  `${backendUrl}/api/announcements/create`,
  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ title, content })
  }
);
      const data = await response.json();

      if (response.ok && data.success) {
        setTitle('');
        setContent('');
        fetchAnnouncements();
      } else {
        alert(data.message || 'Failed to create announcement');
      }
    } catch (error) {
      console.error('Error creating announcement:', error);
    }
  };

  // Open Edit Dialog modal window safely
  const handleOpenEdit = (announcement) => {
    setEditingAnnouncement(announcement);
    setEditTitle(announcement.title);
    setEditContent(announcement.content);
    setOpenEditDialog(true);
  };

  // Submit the update payload request
  const handleUpdateAnnouncement = async () => {

  if (
    !editTitle.trim() ||
    !editContent.trim()
  ) return;

  try {

    const token =
      localStorage.getItem('token');

    const response = await fetch(
      `${backendUrl}/api/announcements/update/${editingAnnouncement.id}`,
      {
        method: 'PUT',

        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },

        body: JSON.stringify({
          title: editTitle,
          content: editContent
        })
      }
    );

    const data = await response.json();

    if (
      response.ok &&
      data.success
    ) {

      setOpenEditDialog(false);

      setEditingAnnouncement(null);

      fetchAnnouncements();

    } else {

      alert(
        data.message ||
        'Failed to update announcement'
      );
    }

  } catch (error) {

    console.error(
      'Error updating announcement:',
      error
    );
  }
};

  // Delete item
  const handleDeleteAnnouncement = async (id) => {

  if (
    !window.confirm(
      'Are you sure you want to delete this global system announcement?'
    )
  ) return;

  try {

    const token =
      localStorage.getItem('token');

    const response = await fetch(
      `${backendUrl}/api/announcements/delete/${id}`,
      {
        method: 'DELETE',

        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    const data = await response.json();

    if (
      response.ok &&
      data.success
    ) {

      fetchAnnouncements();

    } else {

      alert(
        data.message ||
        'Failed to delete announcement'
      );
    }

  } catch (error) {

    console.error(
      'Error deleting announcement:',
      error
    );
  }
};

  return (
    <Box sx={{ width: '100%', maxWidth: '1200px', mx: 'auto' }}>
      {/* HEADER SECTION */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: '800', color: '#1e293b', mb: 0.5, fontSize: { xs: '1.75rem', md: '2.25rem' } }}>
          Global Announcements
        </Typography>
        <Typography variant="body2" sx={{ color: '#64748b' }}>
          Create and manage system-wide announcement updates visible to all users across the platform.
        </Typography>
      </Box>

      <Stack spacing={5}>
        {/* TOP SECTION: FULL WIDTH BROADCAST FORM */}
        <Paper
          elevation={0}
          component="form"
          onSubmit={handleCreateAnnouncement}
          sx={{
            p: { xs: 2.5, sm: 4 },
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            display: 'flex',
            flexDirection: 'column',
            gap: 3,
            bgcolor: '#ffffff'
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: '700', color: '#1e293b', display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <CampaignIcon sx={{ color: '#3B592D', fontSize: '1.75rem' }} /> Broadcast New Update
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.8 }}>
            <Typography sx={{ fontSize: '0.9rem', fontWeight: '700', color: '#0f172a' }}>Announcement Title *</Typography>
            <TextField
              fullWidth
              size="small"
              placeholder="e.g. Scheduled System Maintenance Notice"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px', '&.Mui-focused fieldset': { borderColor: '#3B592D' } } }}
            />
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.8 }}>
            <Typography sx={{ fontSize: '0.9rem', fontWeight: '700', color: '#0f172a' }}>Announcement Content *</Typography>
            <TextField
              fullWidth
              multiline
              rows={4}
              placeholder="Type your general information broadcast statement context here..."
              required
              value={content}
              onChange={(e) => setContent(e.target.value)}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px', '&.Mui-focused fieldset': { borderColor: '#3B592D' } } }}
            />
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              type="submit"
              variant="contained"
              startIcon={<SendIcon />}
              sx={{
                background: '#3B592D',
                borderRadius: '10px',
                px: 4,
                py: 1.2,
                fontWeight: '600',
                textTransform: 'none',
                boxShadow: 'none',
                width: { xs: '100%', sm: 'auto' }, // Full width button on mobile, auto on desktop
                '&:hover': { background: '#2c4322', boxShadow: 'none' }
              }}
            >
              Publish Update
            </Button>
          </Box>
        </Paper>

        {/* BOTTOM SECTION: FULL WIDTH CHRONOLOGY LOGS */}
        <Stack spacing={2.5}>
          <Typography variant="h6" sx={{ fontWeight: '700', color: '#1e293b' }}>
            Active Announcements ({announcements.length})
          </Typography>

          {announcements.length === 0 ? (
            <Paper elevation={0} sx={{ p: 6, textAlign: 'center', borderRadius: '12px', border: '1px solid #e2e8f0', bgcolor: '#ffffff' }}>
              <Typography sx={{ color: '#94a3b8', fontWeight: '500' }}>No announcements have been broadcasted yet.</Typography>
            </Paper>
          ) : (
            announcements.map((ann) => (
              <Card key={ann.id} elevation={0} sx={{ borderRadius: '12px', border: '1px solid #e2e8f0', bgcolor: '#ffffff', width: '100%', transition: 'box-shadow 0.2s', '&:hover': { boxShadow: '0 4px 12px rgba(0,0,0,0.03)' } }}>
                <CardContent sx={{ p: { xs: 2.5, sm: 3.5 }, '&:last-child': { pb: { xs: 2.5, sm: 3.5 } } }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 3, mb: 2 }}>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: '700', color: '#0f172a', fontSize: '1.2rem', lineHeight: 1.4 }}>
                        {ann.title}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#94a3b8', mt: 0.5, display: 'inline-block' }}>
                        {new Date(ann.created_at || ann.date).toLocaleString()}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      <IconButton size="small" onClick={() => handleOpenEdit(ann)} sx={{ color: '#64748b', '&:hover': { color: '#3B592D', bgcolor: '#f1f5f9' } }}>
                        <EditRoundedIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" onClick={() => handleDeleteAnnouncement(ann.id)} sx={{ color: '#64748b', '&:hover': { color: '#dc2626', bgcolor: '#fdf2f2' } }}>
                        <DeleteOutlineRoundedIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>

                  <Typography variant="body1" sx={{ color: '#334155', fontSize: '0.98rem', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                    {ann.content}
                  </Typography>
                </CardContent>
              </Card>
            ))
          )}
        </Stack>
      </Stack>

      {/* POPUP ACTION EDIT MODAL */}
      <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: '16px', p: 1 } }}>
        <DialogTitle sx={{ fontWeight: '700', color: '#1e293b' }}>Modify Announcement</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            <Typography sx={{ fontSize: '0.9rem', fontWeight: '700', color: '#0f172a' }}>Title</Typography>
            <TextField
              fullWidth
              size="small"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px', '&.Mui-focused fieldset': { borderColor: '#3B592D' } } }}
            />
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            <Typography sx={{ fontSize: '0.9rem', fontWeight: '700', color: '#0f172a' }}>Content Description</Typography>
            <TextField
              fullWidth
              multiline
              rows={5}
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px', '&.Mui-focused fieldset': { borderColor: '#3B592D' } } }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setOpenEditDialog(false)} sx={{ color: '#64748b', textTransform: 'none', fontWeight: '600' }}>Cancel</Button>
          <Button
            onClick={handleUpdateAnnouncement}
            variant="contained"
            sx={{ background: '#3B592D', color: '#ffffff', textTransform: 'none', fontWeight: '600', borderRadius: '8px', boxShadow: 'none', '&:hover': { background: '#2c4322', boxShadow: 'none' } }}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
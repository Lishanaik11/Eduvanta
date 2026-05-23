import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Autocomplete,
  IconButton,
  Stack,
  Chip,
  Collapse,
  Divider
} from '@mui/material';

// Icons
import NoteAddIcon from '@mui/icons-material/NoteAdd';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import MenuBookIcon from '@mui/icons-material/MenuBook';

export default function NotesPage() {

  const [notes, setNotes] = useState([]);
  const [courses, setCourses] = useState([]);

  const [expandedCourse, setExpandedCourse] = useState(null);

  const [openModal, setOpenModal] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState(null);

  const [noteTitle, setNoteTitle] = useState('');
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  const backendUrl =
    import.meta.env.VITE_API_URL || 'http://localhost:3000';

  /* =====================================================
      FETCH DATA
  ===================================================== */
  useEffect(() => {
    fetchNotes();
    fetchCourses();
  }, []);

  const fetchNotes = async () => {
    try {
      const response = await fetch(
        `${backendUrl}/api/course_notes/all`
      );
      const data = await response.json();
      console.log("NOTES RESPONSE:", data);

      if (response.ok && data.success) {
        setNotes(data.notes || []);
      } else {
        setNotes([]);
      }
    } catch (error) {
      console.error("Fetch Notes Error:", error);
      setNotes([]);
    }
  };

  const fetchCourses = async () => {
    try {
      const response = await fetch(
        `${backendUrl}/api/admin/courses`
      );
      const data = await response.json();

      if (response.ok && data.success) {
        setCourses(data.courses || []);
      }
    } catch (error) {
      console.error("Fetch Courses Error:", error);
    }
  };

  /* =====================================================
      GROUP NOTES BY COURSE
  ===================================================== */
  const groupedCourses = courses.map((course) => {
    const courseNotes = notes.filter(
      (note) => note.course_id === course.id
    );
    return {
      ...course,
      notes: courseNotes
    };
  });

  /* =====================================================
      OPEN CREATE MODAL
  ===================================================== */
  const handleOpenCreateModal = () => {
    setEditingNoteId(null);
    setNoteTitle('');
    setSelectedCourse(null);
    setSelectedFile(null);
    setOpenModal(true);
  };

  /* =====================================================
      OPEN EDIT MODAL
  ===================================================== */
  const handleOpenEditModal = (note) => {
    setEditingNoteId(note.id);
    setNoteTitle(note.title);

    const matchingCourse = courses.find(
      (c) => c.id === note.course_id
    );
    setSelectedCourse(matchingCourse || null);
    setSelectedFile(null);
    setOpenModal(true);
  };

  /* =====================================================
      DELETE NOTE
  ===================================================== */
  const handleDeleteNote = async (id) => {
    const confirmDelete = window.confirm(
      'Delete this note permanently?'
    );
    if (!confirmDelete) return;

    try {
      const response = await fetch(
        `${backendUrl}/api/course_notes/delete/${id}`,
        {
          method: 'DELETE'
        }
      );
      const data = await response.json();

      if (response.ok && data.success) {
        alert('Note deleted successfully');
        fetchNotes();
      }
    } catch (error) {
      console.error("Delete Note Error:", error);
    }
  };

  /* =====================================================
      SAVE NOTE
  ===================================================== */
  const handleSaveNoteForm = async (e) => {
    e.preventDefault();

    if (!noteTitle || !selectedCourse) {
      alert("Please fill all required fields");
      return;
    }

    const formData = new FormData();
    formData.append('title', noteTitle);
    formData.append('course_id', selectedCourse.id);

    if (selectedFile) {
      formData.append('note_file', selectedFile);
    }

    const targetUrl = editingNoteId
      ? `${backendUrl}/api/course_notes/edit/${editingNoteId}`
      : `${backendUrl}/api/course_notes/create`;

    const targetMethod = editingNoteId ? 'PUT' : 'POST';

    try {
      const response = await fetch(
        targetUrl,
        {
          method: targetMethod,
          body: formData
        }
      );
      const data = await response.json();

      if (response.ok && data.success) {
        alert(
          editingNoteId
            ? 'Note Updated Successfully'
            : 'Note Created Successfully'
        );
        setOpenModal(false);
        fetchNotes();
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error("Save Note Error:", error);
    }
  };

  return (
    <Box
      sx={{
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: '2rem'
      }}
    >

      {/* HEADER */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 2
        }}
      >
        <Box>
          <Typography
            variant="h4"
            sx={{
              fontWeight: '800',
              color: '#1e293b',
              letterSpacing: '-0.02em'
            }}
          >
            Course Study Notes Setup
          </Typography>
          <Typography
            sx={{
              color: '#64748b',
              mt: 0.5,
              fontSize: '0.95rem'
            }}
          >
            Organize notes course-wise for better management.
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<NoteAddIcon />}
          onClick={handleOpenCreateModal}
          sx={{
            background: '#3B592D',
            textTransform: 'none',
            fontWeight: '600',
            borderRadius: '12px',
            boxShadow: '0 4px 14px rgba(59, 89, 45, 0.25)',
            px: 3.5,
            py: 1.4,
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
              background: '#2f4724',
              boxShadow: '0 6px 20px rgba(59, 89, 45, 0.35)',
              transform: 'translateY(-1px)'
            }
          }}
        >
          Create New Note
        </Button>
      </Box>

      {/* COURSE CARDS */}
      <Stack spacing={3}>
        {groupedCourses.map((course) => {
          const isExpanded = expandedCourse === course.id;
          return (
            <Paper
              key={course.id}
              elevation={0}
              sx={{
                borderRadius: '16px',
                border: '1px solid #e2e8f0',
                background: '#ffffff',
                overflow: 'hidden',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: isExpanded 
                  ? '0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.03)' 
                  : '0 2px 4px rgba(0, 0, 0, 0.01)',
                '&:hover': {
                  borderColor: isExpanded ? '#e2e8f0' : '#cbd5e1'
                }
              }}
            >
              {/* COURSE HEADER */}
              <Box
                sx={{
                  p: 3,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  background: isExpanded ? '#fafafa' : '#ffffff',
                  transition: 'background 0.2s ease'
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box>
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: '700',
                        color: '#1e293b',
                        fontSize: '1.1rem'
                      }}
                    >
                      {course.title}
                    </Typography>
                    <Stack
                      direction="row"
                      spacing={1}
                      mt={1}
                    >
                      <Chip
                        icon={<MenuBookIcon style={{ fontSize: '16px', color: '#3B592D' }} />}
                        label={`${course.notes.length} Uploaded Notes`}
                        sx={{
                          background: '#eef6f0',
                          color: '#3B592D',
                          fontWeight: '700',
                          fontSize: '0.8rem',
                          height: '26px',
                          border: '1px solid rgba(59, 89, 45, 0.12)'
                        }}
                      />
                    </Stack>
                  </Box>
                </Box>

                <Button
                  endIcon={
                    isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />
                  }
                  onClick={() =>
                    setExpandedCourse(isExpanded ? null : course.id)
                  }
                  sx={{
                    color: '#3B592D',
                    fontWeight: '700',
                    textTransform: 'none',
                    fontSize: '0.9rem',
                    borderRadius: '8px',
                    px: 2,
                    py: 0.8,
                    '&:hover': {
                      background: '#eef6f0'
                    }
                  }}
                >
                  {isExpanded ? 'Hide Notes' : 'View Notes'}
                </Button>
              </Box>

              {/* NOTES LIST */}
              <Collapse in={isExpanded}>
                <Divider sx={{ borderColor: '#f1f5f9' }} />
                <Box sx={{ p: 3, background: '#f8fafc' }}>
                  {course.notes.length === 0 ? (
                    <Box 
                      sx={{ 
                        py: 3, 
                        display: 'flex', 
                        justifyContent: 'center', 
                        alignItems: 'center',
                        background: '#ffffff',
                        borderRadius: '12px',
                        border: '1px dashed #cbd5e1'
                      }}
                    >
                      <Typography
                        sx={{
                          color: '#94a3b8',
                          fontStyle: 'italic',
                          fontSize: '0.9rem'
                        }}
                      >
                        No notes uploaded for this course yet.
                      </Typography>
                    </Box>
                  ) : (
                    <Stack spacing={1.5}>
                      {course.notes.map((note) => (
                        <Paper
                          key={note.id}
                          elevation={0}
                          sx={{
                            p: 2,
                            borderRadius: '12px',
                            border: '1px solid #e2e8f0',
                            background: '#ffffff',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            flexWrap: 'wrap',
                            gap: 2,
                            transition: 'all 0.2s ease',
                            '&:hover': {
                              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.03)',
                              borderColor: '#cbd5e1'
                            }
                          }}
                        >
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                            <Typography
                              sx={{
                                fontWeight: '600',
                                color: '#1e293b',
                                fontSize: '0.95rem'
                              }}
                            >
                              {note.title}
                            </Typography>

                            {note.file_url && (
                              <Button
                                size="small"
                                startIcon={<InsertDriveFileIcon style={{ fontSize: '15px' }} />}
                                sx={{
                                  mt: 0.5,
                                  color: '#3B592D',
                                  textTransform: 'none',
                                  fontWeight: '600',
                                  fontSize: '0.825rem',
                                  alignSelf: 'flex-start',
                                  p: 0,
                                  minWidth: 'auto',
                                  '&:hover': {
                                    background: 'transparent',
                                    textDecoration: 'underline',
                                    color: '#2f4724'
                                  }
                                }}
                                onClick={() =>
                                  window.open(
                                    `${backendUrl}${note.file_url}`,
                                    '_blank'
                                  )
                                }
                              >
                                View Attachment Document
                              </Button>
                            )}
                          </Box>

                          <Stack direction="row" spacing={1}>
                            <IconButton
                              onClick={() => handleOpenEditModal(note)}
                              size="small"
                              sx={{
                                color: '#3B592D',
                                background: '#f0f4ef',
                                borderRadius: '8px',
                                p: 1,
                                '&:hover': {
                                  background: '#3B592D',
                                  color: '#ffffff'
                                }
                              }}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>

                            <IconButton
                              onClick={() => handleDeleteNote(note.id)}
                              size="small"
                              sx={{
                                color: '#ef4444',
                                background: '#fef2f2',
                                borderRadius: '8px',
                                p: 1,
                                '&:hover': {
                                  background: '#ef4444',
                                  color: '#ffffff'
                                }
                              }}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Stack>
                        </Paper>
                      ))}
                    </Stack>
                  )}
                </Box>
              </Collapse>
            </Paper>
          );
        })}
      </Stack>

      {/* MODAL */}
      <Dialog
        open={openModal}
        onClose={() => setOpenModal(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '20px',
            p: 1
          }
        }}
      >
        <DialogTitle
          sx={{
            fontWeight: '800',
            color: '#1e293b',
            fontSize: '1.25rem',
            pt: 2.5
          }}
        >
          {editingNoteId ? 'Modify Document Entry' : 'Create New Study Note'}
        </DialogTitle>

        <form onSubmit={handleSaveNoteForm}>
          <DialogContent>
            <Stack spacing={3} mt={0.5}>
              <TextField
                label="Note Title"
                placeholder="Enter a descriptive title for the note..."
                fullWidth
                value={noteTitle}
                onChange={(e) => setNoteTitle(e.target.value)}
                required
                variant="outlined"
                InputLabelProps={{ shrink: true }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                    '&.Mui-focused fieldset': { borderColor: '#3B592D' }
                  },
                  '& .MuiInputLabel-root.Mui-focused': { color: '#3B592D' }
                }}
              />

              <Autocomplete
                options={courses}
                getOptionLabel={(option) => option.title || ''}
                value={selectedCourse}
                onChange={(e, value) => setSelectedCourse(value)}
                isOptionEqualToValue={(a, b) => a.id === b.id}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Select Target Course"
                    placeholder="Type to filter courses dynamically..."
                    required
                    InputLabelProps={{ shrink: true }}
                  />
                )}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                    '&.Mui-focused fieldset': { borderColor: '#3B592D' }
                  },
                  '& .MuiInputLabel-root.Mui-focused': { color: '#3B592D' }
                }}
              />

              <Box>
                <Button
                  component="label"
                  variant="outlined"
                  startIcon={<CloudUploadIcon />}
                  fullWidth
                  sx={{
                    borderStyle: 'dashed',
                    borderWidth: '2px',
                    borderColor: '#3B592D',
                    color: '#3B592D',
                    textTransform: 'none',
                    fontWeight: '700',
                    borderRadius: '12px',
                    py: 2,
                    background: '#fcfdfe',
                    transition: 'all 0.2s',
                    '&:hover': {
                      borderStyle: 'dashed',
                      borderWidth: '2px',
                      borderColor: '#2f4724',
                      background: '#f4f8f3'
                    }
                  }}
                >
                  Upload Note Document File
                  <input
                    type="file"
                    hidden
                    accept=".pdf,.doc,.docx,.ppt,.pptx,.txt"
                    onChange={(e) => setSelectedFile(e.target.files[0])}
                  />
                </Button>

                {selectedFile && (
                  <Paper
                    variant="outlined"
                    sx={{
                      mt: 1.5,
                      p: 1.5,
                      borderRadius: '10px',
                      background: '#f8fafc',
                      borderColor: '#e2e8f0',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1.5
                    }}
                  >
                    <InsertDriveFileIcon sx={{ color: '#3B592D' }} />
                    <Typography
                      sx={{
                        color: '#334155',
                        fontSize: '0.85rem',
                        fontWeight: '600',
                        wordBreak: 'break-all'
                      }}
                    >
                      {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                    </Typography>
                  </Paper>
                )}
              </Box>
            </Stack>
          </DialogContent>

          <DialogActions sx={{ p: 3, pt: 1, gap: 1 }}>
            <Button
              onClick={() => setOpenModal(false)}
              sx={{
                color: '#64748b',
                fontWeight: '600',
                textTransform: 'none',
                fontSize: '0.9rem',
                borderRadius: '8px',
                px: 2,
                '&:hover': { background: '#f1f5f9' }
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              sx={{
                background: '#3B592D',
                textTransform: 'none',
                fontWeight: '600',
                fontSize: '0.9rem',
                borderRadius: '10px',
                px: 3,
                py: 1,
                boxShadow: '0 4px 12px rgba(59, 89, 45, 0.15)',
                '&:hover': {
                  background: '#2f4724',
                  boxShadow: '0 6px 16px rgba(59, 89, 45, 0.25)'
                }
              }}
            >
              Save Note
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}
import React, { useEffect, useState } from 'react';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';

import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';

const AdminCourses = () => {
  const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  const [courses, setCourses] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    category: '',
    description: '',
    lessons: [
      {
        title: '',
        content: '',
        videoId: '',
        quiz: [
          {
            question: '',
            options: ['', ''],
            answer: ''
          }
        ]
      }
    ]
  });

  /* =====================================================
      FETCH COURSES
  ===================================================== */
  const fetchCourses = async () => {
    try {
      const response = await fetch(`${backendUrl}/api/admin/courses`);
      const data = await response.json();
      if (data.success) {
        setCourses(data.courses);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  /* =====================================================
      HANDLE COURSE INPUTS
  ===================================================== */
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  /* =====================================================
      LESSON INPUTS
  ===================================================== */
  const handleLessonChange = (lessonIndex, field, value) => {
    const updatedLessons = [...formData.lessons];
    updatedLessons[lessonIndex][field] = value;
    setFormData({
      ...formData,
      lessons: updatedLessons
    });
  };

  /* =====================================================
      QUIZ INPUTS
  ===================================================== */
  const handleQuizQuestionChange = (lessonIndex, quizIndex, field, value) => {
    const updatedLessons = [...formData.lessons];
    updatedLessons[lessonIndex].quiz[quizIndex][field] = value;
    setFormData({
      ...formData,
      lessons: updatedLessons
    });
  };

  /* =====================================================
      QUIZ OPTION CHANGE
  ===================================================== */
  const handleQuizOptionChange = (lessonIndex, quizIndex, optionIndex, value) => {
    const updatedLessons = [...formData.lessons];
    updatedLessons[lessonIndex].quiz[quizIndex].options[optionIndex] = value;
    setFormData({
      ...formData,
      lessons: updatedLessons
    });
  };

  /* =====================================================
      ADD LESSON
  ===================================================== */
  const addLesson = () => {
    setFormData({
      ...formData,
      lessons: [
        ...formData.lessons,
        {
          title: '',
          content: '',
          videoId: '',
          quiz: [
            {
              question: '',
              options: ['', ''],
              answer: ''
            }
          ]
        }
      ]
    });
  };

  /* =====================================================
      DELETE LESSON
  ===================================================== */
  const deleteLesson = (lessonIndex) => {
    const updatedLessons = formData.lessons.filter((_, index) => index !== lessonIndex);
    setFormData({
      ...formData,
      lessons: updatedLessons
    });
  };

  const addQuizOption = (lessonIndex, quizIndex) => {
    const updatedLessons = [...formData.lessons];
    updatedLessons[lessonIndex].quiz[quizIndex].options.push('');
    setFormData({
      ...formData,
      lessons: updatedLessons
    });
  };

  const deleteQuizOption = (lessonIndex, quizIndex, optionIndex) => {
    const updatedLessons = [...formData.lessons];
    updatedLessons[lessonIndex].quiz[quizIndex].options = updatedLessons[lessonIndex].quiz[quizIndex].options.filter(
      (_, index) => index !== optionIndex
    );
    setFormData({
      ...formData,
      lessons: updatedLessons
    });
  };

  /* =====================================================
      ADD QUIZ
  ===================================================== */
  const addQuiz = (lessonIndex) => {
    const updatedLessons = [...formData.lessons];
    updatedLessons[lessonIndex].quiz.push({
      question: '',
      options: ['', ''],
      answer: ''
    });
    setFormData({
      ...formData,
      lessons: updatedLessons
    });
  };

  /* =====================================================
      DELETE QUIZ
  ===================================================== */
  const deleteQuiz = (lessonIndex, quizIndex) => {
    const updatedLessons = [...formData.lessons];
    updatedLessons[lessonIndex].quiz = updatedLessons[lessonIndex].quiz.filter((_, index) => index !== quizIndex);
    setFormData({
      ...formData,
      lessons: updatedLessons
    });
  };

  /* =====================================================
      SUBMIT
  ===================================================== */
  const handleSubmit = async () => {
    try {
      let url = `${backendUrl}/api/admin/courses/create`;
      let method = 'POST';

      if (editingId) {
        url = `${backendUrl}/api/admin/courses/update/${editingId}`;
        method = 'PUT';
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        alert(data.message);
        fetchCourses();
        setEditingId(null);
        setShowForm(false);
        setFormData({
          title: '',
          category: '',
          description: '',
          lessons: [
            {
              title: '',
              content: '',
              videoId: '',
              quiz: [
                {
                  question: '',
                  options: ['', ''],
                  answer: ''
                }
              ]
            }
          ]
        });
      }
    } catch (error) {
      console.error(error);
    }
  };

  /* =====================================================
      DELETE COURSE
  ===================================================== */
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm('Delete course?');
    if (!confirmDelete) return;

    try {
      const response = await fetch(`${backendUrl}/api/admin/courses/delete/${id}`, {
        method: 'DELETE'
      });
      const data = await response.json();
      if (data.success) {
        fetchCourses();
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Box sx={{ padding: { xs: '1rem', sm: '1.5rem', md: '2.5rem' }, backgroundColor: '#f8fafc', minHeight: '100vh', boxSizing: 'border-box' }}>
      
      {/* HEADER SECTION */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', sm: 'center' },
          gap: '1.5rem',
          marginBottom: '2.5rem'
        }}
      >
        <Box>
          <Typography variant="h4" sx={{ fontWeight: '800', color: '#0f172a', letterSpacing: '-0.025em', fontSize: { xs: '1.75rem', sm: '2rem', md: '2.125rem' } }}>
            Courses Management
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748b', marginTop: '0.25rem' }}>
            Create, compile, and manage institutional curricular training structures.
          </Typography>
        </Box>

        <Button
          variant="contained"
          fullWidth={false}
          startIcon={<AddIcon />}
          onClick={() => setShowForm(!showForm)}
          sx={{
            background: '#3B592D',
            textTransform: 'none',
            borderRadius: '10px',
            fontWeight: '600',
            boxShadow: '0 4px 12px rgba(59, 89, 45, 0.2)',
            padding: '0.6rem 1.5rem',
            width: { xs: '100%', sm: 'auto' }, // Full width button on phone screens
            '&:hover': {
              background: '#2f4725',
              boxShadow: '0 6px 16px rgba(59, 89, 45, 0.3)'
            }
          }}
        >
          {showForm ? 'Hide Creator Form' : 'Create New Course'}
        </Button>
      </Box>

      {/* COMPILATION FORM SHEET */}
      {showForm && (
        <Paper
          elevation={0}
          sx={{
            padding: { xs: '1.25rem', sm: '1.75rem', md: '2.5rem' },
            borderRadius: '20px',
            marginBottom: '3rem',
            border: '1px solid #e2e8f0',
            boxShadow: '0 10px 30px -5px rgba(0,0,0,0.05)'
          }}
        >
          <Typography sx={{ fontWeight: '800', fontSize: '1.4rem', color: '#1e293b', marginBottom: '1.5rem' }}>
            {editingId ? 'Modify Curricular Structure' : 'Course Information Setup'}
          </Typography>

          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <TextField
                fullWidth
                label="Course Title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                variant="outlined"
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                variant="outlined"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Course Synopsis / Description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                variant="outlined"
              />
            </Grid>
          </Grid>

          <Divider sx={{ marginY: '2.5rem', borderColor: '#e2e8f0' }} />

          {/* DYNAMIC LESSON TRACKING ARRAY */}
          <Typography sx={{ fontWeight: '800', fontSize: '1.3rem', color: '#1e293b', marginBottom: '1.5rem' }}>
            Lessons Syllabus
          </Typography>

          {formData.lessons.map((lesson, lessonIndex) => (
            <Paper
              key={lessonIndex}
              elevation={0}
              sx={{
                padding: { xs: '1rem', sm: '1.5rem', md: '2rem' },
                marginBottom: '2.5rem',
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                borderLeft: '5px solid #3B592D',
                borderRadius: '16px',
                position: 'relative'
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <Typography sx={{ fontWeight: '700', fontSize: '1.1rem', color: '#3B592D' }}>
                  Lesson Block #{lessonIndex + 1}
                </Typography>

                <IconButton
                  color="error"
                  onClick={() => deleteLesson(lessonIndex)}
                  sx={{
                    backgroundColor: '#fef2f2',
                    '&:hover': { backgroundColor: '#fee2e2' },
                    borderRadius: '8px',
                    padding: '8px'
                  }}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Box>

              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Lesson Title"
                    value={lesson.title}
                    onChange={(e) => handleLessonChange(lessonIndex, 'title', e.target.value)}
                  />
                </Grid>

          <Grid item xs={12}>
  <TextField
    fullWidth
    multiline
    rows={6}
    label="Lesson Text Content"
    value={lesson.content}
    onChange={(e) =>
      handleLessonChange(lessonIndex, 'content', e.target.value)
    }
    sx={{
      '& .MuiInputBase-inputMultiline': {
        whiteSpace: 'pre-wrap'
      }
    }}
  />
</Grid>
              </Grid>

              {/* NESTED ASSESSMENT MODULE ARRAY */}
              <Box sx={{ marginTop: '2rem', paddingLeft: { xs: '0.25rem', sm: '1rem', md: '1.5rem' }, borderLeft: '2px dashed #cbd5e1' }}>
                <Typography sx={{ fontWeight: '700', fontSize: '1rem', color: '#475569', marginBottom: '1rem' }}>
                  Associated Knowledge Evaluation Questions
                </Typography>

                {lesson.quiz.map((quiz, quizIndex) => (
                  <Paper
                    key={quizIndex}
                    elevation={0}
                    sx={{
                      padding: { xs: '1rem', sm: '1.25rem' },
                      marginBottom: '1.25rem',
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderLeft: '4px solid #58a533',
                      borderRadius: '12px'
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                      <Typography sx={{ fontWeight: '600', fontSize: '0.9rem', color: '#58a533' }}>
                        Question Unit {quizIndex + 1}
                      </Typography>

                      <IconButton
                        color="error"
                        onClick={() => deleteQuiz(lessonIndex, quizIndex)}
                        sx={{ padding: '4px' }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>

                    <TextField
                      fullWidth
                      label="Evaluation Question String"
                      value={quiz.question}
                      onChange={(e) => handleQuizQuestionChange(lessonIndex, quizIndex, 'question', e.target.value)}
                      sx={{ marginBottom: '1.25rem', backgroundColor: '#ffffff' }}
                    />

                    <Typography sx={{ fontWeight: '600', fontSize: '0.85rem', color: '#64748b', marginBottom: '0.75rem' }}>
                      Answer Options Configuration
                    </Typography>

                    {quiz.options.map((option, optionIndex) => (
                      <Box key={optionIndex} sx={{ display: 'flex', gap: '0.5rem', sm: '0.75rem', marginBottom: '0.75rem', alignItems: 'center' }}>
                        <TextField
                          fullWidth
                          size="small"
                          label={`Option ${optionIndex + 1}`}
                          value={option}
                          onChange={(e) => handleQuizOptionChange(lessonIndex, quizIndex, optionIndex, e.target.value)}
                          sx={{ backgroundColor: '#ffffff' }}
                        />
                        <IconButton
                          color="error"
                          onClick={() => deleteQuizOption(lessonIndex, quizIndex, optionIndex)}
                          disabled={quiz.options.length <= 2}
                          sx={{ padding: '6px' }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    ))}

                    <Box sx={{ display: 'flex', gap: '1rem', flexDirection: { xs: 'column', sm: 'row' }, alignItems: { xs: 'stretch', sm: 'center' }, marginTop: '1rem' }}>
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<AddIcon />}
                        onClick={() => addQuizOption(lessonIndex, quizIndex)}
                        sx={{ textTransform: 'none', borderColor: '#cbd5e1', color: '#475569', borderRadius: '6px', height: '40px', whiteSpace: 'nowrap' }}
                      >
                        Add Answer Option
                      </Button>

                      <TextField
                        size="small"
                        label="Exact Correct Match Value"
                        value={quiz.answer}
                        onChange={(e) => handleQuizQuestionChange(lessonIndex, quizIndex, 'answer', e.target.value)}
                        sx={{ flexGrow: 1, minWidth: { xs: '100%', sm: '200px' }, backgroundColor: '#ffffff' }}
                      />
                    </Box>
                  </Paper>
                ))}

                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<AddIcon />}
                  onClick={() => addQuiz(lessonIndex)}
                  sx={{
                    marginTop: '0.5rem',
                    textTransform: 'none',
                    color: '#58a533',
                    borderColor: '#58a533',
                    borderRadius: '8px',
                    width: { xs: '100%', sm: 'auto' },
                    '&:hover': { borderColor: '#468428', backgroundColor: '#f0fdf4' }
                  }}
                >
                  Add Evaluation Card
                </Button>
              </Box>
            </Paper>
          ))}

          {/* FORM ACTION FOOTER REGION */}
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', gap: '1rem', marginTop: '3rem' }}>
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={addLesson}
              sx={{
                textTransform: 'none',
                color: '#3B592D',
                borderColor: '#3B592D',
                borderRadius: '10px',
                fontWeight: '600',
                padding: '0.75rem 1.75rem',
                width: { xs: '100%', sm: 'auto' },
                '&:hover': { borderColor: '#2f4725', backgroundColor: '#f4f6f3' }
              }}
            >
              Append Lesson Block
            </Button>

            <Button
              variant="contained"
              onClick={handleSubmit}
              sx={{
                background: '#3B592D',
                textTransform: 'none',
                padding: '0.75rem 2.5rem',
                borderRadius: '10px',
                fontWeight: '600',
                width: { xs: '100%', sm: 'auto' },
                boxShadow: '0 4px 12px rgba(59, 89, 45, 0.15)',
                '&:hover': { background: '#2f4725' }
              }}
            >
              {editingId ? 'Push Structural Renewal Updates' : 'Commit & Launch Course Blueprint'}
            </Button>
          </Box>
        </Paper>
      )}

      {/* REPOSITORY GRID SHEETS */}
      <Typography variant="h5" sx={{ fontWeight: '800', color: '#1e293b', marginBottom: '1.5rem', letterSpacing: '-0.02em' }}>
        Active Course Rosters ({courses.length})
      </Typography>

      <Grid container spacing={3}>
        {courses.map((course) => (
          <Grid item xs={12} sm={6} md={6} lg={4} key={course.id}>
            <Paper
              elevation={0}
              sx={{
                padding: { xs: '1.5rem', sm: '2rem' },
                borderRadius: '18px',
                border: '1px solid #e2e8f0',
                backgroundColor: '#ffffff',
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 12px 24px -10px rgba(0,0,0,0.08)'
                }
              }}
            >
              <Box sx={{ flexGrow: 1 }}>
                <Typography sx={{ fontWeight: '800', fontSize: '1.25rem', color: '#0f172a', marginBottom: '0.5rem', lineHeight: '1.4' }}>
                  {course.title}
                </Typography>

                <Box
                  sx={{
                    display: 'inline-block',
                    backgroundColor: '#e8f5e9',
                    color: '#3B592D',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '6px',
                    fontWeight: '700',
                    fontSize: '0.75rem',
                    marginBottom: '1.25rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}
                >
                  {course.category}
                </Box>

                <Typography
  sx={{
    color: '#475569',
    fontSize: '0.925rem',
    marginBottom: '2rem',
    lineHeight: '1.6',
    whiteSpace: 'pre-line', // IMPORTANT
    display: '-webkit-box',
    WebkitLineClamp: 3,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden'
  }}
>
  {course.description}
</Typography>
              </Box>

              <Divider sx={{ marginY: '1.25rem', borderColor: '#f1f5f9' }} />

              <Box sx={{ display: 'flex', gap: '0.75rem', marginTop: 'auto' }}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<EditIcon size={16} />}
                  onClick={async () => {
                    try {
                      const response = await fetch(`${backendUrl}/api/admin/courses/${course.id}`);
                      const data = await response.json();

                      if (data.success) {
                        const courseData = data.course;
                        setEditingId(course.id);
                        setFormData({
                          title: courseData.title || '',
                          category: courseData.category || '',
                          description: courseData.description || '',
                          lessons: courseData.lessons?.length > 0 ? courseData.lessons : [
                            {
                              title: '',
                              content: '',
                              videoId: '',
                              quiz: [
                                {
                                  question: '',
                                  options: ['', ''],
                                  answer: ''
                                }
                              ]
                            }
                          ]
                        });
                        setShowForm(true);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }
                    } catch (error) {
                      console.error(error);
                    }
                  }}
                  sx={{ textTransform: 'none', borderRadius: '8px', fontWeight: '600', borderColor: '#cbd5e1', color: '#334155', '&:hover': { borderColor: '#94a3b8', backgroundColor: '#f8fafc' } }}
                >
                  Edit
                </Button>

                <Button
                  fullWidth
                  variant="outlined"
                  color="error"
                  startIcon={<DeleteIcon size={16} />}
                  onClick={() => handleDelete(course.id)}
                  sx={{ textTransform: 'none', borderRadius: '8px', fontWeight: '600', '&:hover': { backgroundColor: '#fef2f2' } }}
                >
                  Delete
                </Button>
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default AdminCourses;
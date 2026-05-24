import React, { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Divider from '@mui/material/Divider';
import Alert from '@mui/material/Alert';

import ContactSupportIcon from '@mui/icons-material/ContactSupport';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import SendIcon from '@mui/icons-material/Send';
import Chip from '@mui/material/Chip';
import ReplyIcon from '@mui/icons-material/Reply';

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const [success, setSuccess] = useState(false);
  const [messages, setMessages] = useState([]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const fetchMessages = async () => {

  try {

    const storedUser = JSON.parse(
      localStorage.getItem('user')
    );

    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/api/contact/messages`
    );

    const data = await response.json();

    if (response.ok) {

      const userMessages = data.messages.filter(
        (msg) => msg.user_id === storedUser.id
      );

      setMessages(userMessages);

    }

  } catch (error) {

    console.error(
      '❌ Fetch Messages Error:',
      error
    );

  }

}; 

useEffect(() => {
  fetchMessages();
}, []);

const handleSubmit = async (e) => {
  e.preventDefault();

  try {

    const storedUser = JSON.parse(
      localStorage.getItem('user')
    );

    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/api/auth/contact/send`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },

        body: JSON.stringify({
          userId: storedUser.id,
          studentName: storedUser.name,
          studentEmail: storedUser.email,
          subject: formData.subject,
          message: formData.message
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      alert(data.message || 'Failed to send message');
      return;
    }

    setSuccess(true);
    fetchMessages();

    setFormData({
      name: '',
      email: '',
      subject: '',
      message: ''
    });

    setTimeout(() => {
      setSuccess(false);
    }, 4000);

  } catch (error) {

    console.error('❌ Contact Error:', error);

    alert('Server error while sending message.');
  }
};
  return (
    <Box>
      {/* PAGE HEADER */}
      <Box sx={{ marginBottom: '2.5rem' }}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: '800',
            color: '#1e293b',
            marginBottom: '0.5rem'
          }}
        >
          Contact Support
        </Typography>

        <Typography
          sx={{
            color: '#64748b',
            fontWeight: '500'
          }}
        >
          Need help? Reach out to our support team anytime.
        </Typography>
      </Box>

      <Grid container spacing={4}>
        {/* LEFT CONTACT INFO */}
        <Grid item xs={12} md={5}>
          <Paper
            elevation={0}
            sx={{
              padding: '2rem',
              borderRadius: '16px',
              border: '1px solid #e2e8f0',
              height: '100%'
            }}
          >
            <Box
              sx={{
                width: '70px',
                height: '70px',
                borderRadius: '18px',
                background: '#eef6f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1.5rem'
              }}
            >
              <ContactSupportIcon
                sx={{
                  fontSize: '2rem',
                  color: '#3B592D'
                }}
              />
            </Box>

            <Typography
              variant="h5"
              sx={{
                fontWeight: '700',
                color: '#1e293b',
                marginBottom: '0.75rem'
              }}
            >
              Get In Touch
            </Typography>

            <Typography
              sx={{
                color: '#64748b',
                lineHeight: 1.8,
                marginBottom: '2rem'
              }}
            >
              Our academic and technical support team is available
              to assist you regarding courses, certificates,
              assignments, and account-related issues.
            </Typography>

            <Divider sx={{ marginBottom: '2rem' }} />

            {/* EMAIL */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                marginBottom: '1.5rem'
              }}
            >
              <Box
                sx={{
                  width: '45px',
                  height: '45px',
                  borderRadius: '12px',
                  background: '#f1f5f9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <EmailIcon sx={{ color: '#3B592D' }} />
              </Box>

              <Box>
                <Typography
                  sx={{
                    fontWeight: '700',
                    color: '#1e293b'
                  }}
                >
                  Email
                </Typography>

                <Typography sx={{ color: '#64748b' }}>
                  support@eduvantaa.com
                </Typography>
              </Box>
            </Box>

            {/* PHONE */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                marginBottom: '1.5rem'
              }}
            >
              <Box
                sx={{
                  width: '45px',
                  height: '45px',
                  borderRadius: '12px',
                  background: '#f1f5f9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <PhoneIcon sx={{ color: '#3B592D' }} />
              </Box>

              <Box>
                <Typography
                  sx={{
                    fontWeight: '700',
                    color: '#1e293b'
                  }}
                >
                  Phone
                </Typography>

                <Typography sx={{ color: '#64748b' }}>
                  +91 9876543210
                </Typography>
              </Box>
            </Box>

            {/* LOCATION */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem'
              }}
            >
              <Box
                sx={{
                  width: '45px',
                  height: '45px',
                  borderRadius: '12px',
                  background: '#f1f5f9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <LocationOnIcon sx={{ color: '#3B592D' }} />
              </Box>

              <Box>
                <Typography
                  sx={{
                    fontWeight: '700',
                    color: '#1e293b'
                  }}
                >
                  Office
                </Typography>

                <Typography sx={{ color: '#64748b' }}>
                  Navi Mumbai, Maharashtra
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* RIGHT CONTACT FORM */}
        <Grid item xs={12} md={7}>
          <Paper
            elevation={0}
            sx={{
              padding: '2rem',
              borderRadius: '16px',
              border: '1px solid #e2e8f0'
            }}
          >
            <Typography
              variant="h5"
              sx={{
                fontWeight: '700',
                color: '#1e293b',
                marginBottom: '1.5rem'
              }}
            >
              Send a Message
            </Typography>

            {success && (
              <Alert
                severity="success"
                sx={{ marginBottom: '1.5rem' }}
              >
                Your message has been submitted successfully.
              </Alert>
            )}

            <Box
              component="form"
              onSubmit={handleSubmit}
              sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: '1.5rem'
              }}
            >
              <TextField
                label="Full Name"
                name="name"
                fullWidth
                required
                value={formData.name}
                onChange={handleChange}
              />

              <TextField
                label="Email Address"
                name="email"
                type="email"
                fullWidth
                required
                value={formData.email}
                onChange={handleChange}
              />

              <TextField
                label="Subject"
                name="subject"
                fullWidth
                required
                value={formData.subject}
                onChange={handleChange}
              />

              <TextField
                label="Message"
                name="message"
                multiline
                rows={6}
                fullWidth
                required
                value={formData.message}
                onChange={handleChange}
              />

              <Button
                type="submit"
                variant="contained"
                startIcon={<SendIcon />}
                sx={{
                  background: '#3B592D',
                  textTransform: 'none',
                  padding: '0.85rem',
                  borderRadius: '10px',
                  fontWeight: '700',
                  '&:hover': {
                    background: '#2c4422'
                  }
                }}
              >
                Send Message
              </Button>
            </Box>
          </Paper>
        </Grid>
        {/* USER SUPPORT HISTORY */}
<Grid item xs={12}>

  <Paper
    elevation={0}
    sx={{
      padding: '2rem',
      borderRadius: '16px',
      border: '1px solid #e2e8f0'
    }}
  >

    <Typography
      variant="h5"
      sx={{
        fontWeight: '700',
        color: '#1e293b',
        marginBottom: '1.5rem'
      }}
    >
      Your Support Messages & Replies
    </Typography>

    {messages.length === 0 ? (

      <Typography sx={{ color: '#64748b' }}>
        No support messages found.
      </Typography>

    ) : (

      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem'
        }}
      >

        {messages.map((msg) => (

          <Paper
            key={msg.id}
            elevation={0}
            sx={{
              padding: '1.5rem',
              borderRadius: '14px',
              border: '1px solid #e2e8f0',
              background: '#ffffff'
            }}
          >

            {/* SUBJECT + STATUS */}
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '0.8rem'
              }}
            >

              <Typography
                sx={{
                  fontWeight: '700',
                  color: '#1e293b',
                  fontSize: '1rem'
                }}
              >
                {msg.subject}
              </Typography>

              <Chip
                label={msg.reply_status}
                color={
                  msg.reply_status === 'Replied'
                    ? 'success'
                    : 'warning'
                }
                size="small"
              />

            </Box>

            {/* USER MESSAGE */}
            <Typography
              sx={{
                color: '#475569',
                lineHeight: 1.8,
                marginBottom: '1rem'
              }}
            >
              {msg.message}
            </Typography>

            {/* DATE */}
            <Typography
              sx={{
                fontSize: '0.8rem',
                color: '#94a3b8',
                marginBottom: '1rem'
              }}
            >
              Sent on{' '}
              {new Date(msg.created_at).toLocaleString()}
            </Typography>

            {/* ADMIN REPLY */}
            {msg.admin_reply ? (

              <Box
                sx={{
                  background: '#f8fafc',
                  padding: '1rem',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0'
                }}
              >

                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    marginBottom: '0.75rem'
                  }}
                >

                  <ReplyIcon
                    sx={{
                      color: '#3B592D',
                      fontSize: '1.1rem'
                    }}
                  />

                  <Typography
                    sx={{
                      fontWeight: '700',
                      color: '#1e293b'
                    }}
                  >
                    Admin Reply
                  </Typography>

                </Box>

                <Typography
                  sx={{
                    color: '#475569',
                    lineHeight: 1.7
                  }}
                >
                  {msg.admin_reply}
                </Typography>

                {msg.replied_at && (

                  <Typography
                    sx={{
                      marginTop: '0.75rem',
                      fontSize: '0.8rem',
                      color: '#94a3b8'
                    }}
                  >
                    Replied on{' '}
                    {new Date(
                      msg.replied_at
                    ).toLocaleString()}
                  </Typography>

                )}

              </Box>

            ) : (

              <Typography
                sx={{
                  color: '#f59e0b',
                  fontWeight: '600'
                }}
              >
                Awaiting admin reply...
              </Typography>

            )}

          </Paper>

        ))}

      </Box>

    )}

  </Paper>

</Grid>
      </Grid>
    </Box>
  );
};

export default ContactPage;
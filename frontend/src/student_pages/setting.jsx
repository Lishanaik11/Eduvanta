import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Paper from '@mui/material/Paper';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import PhoneAndroidIcon from '@mui/icons-material/PhoneAndroid';
import LockIcon from '@mui/icons-material/Lock';
import EditIcon from '@mui/icons-material/Edit';
import CheckIcon from '@mui/icons-material/Check';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

const Setting = ({ userId }) => {
  // Enhanced state management matching local storage profile schemas 
  const [profile, setProfile] = useState({
    name: 'Student',
    email: 'student@eduvantaa.com',
    phone: 'Not Provided',
    password: '••••••••',
  });

  const [isEditing, setIsEditing] = useState({
    name: false,
    email: false,
    phone: false,
    password: false,
  });

  // State to handle password text masking toggle status
  const [showPassword, setShowPassword] = useState(false);

  // Load session credentials dynamically from LocalStorage
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        setProfile((prev) => ({
          ...prev,
          name: parsed.name || prev.name,
          email: parsed.email || prev.email,
          phone: parsed.phone || prev.phone,
          password: parsed.password ? '••••••••' : prev.password,
        }));
      } catch (e) {
        console.error("Failed to parse user session info for settings initialization:", e);
      }
    }
  }, [userId]);

  const handleInputChange = (field, value) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  const toggleEdit = (field) => {
    setIsEditing((prev) => {
      const updatedEditing = { ...prev, [field]: !prev[field] };
      
      // Clear placeholder if user enters edit mode so they can type cleanly
      if (field === 'password' && updatedEditing.password && profile.password === '••••••••') {
        setProfile(p => ({ ...p, password: '' }));
      }
      return updatedEditing;
    });

    // Reset eye visibility mask whenever user closes or toggles editing row
    if (field === 'password') {
      setShowPassword(false);
    }
  };

  const handleSavePreferences = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/auth/profile/update`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId,
            name: profile.name,
            email: profile.email,
            phone: profile.phone,
            password: profile.password === '••••••••' ? '' : profile.password,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("user", JSON.stringify(data.user));
        alert("🎉 Profile updated successfully!");

        setIsEditing({
          name: false,
          email: false,
          phone: false,
          password: false,
        });
        setShowPassword(false);
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to save profile");
    }
  };

  const handleUndoChanges = () => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      setProfile({
        name: parsed.name || 'Student',
        email: parsed.email || 'student@eduvantaa.com',
        phone: parsed.phone || 'Not Provided',
        password: '••••••••',
      });
    }
    setIsEditing({ name: false, username: false, email: false, phone: false, password: false });
    setShowPassword(false);
  };

  return (
    <Box>
      {/* Title Header Section */}
      <Box sx={{ marginBottom: '2.5rem' }}>
        <Typography variant="h4" sx={{ fontSize: '1.85rem', fontWeight: '800', color: '#1e293b', marginBottom: '0.5rem' }}>
          Account Settings
        </Typography>
        <Typography sx={{ color: '#64748b', fontSize: '0.95rem' }}>
          Update your public profile data, manage configuration variables, phone connections, and password credentials.
        </Typography>
      </Box>

      {/* Main Content Card Wrapper */}
      <Paper
        elevation={0}
        sx={{
          padding: { xs: '1.5rem', md: '2.5rem' },
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '16px',
          boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)',
          maxWidth: '800px'
        }}
      >
        <Box component="form" onSubmit={handleSavePreferences} sx={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* FIELD MODULE: NAME */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1, minWidth: '150px' }}>
              <AccountCircleIcon sx={{ color: '#94a3b8', fontSize: '1.4rem' }} />
              <Typography sx={{ fontWeight: '600', color: '#334155', fontSize: '0.95rem' }}>Full Name</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flex: 2, minWidth: '280px', justifyContent: 'flex-end' }}>
              {isEditing.name ? (
                <TextField
                  size="small"
                  value={profile.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  sx={{
                    width: '100%',
                    maxWidth: '350px',
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '10px',
                      '&.Mui-focused fieldset': { borderColor: '#3B592D' }
                    }
                  }}
                />
              ) : (
                <Typography sx={{ color: '#64748b', fontSize: '0.95rem', fontWeight: '500' }}>{profile.name}</Typography>
              )}
              <Button
                size="small"
                variant="text"
                onClick={() => toggleEdit('name')}
                startIcon={isEditing.name ? <CheckIcon sx={{ fontSize: '0.9rem' }} /> : <EditIcon sx={{ fontSize: '0.9rem' }} />}
                sx={{ color: '#3B592D', fontWeight: '700', textTransform: 'none', '&:hover': { background: '#f1f5f9' } }}
              >
                {isEditing.name ? 'Done' : 'Edit'}
              </Button>
            </Box>
          </Box>

          <Divider sx={{ borderColor: '#f1f5f9' }} />

         
          {/* FIELD MODULE: EMAIL */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1, minWidth: '150px' }}>
              <AccountCircleIcon sx={{ color: '#94a3b8', fontSize: '1.4rem' }} />
              <Typography sx={{ fontWeight: '600', color: '#334155', fontSize: '0.95rem' }}>Email Address</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flex: 2, minWidth: '280px', justifyContent: 'flex-end' }}>
              {isEditing.email ? (
                <TextField
                  size="small"
                  type="email"
                  value={profile.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  sx={{
                    width: '100%',
                    maxWidth: '350px',
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '10px',
                      '&.Mui-focused fieldset': { borderColor: '#3B592D' }
                    }
                  }}
                />
              ) : (
                <Typography sx={{ color: '#64748b', fontSize: '0.95rem', fontWeight: '500' }}>{profile.email}</Typography>
              )}
              <Button
                size="small"
                variant="text"
                onClick={() => toggleEdit('email')}
                startIcon={isEditing.email ? <CheckIcon sx={{ fontSize: '0.9rem' }} /> : <EditIcon sx={{ fontSize: '0.9rem' }} />}
                sx={{ color: '#3B592D', fontWeight: '700', textTransform: 'none', '&:hover': { background: '#f1f5f9' } }}
              >
                {isEditing.email ? 'Done' : 'Edit'}
              </Button>
            </Box>
          </Box>

          <Divider sx={{ borderColor: '#f1f5f9' }} />

          {/* FIELD MODULE: PHONE NUMBER */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1, minWidth: '150px' }}>
              <PhoneAndroidIcon sx={{ color: '#94a3b8', fontSize: '1.4rem' }} />
              <Typography sx={{ fontWeight: '600', color: '#334155', fontSize: '0.95rem' }}>Phone Number</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flex: 2, minWidth: '280px', justifyContent: 'flex-end' }}>
              {isEditing.phone ? (
                <TextField
                  size="small"
                  type="tel"
                  value={profile.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="e.g. +91 9876543210"
                  sx={{
                    width: '100%',
                    maxWidth: '350px',
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '10px',
                      '&.Mui-focused fieldset': { borderColor: '#3B592D' }
                    }
                  }}
                />
              ) : (
                <Typography sx={{ color: '#64748b', fontSize: '0.95rem', fontWeight: '500' }}>{profile.phone}</Typography>
              )}
              <Button
                size="small"
                variant="text"
                onClick={() => toggleEdit('phone')}
                startIcon={isEditing.phone ? <CheckIcon sx={{ fontSize: '0.9rem' }} /> : <EditIcon sx={{ fontSize: '0.9rem' }} />}
                sx={{ color: '#3B592D', fontWeight: '700', textTransform: 'none', '&:hover': { background: '#f1f5f9' } }}
              >
                {isEditing.phone ? 'Done' : 'Edit'}
              </Button>
            </Box>
          </Box>

          <Divider sx={{ borderColor: '#f1f5f9' }} />

         {/* FIELD MODULE: PASSWORD WITH TOGGLE EYE ICON */}
<Box
  sx={{
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '1rem',
  }}
>
  <Box
    sx={{
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
      flex: 1,
      minWidth: '150px',
    }}
  >
    <LockIcon sx={{ color: '#94a3b8', fontSize: '1.4rem' }} />

    <Typography
      sx={{
        fontWeight: '600',
        color: '#334155',
        fontSize: '0.95rem',
      }}
    >
      Password
    </Typography>
  </Box>

  <Box
  sx={{
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    flex: 2,
    minWidth: '280px',
    justifyContent: 'flex-end',
    flexWrap: 'nowrap',
  }}
>
    {isEditing.password ? (
<TextField
  size="small"
  type={showPassword ? 'text' : 'password'}
  placeholder="Enter new password"
  value={profile.password}
  onChange={(e) =>
    handleInputChange('password', e.target.value)
  }
  sx={{
    width: '350px',

    '& .MuiOutlinedInput-root': {
      borderRadius: '10px',

      '& fieldset': {
        borderColor: '#cbd5e1',
      },

      '&:hover fieldset': {
        borderColor: '#94a3b8',
      },

      '&.Mui-focused fieldset': {
        borderColor: '#3B592D',
      },
    },
  }}
 InputProps={{
  endAdornment: (
    <InputAdornment
      position="end"
      sx={{
        display: 'flex !important',
        visibility: 'visible !important',
      }}
    >
      <IconButton
        onClick={() => setShowPassword((prev) => !prev)}
        edge="end"
        sx={{
          color: 'black !important',
          display: 'flex !important',
          visibility: 'visible !important',
        }}
      >
        {showPassword ? <VisibilityOff /> : <Visibility />}
      </IconButton>
    </InputAdornment>
  ),
}}
/>
    ) : (
      <Typography
        sx={{
          color: '#64748b',
          fontSize: '0.95rem',
          fontWeight: '500',
        }}
      >
        {profile.password}
      </Typography>
    )}

    <Button
      size="small"
      variant="text"
      onClick={() => toggleEdit('password')}
      startIcon={
        isEditing.password ? (
          <CheckIcon sx={{ fontSize: '0.9rem' }} />
        ) : (
          <EditIcon sx={{ fontSize: '0.9rem' }} />
        )
      }
      sx={{
        color: '#3B592D',
        fontWeight: '700',
        textTransform: 'none',
        whiteSpace: 'nowrap',

        '&:hover': {
          background: '#f1f5f9',
        },
      }}
    >
      {isEditing.password ? 'Done' : 'Change'}
    </Button>
  </Box>
</Box>
          {/* BUTTON FOOTER FORM ACTIONS */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '1.5rem', marginTop: '1.5rem', borderTop: '1px solid #f1f5f9', paddingTop: '1.5rem' }}>
            <Button
              variant="text"
              onClick={handleUndoChanges}
              sx={{
                color: '#64748b',
                fontWeight: '600',
                textTransform: 'none',
                fontSize: '0.95rem',
                '&:hover': { background: '#f8fafc', color: '#1e293b' }
              }}
            >
              Undo Changes
            </Button>
            <Button
              type="submit"
              variant="contained"
              sx={{
                background: '#3B592D',
                color: '#ffffff',
                borderRadius: '10px',
                padding: '0.6rem 2rem',
                fontWeight: '600',
                textTransform: 'none',
                boxShadow: 'none',
                fontSize: '0.95rem',
                '&:hover': { background: '#2c4322', boxShadow: 'none' }
              }}
            >
              Save Preferences
            </Button>
          </Box>

        </Box>
      </Paper>
    </Box>
  );
};

export default Setting;
import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Paper from '@mui/material/Paper';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import AlternateEmailIcon from '@mui/icons-material/AlternateEmail';
import PhoneAndroidIcon from '@mui/icons-material/PhoneAndroid';
import LockIcon from '@mui/icons-material/Lock';
import EditIcon from '@mui/icons-material/Edit';
import CheckIcon from '@mui/icons-material/Check';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

const AdminSetting = ({ userId }) => {
  const [profile, setProfile] = useState({
    name: 'Admin User',
    email: 'admin@eduvantaa.com',
    password: '••••••••',
  });

  const [isEditing, setIsEditing] = useState({
    name: false,
    email: false,
    password: false,
  });

  const [showPassword, setShowPassword] = useState(false);

  // 1. Load data from 'admin' object instead of 'user' object
  useEffect(() => {
    const storedAdmin = localStorage.getItem('admin'); // ✅ Changed from 'user' to 'admin'
    if (storedAdmin) {
      try {
        const parsed = JSON.parse(storedAdmin);
        setProfile((prev) => ({
          ...prev,
          // Fallback to username or name depending on how your Admin table returns fields
          name: parsed.username || parsed.name || prev.name, 
          email: parsed.email || prev.email,
         password: '••••••••',
        }));
      } catch (e) {
        console.error("Failed to parse admin session info:", e);
      }
    }
  }, [userId]);

  const handleInputChange = (field, value) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  const toggleEdit = (field) => {
    setIsEditing((prev) => {
      const updatedEditing = { ...prev, [field]: !prev[field] };
      if (field === 'password' && updatedEditing.password && profile.password === '••••••••') {
        setProfile(p => ({ ...p, password: '' }));
      }
      return updatedEditing;
    });

    if (field === 'password') {
      setShowPassword(false);
    }
  };

  // 2. Adjust update endpoint if your backend separates users and admin tables
  const handleSavePreferences = async (e) => {
    e.preventDefault();

    try {
      // ✅ Note: Make sure your Express/Backend endpoint below handles the 'admins' table updates
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/admin/profile/update`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId, 
            name: profile.name,
            email: profile.email,
            password: profile.password === '••••••••' ? '' : profile.password,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        // ✅ Updates 'admin' in localStorage so it persists correctly upon refresh
       localStorage.setItem(
  "admin",
  JSON.stringify({
    ...data.admin
  })
);
        alert("🎉 Admin profile updated successfully!");

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
      alert("Failed to save administrative profile changes.");
    }
  };

  const handleUndoChanges = () => {
    const storedAdmin = localStorage.getItem('admin'); // ✅ Changed from 'user' to 'admin'
    if (storedAdmin) {
      const parsed = JSON.parse(storedAdmin);
      setProfile({
        name: parsed.username || parsed.name || 'Admin User',
        email: parsed.email || 'admin@eduvantaa.com',
        password: '••••••••',
      });
    }
    setIsEditing({ name: false, email: false, phone: false, password: false });
    setShowPassword(false);
  };

  return (
    <Box sx={{ padding: { xs: '1rem', sm: '1.5rem', md: '2rem' }, boxSizing: 'border-box' }}>
      <Box sx={{ marginBottom: '2.5rem' }}>
        <Typography variant="h4" sx={{ fontSize: { xs: '1.5rem', sm: '1.85rem' }, fontWeight: '800', color: '#1e293b', marginBottom: '0.5rem' }}>
          Admin Console Settings
        </Typography>
        <Typography sx={{ color: '#64748b', fontSize: '0.95rem' }}>
          Manage your administrative profile properties, configure operational communication endpoints, and reset workspace system credentials.
        </Typography>
      </Box>

      <Paper
        elevation={0}
        sx={{
          padding: { xs: '1.25rem', sm: '2.5rem' },
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '16px',
          boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)',
          maxWidth: '800px',
          margin: '0 auto'
        }}
      >
        <Box component="form" onSubmit={handleSavePreferences} sx={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* FIELD MODULE: ADMIN NAME */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, flexDirection: { xs: 'column', sm: 'row' }, gap: '1rem' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: '1rem', minWidth: '150px' }}>
              <AdminPanelSettingsIcon sx={{ color: '#94a3b8', fontSize: '1.4rem' }} />
              <Typography sx={{ fontWeight: '600', color: '#334155', fontSize: '0.95rem' }}>Admin Name</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flex: 1, width: '100%', justifyContent: { xs: 'space-between', sm: 'flex-end' } }}>
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
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, flexDirection: { xs: 'column', sm: 'row' }, gap: '1rem' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: '1rem', minWidth: '150px' }}>
              <AlternateEmailIcon sx={{ color: '#94a3b8', fontSize: '1.4rem' }} />
              <Typography sx={{ fontWeight: '600', color: '#334155', fontSize: '0.95rem' }}>Email Address</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flex: 1, width: '100%', justifyContent: { xs: 'space-between', sm: 'flex-end' } }}>
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

          {/* FIELD MODULE: PASSWORD */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, flexDirection: { xs: 'column', sm: 'row' }, gap: '1rem' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: '1rem', minWidth: '150px' }}>
              <LockIcon sx={{ color: '#94a3b8', fontSize: '1.4rem' }} />
              <Typography sx={{ fontWeight: '600', color: '#334155', fontSize: '0.95rem' }}>Password</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1, width: '100%', justifyContent: { xs: 'space-between', sm: 'flex-end' } }}>
              {isEditing.password ? (
                <TextField
                  size="small"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter new admin password"
                  value={profile.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  sx={{
                    width: '100%',
                    maxWidth: '350px',
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '10px',
                      '& fieldset': { borderColor: '#cbd5e1' },
                      '&:hover fieldset': { borderColor: '#94a3b8' },
                      '&.Mui-focused fieldset': { borderColor: '#3B592D' },
                    },
                  }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end" sx={{ display: 'flex !important', visibility: 'visible !important' }}>
                        <IconButton
                          onClick={() => setShowPassword((prev) => !prev)}
                          edge="end"
                          sx={{ color: 'black !important', display: 'flex !important', visibility: 'visible !important' }}
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              ) : (
                <Typography sx={{ color: '#64748b', fontSize: '0.95rem', fontWeight: '500' }}>{profile.password}</Typography>
              )}
              <Button
                size="small"
                variant="text"
                onClick={() => toggleEdit('password')}
                startIcon={isEditing.password ? <CheckIcon sx={{ fontSize: '0.9rem' }} /> : <EditIcon sx={{ fontSize: '0.9rem' }} />}
                sx={{ color: '#3B592D', fontWeight: '700', textTransform: 'none', whiteSpace: 'nowrap', '&:hover': { background: '#f1f5f9' } }}
              >
                {isEditing.password ? 'Done' : 'Change'}
              </Button>
            </Box>
          </Box>

          {/* BUTTON FOOTER FORM ACTIONS */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '1rem', marginTop: '1.5rem', borderTop: '1px solid #f1f5f9', paddingTop: '1.5rem', flexDirection: { xs: 'column-reverse', sm: 'row' } }}>
            <Button
              variant="text"
              onClick={handleUndoChanges}
              sx={{
                color: '#64748b',
                fontWeight: '600',
                textTransform: 'none',
                fontSize: '0.95rem',
                width: { xs: '100%', sm: 'auto' },
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
                width: { xs: '100%', sm: 'auto' },
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

export default AdminSetting;
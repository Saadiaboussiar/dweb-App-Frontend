import React, { useState } from 'react';
import {
  Container,
  Paper,
  Avatar,
  Typography,
  TextField,
  Button,
  Grid,
  Box,
  Divider,
  Switch,
  FormControlLabel,
  InputAdornment,
  IconButton
} from '@mui/material';
import {
  Edit as EditIcon,
  Visibility,
  VisibilityOff,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon
} from '@mui/icons-material';

const ProfilePage = () => {
  const [userData, setUserData] = useState({
    name: 'Alex Johnson',
    email: 'alex.johnson@company.com',
    phone: '+1 (555) 123-4567',
    location: 'San Francisco, CA',
    title: 'Senior Technician',
    department: 'Technical Operations',
    avatar: '/static/images/avatar/1.jpg'
  });

  const [editing, setEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setUserData({
      ...userData,
      [field]: value
    });
  };

  const handleSave = () => {
    setEditing(false);
    console.log('Saved data:', userData);
  };

  const handleCancel = () => {
    setEditing(false);
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={2} sx={{ p: 4, borderRadius: 2 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4, flexDirection: { xs: 'column', sm: 'row' }, textAlign: { xs: 'center', sm: 'left' } }}>
          <Avatar
            src={userData.avatar}
            sx={{ width: 80, height: 80, mr: { sm: 3 }, mb: { xs: 2, sm: 0 } }}
          >
            <PersonIcon sx={{ fontSize: 40 }} />
          </Avatar>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h5" component="h1" fontWeight="600">
              {userData.name}
            </Typography>
            <Typography variant="body1" color="textSecondary">
              {userData.title} • {userData.department}
            </Typography>
          </Box>
          <Button
            variant={editing ? "outlined" : "contained"}
            startIcon={<EditIcon />}
            onClick={() => editing ? handleSave() : setEditing(true)}
            sx={{ mt: { xs: 2, sm: 0 } }}
          >
            {editing ? 'Save Changes' : 'Edit Profile'}
          </Button>
        </Box>

        <Divider sx={{ mb: 4 }} />

        {/* Profile Form */}
        <Grid container spacing={3}>
          {/* Name Field */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              label="Full Name"
              value={userData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              disabled={!editing}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          {/* Title Field */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              label="Job Title"
              value={userData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              disabled={!editing}
            />
          </Grid>

          {/* Email Field */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              label="Email Address"
              type="email"
              value={userData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              disabled={!editing}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          {/* Phone Field */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              label="Phone Number"
              value={userData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              disabled={!editing}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PhoneIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          {/* Location Field */}
          <Grid size={12}>
            <TextField
              fullWidth
              label="Location"
              value={userData.location}
              onChange={(e) => handleInputChange('location', e.target.value)}
              disabled={!editing}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LocationIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          {/* Department Field */}
          <Grid size={12}>
            <TextField
              fullWidth
              label="Department"
              value={userData.department}
              onChange={(e) => handleInputChange('department', e.target.value)}
              disabled={!editing}
            />
          </Grid>
          
          {/* Password Change Section */}
          <Grid size={12}>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6" gutterBottom>
              Change Password
            </Typography>
          </Grid>
          
          {/* New Password Field */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              label="New Password"
              type={showPassword ? 'text' : 'password'}
              disabled={!editing}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          
          {/* Confirm Password Field */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              label="Confirm Password"
              type={showPassword ? 'text' : 'password'}
              disabled={!editing}
            />
          </Grid>
          
          {/* Preferences Section */}
          <Grid size={12}>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6" gutterBottom>
              Preferences
            </Typography>
            <FormControlLabel
              control={<Switch defaultChecked />}
              label="Email Notifications"
              disabled={!editing}
            />
          </Grid>
        </Grid>

        {/* Action Buttons when editing */}
        {editing && (
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 4 }}>
            <Button variant="outlined" onClick={handleCancel}>
              Cancel
            </Button>
            <Button variant="contained" onClick={handleSave}>
              Save Changes
            </Button>
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default ProfilePage;
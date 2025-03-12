import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Alert,
  Grid,
  Avatar,
  IconButton,
  CircularProgress,
} from '@mui/material';
import { useAuth } from '../../contexts/shared/AuthContext';
import { doctorService } from '../../services/doctor/doctor.service';
import { DoctorProfile } from '../../types/shared/auth.types';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import { API_BASE_URL } from '../../config/api.config';

const ProfileEditor: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState<DoctorProfile | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<Partial<DoctorProfile>>({
    specialty: '',
    education: '',
    qualification: '',
    description: '',
    siteUrl: '',
    phone: '',
    email: '',
    location: '',
    languages: '',
  });

  // Load profile data once on mount
  useEffect(() => {
    const loadProfile = async () => {
      try {
        setIsLoading(true);
        const fetchedProfile = await doctorService.getProfile();
        setProfile(fetchedProfile);
        setFormData({
          specialty: fetchedProfile.specialty || '',
          education: fetchedProfile.education || '',
          qualification: fetchedProfile.qualification || '',
          description: fetchedProfile.description || '',
          siteUrl: fetchedProfile.siteUrl || '',
          phone: fetchedProfile.phone || '',
          email: fetchedProfile.email || '',
          location: fetchedProfile.location || '',
          languages: fetchedProfile.languages || '',
        });
      } catch (err: any) {
        console.error('Error loading profile:', err);
        if (err.response?.status === 401 || err.response?.data?.error === 'No token provided') {
          setError('You have been logged out. Please log in again.');
        } else {
          setError(err.response?.data?.error || 'Failed to load profile');
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, []); // Empty dependency array - only run once on mount

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      try {
        setIsSubmitting(true);
        setError(null);

        const file = e.target.files[0];

        // Validate file size (max 2MB)
        if (file.size > 2 * 1024 * 1024) {
          setError('File size must be less than 2MB');
          return;
        }

        // Validate file type
        if (!file.type.startsWith('image/')) {
          setError('Only image files are allowed');
          return;
        }

        const updatedProfile = await doctorService.uploadPhoto(file);
        setProfile(updatedProfile);
        updateUser({
          ...user!,
          doctorProfile: updatedProfile,
        });
        setSuccess('Photo updated successfully');
      } catch (err: any) {
        console.error('Error in handlePhotoChange:', err);
        setError(err.response?.data?.message || err.response?.data?.error || 'Failed to upload photo');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const updatedProfile = await doctorService.updateProfile(formData);
      setProfile(updatedProfile);
      updateUser({
        ...user!,
        doctorProfile: updatedProfile,
      });
      setSuccess('Profile updated successfully');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Paper elevation={3} sx={{ p: 4, maxWidth: 800, mx: 'auto', mt: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
        {profile?.photoUrl && (
          <Box sx={{ position: 'relative' }}>
            <Avatar
              src={profile?.photoUrl ? `${API_BASE_URL}${profile.photoUrl}` : ''}
              alt={user?.username || ''}
              sx={{
                width: 100,
                height: 100,
                mr: 2,
                bgcolor: 'primary.main',
              }}
              key={profile?.photoUrl}
              imgProps={{
                onError: (e) => {
                  console.error(
                    'Error loading image. URL:',
                    profile?.photoUrl ? `${API_BASE_URL}${profile.photoUrl}` : ''
                  );
                  const imgElement = e.target as HTMLImageElement;
                  imgElement.src = ''; // Clear the src to show the fallback
                },
              }}
            >
              {user?.username?.charAt(0).toUpperCase()}
            </Avatar>
          </Box>
        )}
        {!profile?.photoUrl && (
          <Avatar
            sx={{
              width: 100,
              height: 100,
              mr: 2,
              bgcolor: 'primary.main',
            }}
          >
            {user?.username?.charAt(0).toUpperCase()}
          </Avatar>
        )}
        <Box>
          <input
            type="file"
            ref={fileInputRef}
            style={{ display: 'none' }}
            accept="image/*"
            onChange={handlePhotoChange}
          />
          <Button variant="contained" startIcon={<PhotoCamera />} onClick={handlePhotoClick} disabled={isSubmitting}>
            {profile?.photoUrl ? 'Change Photo' : 'Upload Photo'}
          </Button>
        </Box>
      </Box>

      <Typography variant="h5" component="h1" gutterBottom>
        Edit Profile
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              name="specialty"
              label="Medical Specialty"
              value={formData.specialty}
              onChange={handleChange}
              margin="normal"
              disabled={isSubmitting}
              required
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              name="education"
              label="Education"
              value={formData.education}
              onChange={handleChange}
              margin="normal"
              disabled={isSubmitting}
              required
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              name="qualification"
              label="Qualification"
              value={formData.qualification}
              onChange={handleChange}
              margin="normal"
              disabled={isSubmitting}
              required
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={4}
              name="description"
              label="Professional Description"
              value={formData.description}
              onChange={handleChange}
              margin="normal"
              disabled={isSubmitting}
              required
              placeholder="Describe your professional experience, expertise, and approach to patient care"
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              name="phone"
              label="Phone Number"
              value={formData.phone}
              onChange={handleChange}
              margin="normal"
              disabled={isSubmitting}
              required
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              name="email"
              label="Email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              margin="normal"
              disabled={isSubmitting}
              required
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              name="location"
              label="Location"
              value={formData.location}
              onChange={handleChange}
              margin="normal"
              disabled={isSubmitting}
              required
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              name="languages"
              label="Languages"
              value={formData.languages}
              onChange={handleChange}
              margin="normal"
              disabled={isSubmitting}
              required
              helperText="Enter languages separated by commas"
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              name="siteUrl"
              label="Website URL (optional)"
              value={formData.siteUrl}
              onChange={handleChange}
              margin="normal"
              disabled={isSubmitting}
            />
          </Grid>
        </Grid>

        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
          <Button type="submit" variant="contained" color="primary" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </Button>
        </Box>
      </form>
    </Paper>
  );
};

export default ProfileEditor;

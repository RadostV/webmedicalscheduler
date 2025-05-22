import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { API_BASE_URL } from '../../config/api.config';

interface DoctorProfileEditorProps {
  readOnly?: boolean;
  doctorId?: string;
}

const DoctorProfileEditor: React.FC<DoctorProfileEditorProps> = ({ readOnly = false, doctorId }) => {
  const navigate = useNavigate();
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
        setError(null);
        let fetchedProfile;

        if (readOnly && doctorId) {
          // If in read-only mode and doctorId provided, fetch that specific doctor's profile
          fetchedProfile = await doctorService.getDoctorProfile(doctorId);
        } else if (!readOnly) {
          // If in edit mode, use the current doctor's profile via auth
          fetchedProfile = await doctorService.getProfile();
        } else {
          throw new Error('Invalid component configuration');
        }

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
        setError(err.message || 'Failed to load profile');
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [doctorId, readOnly]);

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

  const handleBack = () => {
    navigate('/patient/search-doctors');
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
      {readOnly && (
        <Box sx={{ mb: 2 }}>
          <Button startIcon={<ArrowBackIcon />} onClick={handleBack} variant="text" sx={{ ml: -1 }}>
            Back to Search Results
          </Button>
        </Box>
      )}

      {profile && profile.name && (
        <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ mb: 3 }}>
          {profile.name}
        </Typography>
      )}

      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
        {profile?.photoUrl ? (
          <Box sx={{ position: 'relative' }}>
            <Avatar
              src={profile.photoUrl.startsWith('http') ? profile.photoUrl : `${API_BASE_URL}${profile.photoUrl}`}
              alt={profile?.name || ''}
              sx={{
                width: 100,
                height: 100,
                mr: 2,
                bgcolor: 'primary.main',
              }}
              imgProps={{
                onError: (e) => {
                  console.error('Failed to load image:', profile.photoUrl);
                  const imgElement = e.target as HTMLImageElement;
                  imgElement.src = ''; // Clear the src to show the fallback
                },
              }}
            >
              {profile?.name?.charAt(0).toUpperCase()}
            </Avatar>
          </Box>
        ) : (
          <Avatar
            sx={{
              width: 100,
              height: 100,
              mr: 2,
              bgcolor: 'primary.main',
            }}
          >
            {profile?.name?.charAt(0).toUpperCase() || '?'}
          </Avatar>
        )}
        {!readOnly && (
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
        )}
      </Box>

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
              disabled={isSubmitting || readOnly}
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
              disabled={isSubmitting || readOnly}
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
              disabled={isSubmitting || readOnly}
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
              disabled={isSubmitting || readOnly}
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
              disabled={isSubmitting || readOnly}
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
              disabled={isSubmitting || readOnly}
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
              disabled={isSubmitting || readOnly}
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
              disabled={isSubmitting || readOnly}
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
              disabled={isSubmitting || readOnly}
            />
          </Grid>
        </Grid>

        {!readOnly && (
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
            <Button type="submit" variant="contained" color="primary" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </Box>
        )}
      </form>
    </Paper>
  );
};

export default DoctorProfileEditor;

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
import { patientService } from '../../services/patient/patient.service';
import { PatientProfile } from '../../types/shared/auth.types';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { API_BASE_URL } from '../../config/api.config';

interface PatientProfileEditorProps {
  readOnly?: boolean;
  patientId?: string;
}

const PatientProfileEditor: React.FC<PatientProfileEditorProps> = ({ readOnly = false, patientId }) => {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState<PatientProfile | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<Partial<PatientProfile>>({
    dateOfBirth: '',
    gender: '',
    medicalHistory: '',
    allergies: '',
    medications: '',
    bloodType: '',
    phone: '',
    email: '',
    address: '',
    emergencyContact: '',
  });

  // Load profile data once on mount
  useEffect(() => {
    const loadProfile = async () => {
      try {
        setIsLoading(true);
        setError(null);
        let fetchedProfile;

        if (readOnly && patientId) {
          // If in read-only mode and patientId provided, fetch that specific patient's profile
          fetchedProfile = await patientService.getPatientProfile(patientId);
        } else if (!readOnly) {
          // If in edit mode, use the current patient's profile via auth
          fetchedProfile = await patientService.getProfile();
        } else {
          throw new Error('Invalid component configuration');
        }

        setProfile(fetchedProfile);
        setFormData({
          dateOfBirth: fetchedProfile.dateOfBirth || '',
          gender: fetchedProfile.gender || '',
          medicalHistory: fetchedProfile.medicalHistory || '',
          allergies: fetchedProfile.allergies || '',
          medications: fetchedProfile.medications || '',
          bloodType: fetchedProfile.bloodType || '',
          phone: fetchedProfile.phone || '',
          email: fetchedProfile.email || '',
          address: fetchedProfile.address || '',
          emergencyContact: fetchedProfile.emergencyContact || '',
        });
      } catch (err: any) {
        console.error('Error loading profile:', err);
        setError(err.message || 'Failed to load profile');
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [patientId, readOnly]);

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

        const updatedProfile = await patientService.uploadPhoto(file);
        setProfile(updatedProfile);
        updateUser({
          ...user!,
          patientProfile: updatedProfile,
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
      const updatedProfile = await patientService.updateProfile(formData);
      setProfile(updatedProfile);
      updateUser({
        ...user!,
        patientProfile: updatedProfile,
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
        <CircularProgress sx={{ color: '#4caf50' }} />
      </Box>
    );
  }

  return (
    <Paper elevation={3} sx={{ p: 4, maxWidth: 800, mx: 'auto', mt: 4, bgcolor: '#f1f8e9' }}>
      {profile && profile.name && (
        <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ mb: 3, color: '#2e7d32' }}>
          {profile.name}'s Profile
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
                bgcolor: '#4caf50',
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
              bgcolor: '#4caf50',
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
            <Button
              variant="contained"
              startIcon={<PhotoCamera />}
              onClick={handlePhotoClick}
              disabled={isSubmitting}
              sx={{ bgcolor: '#4caf50', '&:hover': { bgcolor: '#388e3c' } }}
            >
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
        <Alert severity="success" sx={{ mb: 2, bgcolor: '#e8f5e9', color: '#2e7d32' }}>
          {success}
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              name="dateOfBirth"
              label="Date of Birth"
              type="date"
              value={formData.dateOfBirth}
              onChange={handleChange}
              margin="normal"
              disabled={isSubmitting || readOnly}
              InputLabelProps={{ shrink: true }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '&.Mui-focused fieldset': {
                    borderColor: '#4caf50',
                  },
                },
                '& .MuiInputLabel-root.Mui-focused': {
                  color: '#4caf50',
                },
              }}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              name="gender"
              label="Gender"
              value={formData.gender}
              onChange={handleChange}
              margin="normal"
              disabled={isSubmitting || readOnly}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '&.Mui-focused fieldset': {
                    borderColor: '#4caf50',
                  },
                },
                '& .MuiInputLabel-root.Mui-focused': {
                  color: '#4caf50',
                },
              }}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              name="bloodType"
              label="Blood Type"
              value={formData.bloodType}
              onChange={handleChange}
              margin="normal"
              disabled={isSubmitting || readOnly}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '&.Mui-focused fieldset': {
                    borderColor: '#4caf50',
                  },
                },
                '& .MuiInputLabel-root.Mui-focused': {
                  color: '#4caf50',
                },
              }}
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
              sx={{
                '& .MuiOutlinedInput-root': {
                  '&.Mui-focused fieldset': {
                    borderColor: '#4caf50',
                  },
                },
                '& .MuiInputLabel-root.Mui-focused': {
                  color: '#4caf50',
                },
              }}
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
              sx={{
                '& .MuiOutlinedInput-root': {
                  '&.Mui-focused fieldset': {
                    borderColor: '#4caf50',
                  },
                },
                '& .MuiInputLabel-root.Mui-focused': {
                  color: '#4caf50',
                },
              }}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              name="emergencyContact"
              label="Emergency Contact"
              value={formData.emergencyContact}
              onChange={handleChange}
              margin="normal"
              disabled={isSubmitting || readOnly}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '&.Mui-focused fieldset': {
                    borderColor: '#4caf50',
                  },
                },
                '& .MuiInputLabel-root.Mui-focused': {
                  color: '#4caf50',
                },
              }}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              name="address"
              label="Address"
              value={formData.address}
              onChange={handleChange}
              margin="normal"
              disabled={isSubmitting || readOnly}
              required
              sx={{
                '& .MuiOutlinedInput-root': {
                  '&.Mui-focused fieldset': {
                    borderColor: '#4caf50',
                  },
                },
                '& .MuiInputLabel-root.Mui-focused': {
                  color: '#4caf50',
                },
              }}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={3}
              name="allergies"
              label="Allergies"
              value={formData.allergies}
              onChange={handleChange}
              margin="normal"
              disabled={isSubmitting || readOnly}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '&.Mui-focused fieldset': {
                    borderColor: '#4caf50',
                  },
                },
                '& .MuiInputLabel-root.Mui-focused': {
                  color: '#4caf50',
                },
              }}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={3}
              name="medications"
              label="Current Medications"
              value={formData.medications}
              onChange={handleChange}
              margin="normal"
              disabled={isSubmitting || readOnly}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '&.Mui-focused fieldset': {
                    borderColor: '#4caf50',
                  },
                },
                '& .MuiInputLabel-root.Mui-focused': {
                  color: '#4caf50',
                },
              }}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={4}
              name="medicalHistory"
              label="Medical History"
              value={formData.medicalHistory}
              onChange={handleChange}
              margin="normal"
              disabled={isSubmitting || readOnly}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '&.Mui-focused fieldset': {
                    borderColor: '#4caf50',
                  },
                },
                '& .MuiInputLabel-root.Mui-focused': {
                  color: '#4caf50',
                },
              }}
            />
          </Grid>
        </Grid>

        {!readOnly && (
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              type="submit"
              variant="contained"
              disabled={isSubmitting}
              sx={{ bgcolor: '#4caf50', '&:hover': { bgcolor: '#388e3c' } }}
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </Box>
        )}
      </form>
    </Paper>
  );
};

export default PatientProfileEditor;

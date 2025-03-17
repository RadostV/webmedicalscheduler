import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Alert,
  Grid,
  Avatar,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Divider,
  Chip,
} from '@mui/material';
import { doctorService } from '../../services/doctor/doctor.service';
import { DoctorProfile } from '../../types/shared/auth.types';
import { API_BASE_URL } from '../../config/api.config';

interface DoctorProfileViewerProps {
  doctorId: string;
}

const DoctorProfileViewer: React.FC<DoctorProfileViewerProps> = ({ doctorId }) => {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState<DoctorProfile | null>(null);

  // Load profile data once on mount
  useEffect(() => {
    const loadProfile = async () => {
      if (!doctorId) {
        setError('No doctor ID provided');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        console.log('Loading profile for doctor:', doctorId);
        const fetchedProfile = await doctorService.getDoctorProfile(doctorId);

        if (!fetchedProfile) {
          setError('No profile data received');
          return;
        }

        setProfile(fetchedProfile);
      } catch (err: any) {
        console.error('Error in DoctorProfileViewer:', err);
        let errorMessage = "Failed to load doctor's profile. ";

        if (err.message) {
          errorMessage += err.message;
        } else if (err.response?.data?.message) {
          errorMessage += err.response.data.message;
        } else if (err.response?.status === 404) {
          errorMessage = 'Doctor profile not found.';
        }

        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [doctorId]);

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !profile) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error || "Failed to load doctor's profile"}</Alert>
      </Box>
    );
  }

  return (
    <Paper elevation={3} sx={{ p: 4, maxWidth: 800, mx: 'auto', mt: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
        {profile.photoUrl ? (
          <Avatar
            src={`${API_BASE_URL}${profile.photoUrl}`}
            alt={profile.name}
            sx={{
              width: 100,
              height: 100,
              mr: 2,
              bgcolor: 'primary.main',
            }}
            imgProps={{
              onError: (e) => {
                const imgElement = e.target as HTMLImageElement;
                imgElement.src = '';
              },
            }}
          >
            {profile.name.charAt(0).toUpperCase()}
          </Avatar>
        ) : (
          <Avatar
            sx={{
              width: 100,
              height: 100,
              mr: 2,
              bgcolor: 'primary.main',
            }}
          >
            {profile.name.charAt(0).toUpperCase()}
          </Avatar>
        )}
        <Box>
          <Typography variant="h5" component="h1">
            {profile.name}
          </Typography>
          <Typography variant="subtitle1" color="textSecondary">
            {profile.specialty}
          </Typography>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <List>
        {profile.education && (
          <>
            <ListItem>
              <ListItemText primary="Education" secondary={profile.education} />
            </ListItem>
            <Divider />
          </>
        )}

        {profile.qualification && (
          <>
            <ListItem>
              <ListItemText primary="Qualifications" secondary={profile.qualification} />
            </ListItem>
            <Divider />
          </>
        )}

        {profile.description && (
          <>
            <ListItem>
              <ListItemText primary="About" secondary={profile.description} />
            </ListItem>
            <Divider />
          </>
        )}

        {profile.languages && (
          <>
            <ListItem>
              <ListItemText
                primary="Languages"
                secondary={
                  <Box sx={{ mt: 1 }}>
                    {profile.languages.split(',').map((lang) => (
                      <Chip key={lang.trim()} label={lang.trim()} size="small" sx={{ mr: 0.5, mb: 0.5 }} />
                    ))}
                  </Box>
                }
              />
            </ListItem>
            <Divider />
          </>
        )}

        {profile.location && (
          <>
            <ListItem>
              <ListItemText primary="Location" secondary={profile.location} />
            </ListItem>
            <Divider />
          </>
        )}

        {profile.phone && (
          <>
            <ListItem>
              <ListItemText primary="Phone" secondary={profile.phone} />
            </ListItem>
            <Divider />
          </>
        )}

        {profile.email && (
          <>
            <ListItem>
              <ListItemText primary="Email" secondary={profile.email} />
            </ListItem>
            <Divider />
          </>
        )}

        {profile.siteUrl && (
          <ListItem>
            <ListItemText
              primary="Website"
              secondary={
                <a href={profile.siteUrl} target="_blank" rel="noopener noreferrer">
                  {profile.siteUrl}
                </a>
              }
            />
          </ListItem>
        )}
      </List>
    </Paper>
  );
};

export default DoctorProfileViewer;

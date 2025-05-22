import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  Chip,
  Avatar,
  Button,
  CircularProgress,
  Alert,
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { patientService } from '../../services/patient/patient.service';
import { DoctorProfile as DoctorProfileType } from '../../types/shared/auth.types';
import { API_BASE_URL } from '../../config/api.config';

const DoctorProfile: React.FC = () => {
  const { doctorId } = useParams<{ doctorId: string }>();
  const [doctor, setDoctor] = useState<DoctorProfileType | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDoctorProfile = async () => {
      if (!doctorId) return;

      try {
        setLoading(true);
        const doctorData = await patientService.getDoctorProfile(doctorId);
        setDoctor(doctorData);
        setError(null);
      } catch (err) {
        console.error('Error fetching doctor profile:', err);
        setError('Failed to load doctor profile. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchDoctorProfile();
  }, [doctorId]);

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  if (!doctor) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="warning">Doctor not found</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Box sx={{ mb: 3 }}>
        <Button component={Link} to="/patient/search-doctors" startIcon={<ArrowBack />} sx={{ mb: 2 }}>
          Back to Search Results
        </Button>

        <Typography variant="h4" component="h1" gutterBottom>
          {doctor.name}
        </Typography>
      </Box>

      <Paper sx={{ p: 4, bgcolor: '#f9fff0' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
          {doctor.photoUrl ? (
            <Avatar src={`${API_BASE_URL}${doctor.photoUrl}`} alt={doctor.name} sx={{ width: 120, height: 120 }} />
          ) : (
            <Avatar sx={{ width: 120, height: 120, fontSize: '3rem' }}>{doctor.name.charAt(0)}</Avatar>
          )}
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <TextField
              label="Medical Specialty"
              value={doctor.specialty || ''}
              fullWidth
              margin="normal"
              InputProps={{ readOnly: true }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              label="Education"
              value={doctor.education || ''}
              fullWidth
              margin="normal"
              InputProps={{ readOnly: true }}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Qualification"
              value={doctor.qualification || ''}
              fullWidth
              margin="normal"
              InputProps={{ readOnly: true }}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Professional Description"
              value={doctor.description || ''}
              fullWidth
              multiline
              rows={4}
              margin="normal"
              InputProps={{ readOnly: true }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              label="Phone Number"
              value={doctor.phone || ''}
              fullWidth
              margin="normal"
              InputProps={{ readOnly: true }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              label="Email"
              value={doctor.email || ''}
              fullWidth
              margin="normal"
              InputProps={{ readOnly: true }}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Location"
              value={doctor.location || ''}
              fullWidth
              margin="normal"
              InputProps={{ readOnly: true }}
            />
          </Grid>
          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom>
              Languages
            </Typography>
            {doctor.languages ? (
              <Box>
                {doctor.languages.split(',').map((lang) => (
                  <Chip key={lang.trim()} label={lang.trim()} sx={{ mr: 1, mb: 1 }} />
                ))}
              </Box>
            ) : (
              <Typography color="textSecondary">No languages specified</Typography>
            )}
          </Grid>
        </Grid>

        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
          <Button
            variant="contained"
            color="primary"
            component={Link}
            to="/patient/schedule"
            state={{ selectedDoctor: doctor }}
            size="large"
          >
            Book Appointment
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default DoctorProfile;

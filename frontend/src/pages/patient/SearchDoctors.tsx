import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CardActions,
  Container,
  InputAdornment,
  IconButton,
  Chip,
  CircularProgress,
  Alert,
  Avatar,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import { doctorService } from '../../services/doctor/doctor.service';
import { DoctorProfile } from '../../types/shared/auth.types';
import { API_BASE_URL } from '../../config/api.config';

interface SearchFilters {
  specialty: string;
  education: string;
  qualification: string;
  description: string;
  phone: string;
  email: string;
  location: string;
  languages: string;
}

const SearchDoctors: React.FC = () => {
  const navigate = useNavigate();
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [doctors, setDoctors] = useState<DoctorProfile[]>([]);
  const [filters, setFilters] = useState<SearchFilters>({
    specialty: '',
    education: '',
    qualification: '',
    description: '',
    phone: '',
    email: '',
    location: '',
    languages: '',
  });

  const handleFilterChange = (field: keyof SearchFilters) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setFilters((prev) => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  const handleSearch = async () => {
    setLoading(true);
    setError(null);
    try {
      const searchResults = await doctorService.searchDoctors(filters);
      setDoctors(searchResults);
    } catch (error) {
      console.error('Failed to search doctors:', error);
      setError('Failed to search doctors. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClearFilters = () => {
    setFilters({
      specialty: '',
      education: '',
      qualification: '',
      description: '',
      phone: '',
      email: '',
      location: '',
      languages: '',
    });
    setDoctors([]);
    setError(null);
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleSearch();
    }
  };

  const handleBookAppointment = (doctor: DoctorProfile) => {
    navigate('/patient/schedule', { state: { selectedDoctor: doctor } });
  };

  const handleViewProfile = (doctor: DoctorProfile) => {
    navigate(`/patient/doctors/${doctor.id}`);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1" sx={{ flexGrow: 1 }}>
            Search Doctors
          </Typography>
          <Button
            startIcon={<FilterListIcon />}
            onClick={() => setShowFilters(!showFilters)}
            color="primary"
            variant={showFilters ? 'contained' : 'outlined'}
          >
            Filters
          </Button>
        </Box>

        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Search by specialty"
              value={filters.specialty}
              onChange={handleFilterChange('specialty')}
              onKeyPress={handleKeyPress}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={handleSearch} disabled={loading}>
                      {loading ? <CircularProgress size={24} /> : <SearchIcon />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          {showFilters && (
            <>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Education"
                  value={filters.education}
                  onChange={handleFilterChange('education')}
                  onKeyPress={handleKeyPress}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Qualification"
                  value={filters.qualification}
                  onChange={handleFilterChange('qualification')}
                  onKeyPress={handleKeyPress}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  value={filters.description}
                  onChange={handleFilterChange('description')}
                  onKeyPress={handleKeyPress}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Phone"
                  value={filters.phone}
                  onChange={handleFilterChange('phone')}
                  onKeyPress={handleKeyPress}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Email"
                  value={filters.email}
                  onChange={handleFilterChange('email')}
                  onKeyPress={handleKeyPress}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Location"
                  value={filters.location}
                  onChange={handleFilterChange('location')}
                  onKeyPress={handleKeyPress}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Languages"
                  value={filters.languages}
                  onChange={handleFilterChange('languages')}
                  onKeyPress={handleKeyPress}
                />
              </Grid>
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                  <Button variant="outlined" onClick={handleClearFilters} disabled={loading}>
                    Clear Filters
                  </Button>
                  <Button variant="contained" onClick={handleSearch} disabled={loading}>
                    {loading ? <CircularProgress size={24} /> : 'Search'}
                  </Button>
                </Box>
              </Grid>
            </>
          )}
        </Grid>

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}

        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <CircularProgress />
          </Box>
        )}
      </Paper>

      <Grid container spacing={3}>
        {doctors.length === 0 && !loading && !error && (
          <Grid item xs={12}>
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Typography color="textSecondary">No doctors found. Try adjusting your search criteria.</Typography>
            </Paper>
          </Grid>
        )}
        {doctors.map((doctor) => (
          <Grid item xs={12} md={6} lg={4} key={doctor.id}>
            <Card>
              <Box sx={{ p: 2, display: 'flex', alignItems: 'center' }}>
                {doctor.photoUrl ? (
                  <Avatar
                    src={`${API_BASE_URL}${doctor.photoUrl}`}
                    alt={doctor.name}
                    sx={{ width: 60, height: 60, mr: 2 }}
                  />
                ) : (
                  <Avatar sx={{ width: 60, height: 60, mr: 2 }}>{doctor.name.charAt(0).toUpperCase()}</Avatar>
                )}
              </Box>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {doctor.name}
                </Typography>
                <Typography color="textSecondary" gutterBottom>
                  {doctor.specialty}
                </Typography>
                {doctor.languages && (
                  <Box sx={{ mb: 1 }}>
                    {doctor.languages.split(',').map((lang) => (
                      <Chip key={lang.trim()} label={lang.trim()} size="small" sx={{ mr: 0.5, mb: 0.5 }} />
                    ))}
                  </Box>
                )}
                <Typography variant="body2" color="textSecondary">
                  {doctor.location}
                </Typography>
                {doctor.description && (
                  <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                    {doctor.description}
                  </Typography>
                )}
              </CardContent>
              <CardActions>
                <Button size="small" color="primary" onClick={() => handleViewProfile(doctor)}>
                  View Profile
                </Button>
                <Button size="small" color="primary" onClick={() => handleBookAppointment(doctor)}>
                  Book Appointment
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default SearchDoctors;

import React, { useState } from 'react';
import { Box, Button, TextField, Typography, CircularProgress, Alert } from '@mui/material';
import { doctorService } from '../../services/doctor/doctor.service';

interface AppointmentCompletionProps {
  appointmentId: string;
  onComplete: () => void;
  onCancel: () => void;
}

const AppointmentCompletion: React.FC<AppointmentCompletionProps> = ({ appointmentId, onComplete, onCancel }) => {
  const [consultationAnalysis, setConsultationAnalysis] = useState('');
  const [description, setDescription] = useState('');
  const [prescriptionFile, setPrescriptionFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('consultationAnalysis', consultationAnalysis);
      formData.append('description', description);
      if (prescriptionFile) {
        formData.append('prescriptionFile', prescriptionFile);
      }

      await doctorService.completeAppointment(appointmentId, formData);
      onComplete();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to complete appointment');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type === 'application/pdf') {
        setPrescriptionFile(file);
      } else {
        setError('Only PDF files are allowed');
      }
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Typography variant="subtitle1" gutterBottom>
        Complete Appointment
      </Typography>

      <TextField
        fullWidth
        label="Consultation Analysis"
        multiline
        rows={4}
        value={consultationAnalysis}
        onChange={(e) => setConsultationAnalysis(e.target.value)}
        required
        sx={{ mb: 2 }}
      />

      <TextField
        fullWidth
        label="Description"
        multiline
        rows={4}
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        required
        sx={{ mb: 2 }}
      />

      <Box sx={{ mb: 2 }}>
        <input
          accept="application/pdf"
          style={{ display: 'none' }}
          id="prescription-file"
          type="file"
          onChange={handleFileChange}
        />
        <label htmlFor="prescription-file">
          <Button variant="outlined" component="span">
            {prescriptionFile ? prescriptionFile.name : 'Upload Prescription (PDF)'}
          </Button>
        </label>
      </Box>

      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
        <Button onClick={onCancel}>Cancel</Button>
        <Button
          type="submit"
          variant="contained"
          color="primary"
          disabled={loading || !consultationAnalysis || !description}
        >
          {loading ? <CircularProgress size={24} /> : 'Complete Appointment'}
        </Button>
      </Box>
    </Box>
  );
};

export default AppointmentCompletion;

import React from 'react';
import { Container } from '@mui/material';
import PatientProfileEditor from '../../components/patient/PatientProfileEditor';
import { useAuth } from '../../contexts/shared/AuthContext';

const PatientProfile: React.FC = () => {
  const { user } = useAuth();

  if (!user?.id) {
    return null;
  }

  return (
    <Container maxWidth="lg">
      <PatientProfileEditor />
    </Container>
  );
};

export default PatientProfile;

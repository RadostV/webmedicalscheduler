import React from 'react';
import { useParams } from 'react-router-dom';
import { Container } from '@mui/material';
import DoctorProfileEditor from '../../components/doctor/DoctorProfileEditor';

const DoctorProfile: React.FC = () => {
  const { doctorId } = useParams<{ doctorId: string }>();

  if (!doctorId) {
    return null;
  }

  return (
    <Container maxWidth="lg">
      <DoctorProfileEditor readOnly={true} doctorId={doctorId} />
    </Container>
  );
};

export default DoctorProfile;

import React from 'react';
import { useParams } from 'react-router-dom';
import { Container } from '@mui/material';
import DoctorProfileViewer from '../../components/doctor/DoctorProfileViewer';

const DoctorProfile: React.FC = () => {
  const { doctorId } = useParams<{ doctorId: string }>();

  if (!doctorId) {
    return null;
  }

  return (
    <Container>
      <DoctorProfileViewer doctorId={doctorId} />
    </Container>
  );
};

export default DoctorProfile;

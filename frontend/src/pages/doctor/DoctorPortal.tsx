import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Container } from '@mui/material';
import Navbar from '../../components/shared/Navbar';
import Schedule from './Schedule';
import AvailabilityManager from './AvailabilityManager';
import DoctorProfileEditor from '../../components/doctor/DoctorProfileEditor';
import ProtectedRoute from '../../components/shared/ProtectedRoute';

const DoctorPortal: React.FC = () => {
  return (
    <>
      <Navbar />
      <Container>
        <Routes>
          <Route
            path="schedule"
            element={
              <ProtectedRoute requiredRole="doctor">
                <Schedule />
              </ProtectedRoute>
            }
          />
          <Route
            path="availability"
            element={
              <ProtectedRoute requiredRole="doctor">
                <AvailabilityManager />
              </ProtectedRoute>
            }
          />
          <Route
            path="profile"
            element={
              <ProtectedRoute requiredRole="doctor">
                <DoctorProfileEditor />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="schedule" replace />} />
        </Routes>
      </Container>
    </>
  );
};

export default DoctorPortal;

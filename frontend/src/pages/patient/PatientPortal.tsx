import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Container } from '@mui/material';
import Navbar from '../../components/shared/Navbar';
import AppointmentList from './AppointmentList';
import AppointmentScheduler from './AppointmentScheduler';
import ProtectedRoute from '../../components/shared/ProtectedRoute';

const PatientPortal: React.FC = () => {
  return (
    <>
      <Navbar />
      <Container>
        <Routes>
          <Route
            path="appointments"
            element={
              <ProtectedRoute requiredRole="patient">
                <AppointmentList />
              </ProtectedRoute>
            }
          />
          <Route
            path="schedule"
            element={
              <ProtectedRoute requiredRole="patient">
                <AppointmentScheduler />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="appointments" replace />} />
        </Routes>
      </Container>
    </>
  );
};

export default PatientPortal;

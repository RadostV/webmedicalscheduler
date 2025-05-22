import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Container } from '@mui/material';
import Navbar from '../../components/shared/Navbar';
import AppointmentList from './AppointmentList';
import AppointmentScheduler from './AppointmentScheduler';
import SearchDoctors from './SearchDoctors';
import DoctorProfile from './DoctorProfile';
import PatientProfile from './PatientProfile';
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
          <Route
            path="search-doctors"
            element={
              <ProtectedRoute requiredRole="patient">
                <SearchDoctors />
              </ProtectedRoute>
            }
          />
          <Route
            path="doctors/:doctorId"
            element={
              <ProtectedRoute requiredRole="patient">
                <DoctorProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="profile"
            element={
              <ProtectedRoute requiredRole="patient">
                <PatientProfile />
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
